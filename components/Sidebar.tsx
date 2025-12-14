
import React from 'react';
import { LayoutGrid, Briefcase, ShoppingBag, Activity, Scissors, Smile, Baby, Gem, Crown, Sparkles, Coffee, Users, Lightbulb, TrendingUp, Globe, MessageSquare, Landmark, Heart } from 'lucide-react';
import { Specialty, ViewState, SpecialtyStat, Language } from '../types';
import { SPECIALTIES_LIST, SPECIALTY_STATS, TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  currentSpecialty: Specialty;
  onViewChange: (view: ViewState) => void;
  onSpecialtyChange: (specialty: Specialty) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

interface NavItemProps { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  stats?: SpecialtyStat;
  t: typeof TRANSLATIONS['en'];
}

const NavItem: React.FC<NavItemProps> = ({ 
  active, 
  onClick, 
  icon, 
  label,
  stats,
  t
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-all duration-300 group relative border-b border-transparent ${
      active
        ? 'bg-teal-50/50 text-teal-800'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 shadow-[0_0_12px_rgba(13,148,136,0.5)] ltr:left-0 rtl:right-0 rtl:left-auto"></div>
    )}
    <span className={`mt-0.5 transition-transform duration-300 ${active ? 'text-teal-600 scale-110' : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-105'}`}>
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <span className={`block text-[15px] tracking-wide mb-1 ${active ? 'font-bold' : 'font-medium'}`}>
        {label}
      </span>
      
      {/* Statistics under the department name */}
      {stats && (
        <div className="flex flex-col gap-1 text-[11px] text-slate-400 font-medium opacity-90">
           <div className="flex items-center gap-2" title="Interactors / Members">
              <Users size={12} className="text-slate-400" /> 
              <span><strong className="text-slate-600">{stats.membersCount > 1000 ? `${(stats.membersCount/1000).toFixed(1)}k` : stats.membersCount}</strong> {t.members}</span>
           </div>
           <div className="flex items-center gap-2" title="Available Specialists">
              <Lightbulb size={12} className={stats.availableSpecialists > 0 ? "text-green-500 fill-green-500" : "text-slate-300"} />
              <span><strong className={stats.availableSpecialists > 0 ? "text-green-600" : "text-slate-500"}>{stats.availableSpecialists}</strong> {t.available}</span>
           </div>
           <div className="flex items-center gap-2" title="Most Active Members">
              <TrendingUp size={12} className="text-blue-500" />
              <span><strong className="text-blue-600">{stats.activeCount}</strong> {t.active}</span>
           </div>
        </div>
      )}
    </div>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, currentSpecialty, onViewChange, onSpecialtyChange, language, onLanguageChange }) => {
  const t = TRANSLATIONS[language];
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid': return <LayoutGrid size={22} />;
      case 'Scalpel': return <Scissors size={22} />;
      case 'Activity': return <Activity size={22} />;
      case 'Smile': return <Smile size={22} />;
      case 'Baby': return <Baby size={22} />;
      case 'Gem': return <Gem size={22} />;
      case 'Crown': return <Crown size={22} />;
      case 'Sparkles': return <Sparkles size={22} />;
      case 'Coffee': return <Coffee size={22} />;
      default: return <LayoutGrid size={22} />;
    }
  };

  return (
    <aside className="w-72 md:w-80 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20 font-sans rtl:border-r-0 rtl:border-l">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 shrink-0">
                 {/* Custom Tooth Logo SVG */}
                 <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                    <path d="M150 40C130 20 100 20 100 20C100 20 70 20 50 40C30 60 30 100 40 120C50 140 70 170 85 180C95 186 100 170 100 160C100 170 105 186 115 180C130 170 150 140 160 120C170 100 170 60 150 40Z" fill="#0B1C47"/>
                    <path d="M130 50C150 50 160 70 160 90" stroke="#00C2CB" strokeWidth="12" strokeLinecap="round"/>
                    <path d="M60 60C60 60 70 50 90 50" stroke="#00C2CB" strokeWidth="8" strokeLinecap="round" opacity="0.6"/>
                    <circle cx="145" cy="45" r="6" fill="#00C2CB"/>
                </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-[#0B1C47]">WeDENT</span><span className="text-[#00C2CB]">pro</span>
            </h1>
        </div>
        <p className="text-xs text-slate-400 pl-1 uppercase tracking-wider font-semibold">{t.tagline}</p>
        
        <button 
          onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
          className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors w-fit"
        >
          <Globe size={14} />
          {language === 'en' ? 'عربي' : 'English'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <div className="mb-8">
          <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{t.mainMenu}</p>
          <NavItem 
            active={currentView === 'FEED' && currentSpecialty === Specialty.GENERAL}
            onClick={() => onSpecialtyChange(Specialty.GENERAL)}
            icon={<LayoutGrid size={22} />}
            label={t.generalWall}
            stats={SPECIALTY_STATS.find(s => s.id === Specialty.GENERAL)}
            t={t}
          />
          {/* WeDent Museum */}
          <NavItem 
            active={currentView === 'MUSEUM'}
            onClick={() => onViewChange('MUSEUM')}
            icon={<Landmark size={22} className="text-amber-600" />}
            label={t.weDentMuseum}
            t={t}
          />
          {/* Favorites */}
          <NavItem 
            active={currentView === 'FAVORITES'}
            onClick={() => onViewChange('FAVORITES')}
            icon={<Heart size={22} className="text-red-500" />}
            label={t.favorites}
            t={t}
          />
          <NavItem 
            active={currentView === 'MEMBERS_LIST'}
            onClick={() => onViewChange('MEMBERS_LIST')}
            icon={<Users size={22} />}
            label={t.members}
            t={t}
          />
          <NavItem 
            active={currentView === 'MESSAGES'}
            onClick={() => onViewChange('MESSAGES')}
            icon={<MessageSquare size={22} />}
            label={t.messages}
            t={t}
          />
          <NavItem 
            active={currentView === 'MARKETPLACE'}
            onClick={() => onViewChange('MARKETPLACE')}
            icon={<ShoppingBag size={22} />}
            label={t.marketplace}
            t={t}
          />
          <NavItem 
            active={currentView === 'JOBS'}
            onClick={() => onViewChange('JOBS')}
            icon={<Briefcase size={22} />}
            label={t.jobs}
            t={t}
          />
        </div>

        <div className="mb-6">
          <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{t.specialties}</p>
          {SPECIALTIES_LIST.filter(s => s.id !== Specialty.GENERAL).map((spec) => (
            <NavItem 
                key={spec.id}
                active={currentView === 'FEED' && currentSpecialty === spec.id}
                onClick={() => onSpecialtyChange(spec.id)}
                icon={getIcon(spec.icon)}
                label={language === 'ar' && spec.labelAr ? spec.labelAr : spec.label}
                stats={SPECIALTY_STATS.find(s => s.id === spec.id)}
                t={t}
            />
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button 
            onClick={() => onViewChange('PROFILE')}
            className={`flex items-center gap-3 w-full hover:bg-white p-3 rounded-xl transition-all border border-transparent hover:border-slate-200 hover:shadow-sm group ${currentView === 'PROFILE' ? 'bg-white border-slate-200 shadow-sm' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm group-hover:border-teal-100 transition-colors">
             <img src="https://picsum.photos/seed/user1/100/100" alt="Me" />
          </div>
          <div className="text-left rtl:text-right">
            <p className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">Dr. Alex Mercer</p>
            <p className="text-xs text-slate-500">{t.viewProfile}</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
