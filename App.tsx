
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Marketplace from './components/Marketplace';
import Jobs from './components/Jobs';
import Messaging from './components/Messaging';
import RightSidebar from './components/RightSidebar';
import LoginPage from './components/LoginPage';
import VerificationPage from './components/VerificationPage';
import LiveSession from './components/LiveSession';
import Museum from './components/Museum'; // Import Museum
import { CURRENT_USER, MOCK_POSTS, TRANSLATIONS, SPECIALTIES_LIST, MOCK_DOCTORS, BACKGROUND_THEMES } from './constants';
import { ViewState, Specialty, User, UserRole, Language, ProfileVisibility, MessagePermission, BackgroundTheme } from './types';
import { Menu, Settings, Shield, X, Users, MessageCircle, UserPlus, Star, UserCheck, MessageSquare, Camera, Radio, Image as ImageIcon, CheckCircle2, ArrowLeft } from 'lucide-react';

type AuthStep = 'LOGIN' | 'VERIFY' | 'APP';

// History Item Interface
interface HistoryItem {
  view: ViewState;
  specialty: Specialty;
  viewingId: string | null;
}

const App: React.FC = () => {
  const [authStep, setAuthStep] = useState<AuthStep>('LOGIN');
  const [currentView, setCurrentView] = useState<ViewState>('FEED');
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty>(Specialty.GENERAL);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
  // Navigation History Stack
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initialize with mock user, but update after login
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  
  // State for profile viewing
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLiveSessionOpen, setIsLiveSessionOpen] = useState(false);
  
  // Messaging state
  const [messageTargetUser, setMessageTargetUser] = useState<User | null>(null);

  // Background state
  const [currentBackground, setCurrentBackground] = useState<BackgroundTheme>(BACKGROUND_THEMES[0]);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (data: { name: string; email: string; role: UserRole; specialty: Specialty }) => {
    setCurrentUser({
      ...currentUser,
      id: `user-${Date.now()}`,
      name: data.name,
      specialty: data.specialty,
      role: data.role,
      email: data.email,
      isVerified: false,
      profileVisibility: ProfileVisibility.EVERYONE,
      messagePermission: MessagePermission.EVERYONE
    });
    setAuthStep('VERIFY');
  };

  const handleVerificationComplete = (verified: boolean) => {
    setCurrentUser(prev => ({ ...prev, isVerified: verified }));
    setAuthStep('APP');
    setShowWelcome(true);
  };

  // Central Navigation Handler
  const navigateTo = (view: ViewState, specialty?: Specialty, viewingId?: string | null, pushToHistory = true) => {
    if (pushToHistory) {
        setHistory(prev => [...prev, { view: currentView, specialty: currentSpecialty, viewingId: viewingProfileId }]);
    }
    
    setCurrentView(view);
    if (specialty) setCurrentSpecialty(specialty);
    if (viewingId !== undefined) setViewingProfileId(viewingId);
    
    // Close mobile menu on navigation
    setIsMobileMenuOpen(false);
  };

  const goBack = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    setCurrentView(lastState.view);
    setCurrentSpecialty(lastState.specialty);
    setViewingProfileId(lastState.viewingId);
  };

  // Handle Sidebar Navigation with History Stack
  const handleSidebarViewChange = (view: ViewState) => {
      // Prevent redundant history entries
      if (view === currentView && view !== 'PROFILE') {
          setIsMobileMenuOpen(false);
          return;
      }
      // Push current state to history before changing
      setHistory(prev => [...prev, { view: currentView, specialty: currentSpecialty, viewingId: viewingProfileId }]);
      
      setCurrentView(view);
      setIsMobileMenuOpen(false);
      
      // Reset viewing ID logic
      if (view !== 'PROFILE') setViewingProfileId(null);
      if (view === 'PROFILE') setViewingProfileId(currentUser.id);
  };

  const handleSidebarSpecialtyChange = (specialty: Specialty) => {
      // Prevent redundant history entries
      if (currentView === 'FEED' && currentSpecialty === specialty) {
          setIsMobileMenuOpen(false);
          return;
      }
      
      setHistory(prev => [...prev, { view: currentView, specialty: currentSpecialty, viewingId: viewingProfileId }]);
      setCurrentSpecialty(specialty);
      // Ensure we switch to FEED view if we were elsewhere (e.g. Marketplace)
      if (currentView !== 'FEED') setCurrentView('FEED');
      
      setIsMobileMenuOpen(false);
  };

  const handleUserClick = (user: User) => {
    navigateTo('PROFILE', undefined, user.id);
  };

  const handleMessageClick = (user: User) => {
    setMessageTargetUser(user);
    navigateTo('MESSAGES');
  };

  const handleMuseumCaseClick = (postId: string) => {
      // Push history and go to feed to simulate opening post
      navigateTo('FEED');
      // In a real app we would scroll to ID or show single post view
  };

  const updateProfileVisibility = (visibility: ProfileVisibility) => {
    setCurrentUser(prev => ({ ...prev, profileVisibility: visibility }));
  };

  const updateMessagePermission = (permission: MessagePermission) => {
    setCurrentUser(prev => ({ ...prev, messagePermission: permission }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setCurrentUser(prev => ({ ...prev, avatar: ev.target!.result as string }));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setCustomBgImage(ev.target!.result as string);
                setCurrentBackground({ id: 'custom', name: 'Custom', type: 'IMAGE', value: 'custom' });
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const t = TRANSLATIONS[language];

  // Helper to get the actual user object being viewed
  const getViewingUser = (): User => {
    if (!viewingProfileId || viewingProfileId === currentUser.id) return currentUser;
    return MOCK_DOCTORS.find(d => d.id === viewingProfileId) || currentUser;
  };

  const canMessage = (targetUser: User) => {
    if (targetUser.id === currentUser.id) return false;
    if (targetUser.messagePermission === MessagePermission.EVERYONE) return true;
    if (targetUser.messagePermission === MessagePermission.SAME_SPECIALTY) {
       return targetUser.specialty === currentUser.specialty;
    }
    return false;
  };

  const targetProfileUser = getViewingUser();
  const isMyProfile = targetProfileUser.id === currentUser.id;

  // Render content based on view
  const renderMainContent = () => {
    switch (currentView) {
      case 'FEED':
        return <Feed posts={MOCK_POSTS} specialty={currentSpecialty} currentUser={currentUser} language={language} viewState="FEED" />;
      case 'FAVORITES':
        // Filter for saved posts
        const savedPosts = MOCK_POSTS.filter(p => p.isSaved);
        return (
            <div className="max-w-3xl mx-auto">
                <div className="p-4 border-b border-slate-100 md:hidden">
                    <h2 className="font-bold text-lg text-slate-800">{t.favorites}</h2>
                </div>
                {savedPosts.length > 0 ? (
                    <Feed posts={savedPosts} specialty={Specialty.GENERAL} currentUser={currentUser} language={language} viewState="FEED" />
                ) : (
                    <div className="py-20 text-center text-slate-400">
                        <Star size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No favorites yet.</p>
                    </div>
                )}
            </div>
        );
      case 'MARKETPLACE':
        return <Marketplace />;
      case 'JOBS':
        return <Jobs />;
      case 'MESSAGES':
        return <Messaging currentUser={currentUser} initialTargetUser={messageTargetUser} language={language} />;
      case 'MUSEUM':
        return <Museum language={language} onCaseClick={handleMuseumCaseClick} />;
      case 'MEMBERS_LIST':
        // Comprehensive view for Mobile/Tablet that mimics RightSidebar content
        return (
          <div className="p-4 md:p-6 bg-white/90 min-h-full backdrop-blur-sm max-w-5xl mx-auto space-y-6">
             
             {/* Header */}
             <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <Users className="text-teal-600" />
                    {currentSpecialty === Specialty.GENERAL ? t.allSpecialists : `${t.availableSpec} ${currentSpecialty}`}
                </h2>
                <p className="text-slate-500 text-sm">Browse and connect with other professionals.</p>
             </div>

             {/* Ads Section (Visible on Mobile/Tablet via this view) */}
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-blue-400 border border-blue-200 px-1 rounded">{t.ad}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">Advanced Implant Course</h4>
                    <p className="text-sm text-slate-600 mt-1">Master full arch rehabilitation in our 3-day intensive workshop.</p>
                    <button className="mt-3 bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        Learn More
                    </button>
                </div>
                <div className="sm:w-1/3 aspect-video bg-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <img src="https://picsum.photos/seed/ad1/400/300" alt="Ad" className="w-full h-full object-cover" />
                </div>
             </div>
             
             {/* Trending */}
             <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <h3 className="font-bold text-slate-800 text-sm">{t.trending}</h3>
                </div>
                <p className="text-sm text-slate-600 font-medium hover:text-teal-600 cursor-pointer transition-colors">
                    "The future of AI in diagnostic radiography: A comprehensive review."
                </p>
             </div>

             {/* Members Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                 {MOCK_DOCTORS.filter(d => currentSpecialty === Specialty.GENERAL || currentSpecialty === Specialty.CAFE ? true : d.specialty === currentSpecialty).map(doc => (
                    <div key={doc.id} className="p-4 rounded-xl border border-slate-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all flex flex-col gap-3 bg-white">
                         <button onClick={() => handleUserClick(doc)} className="flex items-center gap-4 text-left rtl:text-right">
                             <div className="relative w-12 h-12 rounded-full bg-slate-100 shrink-0">
                                <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover rounded-full" />
                             </div>
                             <div>
                                <p className="font-bold text-slate-800 line-clamp-1">{doc.name}</p>
                                <p className="text-sm text-slate-500">{doc.specialty}</p>
                                <p className="text-xs text-slate-400 mt-1">{doc.followers} {t.followers}</p>
                             </div>
                         </button>
                         <div className="flex gap-2 pt-2 border-t border-slate-50 mt-auto">
                            {canMessage(doc) && (
                                <button 
                                    onClick={() => handleMessageClick(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                                >
                                    <MessageCircle size={14} /> {t.message}
                                </button>
                            )}
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                {doc.isFollowing ? <><UserCheck size={14} /> {t.unfollow}</> : <><Star size={14} /> {t.follow}</>}
                            </button>
                            <button className="px-3 py-2 text-slate-500 bg-slate-50 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={t.addFriend}>
                                <UserPlus size={14} />
                            </button>
                         </div>
                    </div>
                 ))}
             </div>
          </div>
        );
      case 'PROFILE':
        // Check Privacy
        const isPrivate = !isMyProfile && targetProfileUser.profileVisibility === ProfileVisibility.ONLY_ME;
        
        return (
            <div className="flex flex-col gap-6 relative">
                 {/* Profile Header */}
                 <div className="bg-white p-6 shadow-sm border-b border-slate-100">
                    <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                        {isMyProfile && (
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="absolute top-0 right-0 rtl:left-0 rtl:right-auto bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600"
                                title={t.profileSettings}
                            >
                                <Settings size={20} />
                            </button>
                        )}
                        
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-slate-50 shrink-0 shadow-sm">
                                <img src={targetProfileUser.avatar} alt={targetProfileUser.name} className="w-full h-full object-cover" />
                            </div>
                            
                            {isMyProfile && (
                                <>
                                    <button 
                                        onClick={handleAvatarClick}
                                        className="absolute bottom-0 right-0 bg-teal-600 text-white p-1.5 rounded-full shadow-md hover:bg-teal-700 transition-all opacity-0 group-hover:opacity-100"
                                        title="Change Profile Picture"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden" 
                                    />
                                </>
                            )}
                        </div>

                        <div className="text-center md:text-left rtl:md:text-right flex-1">
                             <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-1">
                                <h2 className="text-2xl font-bold text-slate-800">{targetProfileUser.name}</h2>
                                {targetProfileUser.isVerified && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                        <Shield size={12} /> {t.verified}
                                    </span>
                                )}
                             </div>
                             <p className="text-teal-600 font-medium">{targetProfileUser.role || 'Specialist'} • {targetProfileUser.specialty}</p>
                             <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500">
                                 <span><strong>{targetProfileUser.followers}</strong> {t.followers}</span>
                                 <span><strong>120</strong> Following</span>
                             </div>

                             {isMyProfile ? (
                                <div className="mt-4 flex justify-center md:justify-start">
                                    <button 
                                        onClick={() => setIsLiveSessionOpen(true)}
                                        className="bg-red-600 text-white text-sm px-5 py-2 rounded-lg font-bold hover:bg-red-700 transition-all shadow-md shadow-red-200 flex items-center gap-2 animate-pulse hover:animate-none"
                                    >
                                        <Radio size={16} /> Go Live
                                    </button>
                                </div>
                             ) : (
                                 <div className="mt-4 flex gap-3 justify-center md:justify-start">
                                    {canMessage(targetProfileUser) && (
                                        <button 
                                            onClick={() => handleMessageClick(targetProfileUser)}
                                            className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
                                        >
                                            <MessageSquare size={16} /> {t.message}
                                        </button>
                                    )}
                                    <button className="bg-slate-100 text-slate-700 text-sm px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                                        {targetProfileUser.isFollowing ? <UserCheck size={16} /> : <Star size={16} />}
                                        {targetProfileUser.isFollowing ? t.unfollow : t.follow}
                                    </button>
                                     <button className="bg-slate-100 text-slate-700 text-sm px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                                        <UserPlus size={16} /> {t.addFriend}
                                    </button>
                                 </div>
                             )}
                        </div>
                    </div>
                 </div>

                 {/* Settings Modal */}
                 {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-slate-800">{t.profileSettings}</h3>
                                <button onClick={() => setIsSettingsOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Appearance Section */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">{t.appearance}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {BACKGROUND_THEMES.map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setCurrentBackground(theme)}
                                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${currentBackground.id === theme.id ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <div className={`w-full h-12 rounded-lg ${theme.value}`} />
                                                <span className="text-xs">{theme.name}</span>
                                            </button>
                                        ))}
                                        {/* Custom Image Option */}
                                        <div className="col-span-2">
                                            <button
                                                onClick={() => bgInputRef.current?.click()}
                                                className={`w-full p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${currentBackground.type === 'IMAGE' && currentBackground.id === 'custom' ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <ImageIcon size={16} />
                                                <span className="text-xs">{t.upload} {t.customBg}</span>
                                                {currentBackground.type === 'IMAGE' && currentBackground.id === 'custom' && <CheckCircle2 size={16} />}
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={bgInputRef} 
                                                onChange={handleBgFileChange} 
                                                accept="image/*"
                                                className="hidden" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">{t.whoCanView}</label>
                                    <div className="space-y-2">
                                        {[ProfileVisibility.EVERYONE, ProfileVisibility.MEMBERS, ProfileVisibility.ONLY_ME].map(vis => (
                                            <button
                                                key={vis}
                                                onClick={() => updateProfileVisibility(vis)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${currentUser.profileVisibility === vis ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <span>
                                                    {vis === ProfileVisibility.EVERYONE && t.everyone}
                                                    {vis === ProfileVisibility.MEMBERS && t.onlyMembers}
                                                    {vis === ProfileVisibility.ONLY_ME && t.onlyMe}
                                                </span>
                                                {currentUser.profileVisibility === vis && <Shield size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">{t.whoCanMessage}</label>
                                    <div className="space-y-2">
                                        {[MessagePermission.EVERYONE, MessagePermission.SAME_SPECIALTY, MessagePermission.NO_ONE].map(perm => (
                                            <button
                                                key={perm}
                                                onClick={() => updateMessagePermission(perm)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${currentUser.messagePermission === perm ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <span>
                                                    {perm === MessagePermission.EVERYONE && t.everyone}
                                                    {perm === MessagePermission.SAME_SPECIALTY && t.sameSpecialty}
                                                    {perm === MessagePermission.NO_ONE && t.noOne}
                                                </span>
                                                {currentUser.messagePermission === perm && <MessageCircle size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    {t.saveSettings}
                                </button>
                            </div>
                        </div>
                    </div>
                 )}

                 {/* Personal Feed or Privacy Message */}
                 {isPrivate ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Shield size={48} className="mb-4 text-slate-200" />
                        <p className="font-medium">{t.privateProfile}</p>
                    </div>
                 ) : (
                    <Feed posts={MOCK_POSTS} specialty={Specialty.GENERAL} currentUser={currentUser} language={language} viewState="PROFILE" />
                 )}
            </div>
        );
      default:
        return <Feed posts={MOCK_POSTS} specialty={currentSpecialty} currentUser={currentUser} language={language} viewState="FEED" />;
    }
  };

  // Background Style Calculation
  const getAppBackgroundStyle = () => {
      if (currentBackground.type === 'IMAGE' && currentBackground.id === 'custom' && customBgImage) {
          return { backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' };
      }
      return {}; // For Tailwind classes
  };

  if (authStep === 'LOGIN') {
    return <LoginPage onLogin={handleLogin} language={language} onLanguageChange={setLanguage} />;
  }

  if (authStep === 'VERIFY') {
    return <VerificationPage onComplete={handleVerificationComplete} language={language} onLanguageChange={setLanguage} />;
  }

  return (
    <div 
        className={`flex min-h-screen ${currentBackground.type !== 'IMAGE' ? currentBackground.value : 'bg-slate-50'}`} 
        style={getAppBackgroundStyle()}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Live Session Overlay */}
      {isLiveSessionOpen && (
        <LiveSession onClose={() => setIsLiveSessionOpen(false)} />
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar (Mobile Wrapper) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out rtl:left-auto rtl:right-0 rtl:translate-x-full rtl:md:translate-x-0`}>
         <Sidebar 
            currentView={currentView} 
            currentSpecialty={currentSpecialty} 
            onViewChange={handleSidebarViewChange}
            onSpecialtyChange={handleSidebarSpecialtyChange}
            language={language}
            onLanguageChange={setLanguage}
         />
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/50 backdrop-blur-sm">
        
        {/* Mobile Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {history.length > 0 ? (
                    <button onClick={goBack} className="text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="rtl:rotate-180" />
                    </button>
                ) : (
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <Menu size={24} />
                    </button>
                )}
                <h1 className="font-bold text-slate-800 text-lg truncate">{t.appTitle}</h1>
            </div>
            {/* Unified access to Members via Sidebar, removed duplicate button to declutter */}
        </header>

        {/* Welcome Banner */}
        {showWelcome && (
            <div className="bg-teal-600 text-white p-4 relative animate-in slide-in-from-top-4 fade-in duration-500 shadow-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="font-bold text-lg mb-1">{t.welcome}</p>
                        <p className="text-teal-100 text-sm">{t.welcomeMsg}</p>
                    </div>
                    <button onClick={() => setShowWelcome(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Dynamic Header for Context */}
        {currentView !== 'PROFILE' && currentView !== 'MEMBERS_LIST' && currentView !== 'MESSAGES' && (
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 hidden md:block">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {currentView === 'FEED' ? (language === 'ar' ? (SPECIALTIES_LIST.find(s => s.id === currentSpecialty)?.labelAr || currentSpecialty) : currentSpecialty) : 
                        currentView === 'MARKETPLACE' ? t.marketplace : 
                        currentView === 'JOBS' ? t.jobs : 
                        currentView === 'FAVORITES' ? t.favorites :
                        currentView === 'MUSEUM' ? t.weDentMuseum : t.myProfile}
                    </h1>
                    {currentView === 'FEED' && (
                        <p className="text-slate-500 mt-1">
                            {currentSpecialty === Specialty.GENERAL ? t.generalWall : 
                            `${t.members} ${language === 'ar' ? (SPECIALTIES_LIST.find(s => s.id === currentSpecialty)?.labelAr || currentSpecialty) : currentSpecialty}`}
                        </p>
                    )}
                </div>
            </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar 
        currentView={currentView} 
        currentSpecialty={currentSpecialty} 
        language={language} 
        onUserClick={handleUserClick}
        currentUser={currentUser}
        onMessageClick={handleMessageClick}
      />
    </div>
  );
};

export default App;
