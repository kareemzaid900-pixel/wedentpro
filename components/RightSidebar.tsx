




import React from 'react';
import { Specialty, ViewState, UserStatus, Language, User, MessagePermission } from '../types';
import { MOCK_DOCTORS, TRANSLATIONS } from '../constants';
import { UserPlus, Star, Lightbulb, User as UserIcon, MessageCircle, UserCheck } from 'lucide-react';

interface RightSidebarProps {
  currentView: ViewState;
  currentSpecialty: Specialty;
  language: Language;
  onUserClick: (user: User) => void;
  currentUser: User;
  onMessageClick?: (user: User) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ currentView, currentSpecialty, language, onUserClick, currentUser, onMessageClick }) => {
  const t = TRANSLATIONS[language];
  
  // Filter doctors based on current specialty, or show all if General/Cafe
  const availableDoctors = MOCK_DOCTORS.filter(d => 
    currentSpecialty === Specialty.GENERAL || currentSpecialty === Specialty.CAFE 
      ? true 
      : d.specialty === currentSpecialty
  );

  const canMessage = (targetUser: User) => {
    if (targetUser.id === currentUser.id) return false;
    if (targetUser.messagePermission === MessagePermission.EVERYONE) return true;
    if (targetUser.messagePermission === MessagePermission.SAME_SPECIALTY) {
       return targetUser.specialty === currentUser.specialty;
    }
    return false;
  };

  return (
    <aside className="w-80 h-screen sticky top-0 hidden xl:flex flex-col gap-6 p-6 border-l border-slate-200 overflow-y-auto bg-white/50 rtl:border-l-0 rtl:border-r">
      
      {/* Specialists Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide flex items-center justify-between">
          <span>{currentSpecialty === Specialty.GENERAL ? t.allSpecialists : `${t.availableSpec} ${currentSpecialty}`}</span>
          <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{availableDoctors.length}</span>
        </h3>
        
        <div className="space-y-4">
          {availableDoctors.length > 0 ? availableDoctors.map(doc => (
            <div key={doc.id} className="group relative">
                <button 
                    onClick={() => onUserClick(doc)}
                    className="flex items-center justify-between w-full text-left rtl:text-right hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full bg-slate-100 shrink-0">
                    <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover rounded-full" />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm rtl:-right-auto rtl:-left-1">
                        <Lightbulb 
                            size={14} 
                            className={doc.status === UserStatus.AVAILABLE ? "text-green-500 fill-green-500" : "text-red-500 fill-red-500"} 
                        />
                    </div>
                    </div>
                    <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">{doc.name}</p>
                    <p className="text-xs text-slate-500 truncate">{doc.specialty}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <UserIcon size={10} /> {doc.followers} {t.followers}
                    </p>
                    </div>
                </div>
                </button>
                
                {/* Quick Actions overlay on hover */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                    {canMessage(doc) && (
                        <button 
                            onClick={() => onMessageClick && onMessageClick(doc)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors" 
                            title={t.message}
                        >
                            <MessageCircle size={16} />
                        </button>
                    )}
                    <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title={doc.isFollowing ? t.unfollow : t.follow}>
                        {doc.isFollowing ? <UserCheck size={16} /> : <Star size={16} />}
                    </button>
                    <button className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title={t.addFriend}>
                        <UserPlus size={16} />
                    </button>
                </div>
            </div>
          )) : (
            <div className="text-center py-4">
                 <p className="text-sm text-slate-400 italic">No specialists found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ads Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-400 border border-blue-200 px-1 rounded">{t.ad}</span>
        </div>
        <div className="aspect-video bg-slate-200 rounded-lg mb-3 overflow-hidden">
            <img src="https://picsum.photos/seed/ad1/400/300" alt="Ad" className="w-full h-full object-cover" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm">Advanced Implant Course</h4>
        <p className="text-xs text-slate-600 mt-1">Master full arch rehabilitation in our 3-day intensive workshop.</p>
        <button className="w-full mt-3 bg-blue-600 text-white text-xs font-bold py-2 rounded hover:bg-blue-700 transition-colors">
          Learn More
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4">
         <div className="flex items-center gap-2 mb-2">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <h3 className="font-bold text-slate-800 text-sm">{t.trending}</h3>
         </div>
         <p className="text-sm text-slate-600 font-medium hover:text-teal-600 cursor-pointer transition-colors">
            "The future of AI in diagnostic radiography: A comprehensive review."
         </p>
      </div>

    </aside>
  );
};

export default RightSidebar;
