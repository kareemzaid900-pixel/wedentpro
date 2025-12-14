
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, Radio } from 'lucide-react';

interface LiveSessionProps {
  onClose: () => void;
}

const FRAME_RATE = 10;
const JPEG_QUALITY = 0.8;

const LiveSession: React.FC<LiveSessionProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  
  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper functions from documentation
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    
    return {
      data: b64,
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove data URL scheme prefix
        resolve(base64data.split(',')[1]); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Initialize Audio Contexts
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);

        // Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Connect to Gemini Live
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              
              // Input Audio Processing
              const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                if (isMuted) return; // Simple mute
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current!.destination);

              // Video Frame Processing
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                frameIntervalRef.current = window.setInterval(async () => {
                  if (isVideoOff || !ctx || !videoRef.current) return;
                  
                  canvasRef.current!.width = videoRef.current.videoWidth;
                  canvasRef.current!.height = videoRef.current.videoHeight;
                  ctx.drawImage(videoRef.current, 0, 0);
                  
                  canvasRef.current!.toBlob(
                    async (blob) => {
                      if (blob) {
                        const base64Data = await blobToBase64(blob);
                        sessionPromise.then((session) => {
                          session.sendRealtimeInput({
                            media: { data: base64Data, mimeType: 'image/jpeg' }
                          });
                        });
                      }
                    },
                    'image/jpeg',
                    JPEG_QUALITY
                  );
                }, 1000 / FRAME_RATE);
              }
            },
            onmessage: async (message: LiveServerMessage) => {
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current) {
                 // Sync timing
                 nextStartTimeRef.current = Math.max(
                    nextStartTimeRef.current,
                    outputAudioContextRef.current.currentTime
                 );

                 const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    outputAudioContextRef.current,
                    24000,
                    1
                 );

                 const source = outputAudioContextRef.current.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNodeRef.current!);
                 source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                 });
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
              }
            },
            onclose: () => {
              setIsConnected(false);
            },
            onerror: (e) => {
              console.error("Session error:", e);
              setError("Connection error");
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are an expert dental consultant. You are watching a live stream from a dentist. Provide real-time advice, second opinions, and answers to their commentary about the clinical case or equipment they are showing. Be professional, concise, and helpful.",
          }
        });
        
        sessionPromiseRef.current = sessionPromise;

      } catch (err) {
        console.error(err);
        setError("Failed to access media devices or connect.");
      }
    };

    startSession();

    return () => {
      // Cleanup
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      sessionPromiseRef.current?.then(session => session.close());
      sourcesRef.current.forEach(s => s.stop());
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
      
      // Stop tracks
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-2 animate-pulse">
             <Radio size={14} /> LIVE
          </div>
          <span className="text-white font-medium text-sm drop-shadow-md">AI Consultation Session</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Video Feed */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
         <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
         />
         {isVideoOff && (
            <div className="text-slate-500 flex flex-col items-center">
                <VideoOff size={48} />
                <p className="mt-2 text-sm">Video Paused</p>
            </div>
         )}
         <canvas ref={canvasRef} className="hidden" />
         
         {!isConnected && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                <div className="text-white font-bold flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connecting to AI Server...</span>
                </div>
            </div>
         )}
         
         {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-6 text-center">
                 <div className="text-red-400">
                     <p className="font-bold text-lg mb-2">Error</p>
                     <p>{error}</p>
                     <button onClick={onClose} className="mt-4 bg-white text-black px-4 py-2 rounded-full font-bold">Close</button>
                 </div>
             </div>
         )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/90 flex justify-center items-center gap-6">
         <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
         >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
         </button>
         
         <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full transition-colors"
         >
            End Stream
         </button>

         <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
         >
            {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
         </button>
      </div>
    </div>
  );
};

export default LiveSession;
