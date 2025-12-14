
import React, { useState, useRef, useEffect } from 'react';
import { Smile, Zap, Heart, Activity, ZoomIn, ZoomOut, Rotate3d, MousePointer2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ThreeDModelViewerProps {
    modelType: string;
    interactive?: boolean;
    language?: 'en' | 'ar';
}

const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelType, interactive = true, language = 'en' }) => {
    const [rotation, setRotation] = useState({ x: -10, y: 30 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const t = TRANSLATIONS[language];

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!interactive) return;
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !interactive) return;
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        
        setRotation(prev => ({
            x: prev.x - deltaY * 0.5,
            y: prev.y + deltaX * 0.5
        }));
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!interactive) return;
        e.stopPropagation();
        // Prevent default page scroll if interacting with viewer
        // Note: React's synthetic event doesn't support preventDefault on passive listeners easily, 
        // so we rely on the user hovering the specific area.
        const delta = e.deltaY * -0.001;
        setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2.5));
    };

    const getModelIcon = () => {
        switch(modelType) {
            case 'teeth': return <Smile size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />;
            case 'bones': return <div className="text-6xl font-black text-slate-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">☠️</div>;
            case 'muscles': return <Activity size={64} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]" />;
            case 'nerves': return <Zap size={64} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />;
            case 'arteries': return <Heart size={64} className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />;
            default: return <Smile size={64} />;
        }
    };

    const getModelLabel = () => {
         switch(modelType) {
            case 'teeth': return t.modelTeeth;
            case 'bones': return t.modelBones;
            case 'muscles': return t.modelMuscles;
            case 'nerves': return t.modelNerves;
            case 'arteries': return t.modelArteries;
            default: return modelType;
        }
    };

    // Simulated hotspots based on model type
    const hotspots = [
        { id: 'h1', x: 20, y: -20, z: 40, label: 'Part A' },
        { id: 'h2', x: -30, y: 10, z: -30, label: 'Part B' },
        { id: 'h3', x: 0, y: 40, z: 0, label: 'Part C' }
    ];

    return (
        <div 
            className={`relative bg-slate-900 rounded-xl overflow-hidden cursor-move select-none group border border-slate-700 shadow-inner ${interactive ? '' : 'pointer-events-none'}`}
            style={{ height: interactive ? '350px' : '200px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            ref={containerRef}
        >
            {/* 3D Scene */}
            <div 
                className="w-full h-full flex items-center justify-center perspective-1000"
                style={{ perspective: '1000px' }}
            >
                <div 
                    className="relative w-40 h-40 transform-style-3d transition-transform duration-75 ease-out"
                    style={{ 
                        transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
                    }}
                >
                    {/* Wireframe Cube / Volume Representation */}
                    <div className="absolute inset-0 border-2 border-teal-500/30 rounded-lg bg-teal-500/5 transform translate-z-20 backface-visible"></div>
                    <div className="absolute inset-0 border-2 border-teal-500/30 rounded-lg bg-teal-500/5 transform translate-z-20 rotate-y-90"></div>
                    <div className="absolute inset-0 border-2 border-teal-500/30 rounded-lg bg-teal-500/5 transform translate-z-20 rotate-x-90"></div>
                    
                    {/* Central Model Icon */}
                    <div className="absolute inset-0 flex items-center justify-center transform translate-z-0 animate-pulse">
                        {getModelIcon()}
                    </div>

                    {/* Hotspots */}
                    {interactive && hotspots.map((spot, i) => (
                        <div 
                            key={spot.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedPart(`${getModelLabel()} - ${spot.label}`); }}
                            className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] cursor-pointer hover:scale-150 transition-transform flex items-center justify-center"
                            style={{ 
                                transform: `translate3d(${spot.x}px, ${spot.y}px, ${spot.z}px) rotateX(${-rotation.x}deg) rotateY(${-rotation.y}deg)` 
                            }}
                        >
                            <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay UI */}
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <Rotate3d size={16} className="text-teal-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{getModelLabel()}</span>
            </div>

            {selectedPart && (
                <div className="absolute top-3 right-3 bg-teal-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white animate-in fade-in slide-in-from-top-2">
                    {t.partSelected} {selectedPart}
                </div>
            )}

            {interactive && (
                <>
                    <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-black/30 px-2 py-1 rounded">
                        {t.interactHint}
                    </div>

                    <div className="absolute bottom-3 right-3 flex gap-2">
                         <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.2)) }} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                             <ZoomOut size={16} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(2.5, z + 0.2)) }} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                             <ZoomIn size={16} />
                         </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThreeDModelViewer;
