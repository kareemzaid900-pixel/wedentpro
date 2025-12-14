
import React, { useState } from 'react';
import { MOCK_MUSEUM_CASES, TRANSLATIONS } from '../constants';
import { Language, MuseumCase } from '../types';
import { Star, Quote, ArrowRight, Heart } from 'lucide-react';

interface MuseumProps {
  language: Language;
  onCaseClick: (postId: string) => void;
}

const Museum: React.FC<MuseumProps> = ({ language, onCaseClick }) => {
  const t = TRANSLATIONS[language];
  const [favorites, setFavorites] = useState<Set<string>>(new Set(MOCK_MUSEUM_CASES.filter(c => c.isFavorite).map(c => c.id)));

  const toggleFavorite = (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    const newFavs = new Set(favorites);
    if (newFavs.has(caseId)) {
        newFavs.delete(caseId);
    } else {
        newFavs.add(caseId);
    }
    setFavorites(newFavs);
  };

  const renderStars = (rating: number) => {
    return (
        <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map(star => (
                <Star 
                    key={star} 
                    size={14} 
                    className={star <= rating ? "fill-amber-400" : "fill-slate-200 text-slate-200"} 
                />
            ))}
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2 font-serif">{t.weDentMuseum}</h2>
        <p className="text-slate-500 italic max-w-2xl mx-auto">{t.museumDesc}</p>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_MUSEUM_CASES.map((museumCase) => (
            <div 
                key={museumCase.id}
                onClick={() => onCaseClick(museumCase.postId)}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-100 hover:border-amber-200 transition-all duration-300 cursor-pointer flex flex-col"
            >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                    <img 
                        src={museumCase.image} 
                        alt={museumCase.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-100 text-xs font-bold uppercase tracking-wider mb-2">
                            {museumCase.category}
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight font-serif drop-shadow-sm">{museumCase.title}</h3>
                    </div>

                    <button 
                        onClick={(e) => toggleFavorite(e, museumCase.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors border border-white/30"
                        title={favorites.has(museumCase.id) ? t.removeFromFav : t.addToFav}
                    >
                        <Heart size={20} className={favorites.has(museumCase.id) ? "fill-red-500 text-red-500" : "text-white"} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                    
                    {/* Doctor Info */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                        <div className="w-12 h-12 rounded-full border-2 border-amber-100 p-0.5">
                            <img src={museumCase.doctor.avatar} alt={museumCase.doctor.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">{t.treatmentBy}</p>
                            <p className="font-bold text-slate-800">{museumCase.doctor.name}</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                            {renderStars(museumCase.rating)}
                            <span className="text-xs text-slate-400 font-medium mt-1">{museumCase.rating}/5.0</span>
                        </div>
                    </div>

                    {/* Patient Review */}
                    <div className="bg-slate-50 rounded-xl p-4 relative mb-4 flex-1">
                        <Quote size={24} className="text-amber-200 absolute -top-3 -left-2 fill-amber-100" />
                        <p className="text-slate-600 text-sm italic leading-relaxed relative z-10">
                            {museumCase.patientReview}
                        </p>
                    </div>

                    <div className="flex items-center text-teal-600 text-sm font-bold group-hover:translate-x-2 transition-transform duration-300 mt-auto">
                        {t.viewOriginalPost} <ArrowRight size={16} className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Museum;
