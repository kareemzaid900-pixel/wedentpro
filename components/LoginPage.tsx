


import React, { useState } from 'react';
import { UserRole, Specialty, Language } from '../types';
import { SPECIALTIES_LIST, TRANSLATIONS } from '../constants';
import { Globe } from 'lucide-react';

interface LoginPageProps {
  onLogin: (data: { name: string; email: string; role: UserRole; specialty: Specialty }) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, language, onLanguageChange }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [specialty, setSpecialty] = useState<Specialty>(Specialty.GENERAL);
  
  const t = TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && role) {
      // If user is not a master's student, default to General or relevant logic
      // For this app flow, we keep the specialty selected or default to General
      const finalSpecialty = role === UserRole.MASTER_STUDENT ? specialty : Specialty.GENERAL;
      onLogin({ name, email, role, specialty: finalSpecialty });
    }
  };

  // Filter out General and Cafe for the student specialty selection
  const medicalSpecialties = SPECIALTIES_LIST.filter(
    s => s.id !== Specialty.GENERAL && s.id !== Specialty.CAFE
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
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

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20">
             {/* Custom Tooth Logo SVG */}
             <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <path d="M150 40C130 20 100 20 100 20C100 20 70 20 50 40C30 60 30 100 40 120C50 140 70 170 85 180C95 186 100 170 100 160C100 170 105 186 115 180C130 170 150 140 160 120C170 100 170 60 150 40Z" fill="#0B1C47"/>
                <path d="M130 50C150 50 160 70 160 90" stroke="#00C2CB" strokeWidth="12" strokeLinecap="round"/>
                <path d="M60 60C60 60 70 50 90 50" stroke="#00C2CB" strokeWidth="8" strokeLinecap="round" opacity="0.6"/>
                <circle cx="145" cy="45" r="6" fill="#00C2CB"/>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
            <span className="text-[#0B1C47]">WeDENT</span><span className="text-[#00C2CB]">pro</span>
        </h1>
        <p className="text-center text-slate-500 mb-8 text-sm font-medium">{t.tagline}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t.fullName}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all bg-white text-slate-900"
              placeholder={language === 'en' ? "Dr. John Doe" : "د. محمد علي"}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all bg-white text-slate-900"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t.roleLabel}</label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all bg-white text-slate-900"
            >
              <option value="" disabled>{t.selectRole}</option>
              {Object.values(UserRole).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {role === UserRole.MASTER_STUDENT && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.specialtyLabel}</label>
              <select
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as Specialty)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all bg-white text-slate-900"
              >
                {medicalSpecialties.map((s) => (
                  <option key={s.id} value={s.id}>{language === 'ar' && s.labelAr ? s.labelAr : s.label}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#00C2CB] hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-colors mt-6 shadow-md shadow-teal-100"
          >
            {t.joinNetwork}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
