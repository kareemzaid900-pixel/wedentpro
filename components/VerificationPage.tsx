
import React, { useState } from 'react';
import { Upload, Camera, ShieldCheck, ArrowRight, Globe, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface VerificationPageProps {
  onComplete: (verified: boolean) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

type VerificationMode = 'UPLOAD' | 'LATER';

const VerificationPage: React.FC<VerificationPageProps> = ({ onComplete, language, onLanguageChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<VerificationMode>('UPLOAD');
  const t = TRANSLATIONS[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProceed = () => {
    if (mode === 'LATER') {
        // Skip verification logic - User is not verified yet
        onComplete(false);
    } else {
        // Upload logic - In a real app, upload file here.
        // Assume verified for now since they uploaded a doc.
        onComplete(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10 rtl:left-6 rtl:right-auto">
         <button 
           onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
           className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-all text-sm font-bold"
         >
            <Globe size={16} />
            {language === 'en' ? 'عربي' : 'English'}
         </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="text-blue-600" size={32} />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.verificationTitle}</h2>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left rtl:text-right">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>{t.policyNotice}</strong> {t.policyText}
          </p>
        </div>

        <p className="text-slate-600 mb-4 text-sm font-medium text-left rtl:text-right">
            {t.uploadPrompt}
        </p>

        {/* Selection Options */}
        <div className="space-y-4 mb-6">
            <button 
                onClick={() => setMode('UPLOAD')}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${mode === 'UPLOAD' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'UPLOAD' ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
                        {mode === 'UPLOAD' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`font-semibold ${mode === 'UPLOAD' ? 'text-teal-800' : 'text-slate-700'}`}>{t.uploadRequiredDocs}</span>
                </div>
            </button>

            {mode === 'UPLOAD' && (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 transition-colors hover:bg-slate-50 relative group animate-in fade-in zoom-in-95">
                    <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 bg-teal-50 rounded-full text-teal-600 group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">{t.tapToUpload}</p>
                            <p className="text-xs text-slate-400">{t.cameraOrGallery}</p>
                        </div>
                        {file && (
                        <div className="mt-2 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle2 size={12} /> {t.selected}: {file.name}
                        </div>
                        )}
                    </div>
                </div>
            )}

            <button 
                onClick={() => setMode('LATER')}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${mode === 'LATER' ? 'border-slate-500 bg-slate-50 ring-1 ring-slate-500' : 'border-slate-200 hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'LATER' ? 'border-slate-500 bg-slate-500' : 'border-slate-300'}`}>
                        {mode === 'LATER' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`font-semibold ${mode === 'LATER' ? 'text-slate-800' : 'text-slate-700'}`}>{t.uploadLaterOption}</span>
                </div>
            </button>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleProceed}
            disabled={mode === 'UPLOAD' && !file}
            className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              (mode === 'LATER' || (mode === 'UPLOAD' && file)) ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {mode === 'UPLOAD' ? t.verifyContinue : t.enter} {language === 'ar' ? <ArrowRight size={18} className="rotate-180" /> : <ArrowRight size={18} />}
          </button>
          
          <p className="text-xs text-slate-400 mt-2">
            {t.verifyLaterWarning}
          </p>
        </div>

      </div>
    </div>
  );
};

export default VerificationPage;
