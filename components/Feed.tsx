
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Post, PostType, Specialty, User, ReactionType, PostVisibility, Language, ViewState, MediaType, PostMedia, Comment } from '../types';
import { MessageSquare, Share2, AlertCircle, Bot, Send, Heart, BarChart2, X, Plus, CheckCircle2, Lightbulb, Settings, ThumbsUp, Eye, Globe, Lock, Users, Image as ImageIcon, Video, Trash2, EyeOff, ChevronDown, User as UserIcon, CalendarClock, Calendar, MoreVertical, Bookmark, Flag, CornerUpRight, MessageCircle, Box, Megaphone, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { evaluateClinicalCase } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { TRANSLATIONS } from '../constants';
import ThreeDModelViewer from './ThreeDModelViewer';

interface FeedProps {
  posts: Post[];
  specialty: Specialty;
  currentUser: User;
  language: Language;
  viewState: ViewState;
}

type ScheduleType = 'NOW' | 'DATE' | 'DELAY';

const Feed: React.FC<FeedProps> = ({ posts, specialty, currentUser, language, viewState }) => {
  const t = TRANSLATIONS[language];
  const [activePosts, setActivePosts] = useState<Post[]>(posts);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  
  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<PostVisibility>(PostVisibility.GENERAL);
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']); // Default to 3 empty options
  const [mediaAttachments, setMediaAttachments] = useState<PostMedia[]>([]);
  
  // Ad Management State
  const [isAdMode, setIsAdMode] = useState(false);
  const [adStartDate, setAdStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [adDuration, setAdDuration] = useState('7');
  const [adLink, setAdLink] = useState('');
  const [adBtnText, setAdBtnText] = useState('Learn More');

  // New features state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const [is3DMenuOpen, setIs3DMenuOpen] = useState(false);
  
  // Visibility Options Checkboxes
  const [saveOptions, setSaveOptions] = useState(false);
  const [oneTimeOption, setOneTimeOption] = useState(true);

  // Scheduling State
  const [isScheduleMenuOpen, setIsScheduleMenuOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('NOW');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleDelay, setScheduleDelay] = useState(1);
  
  // Interaction States
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({}); // { commentId: text }
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // commentId being replied to

  const fileInputRef = useRef<HTMLInputElement>(null);
  const visibilityMenuRef = useRef<HTMLDivElement>(null);
  const scheduleMenuRef = useRef<HTMLDivElement>(null);
  const threeDMenuRef = useRef<HTMLDivElement>(null);

  // Close visibility menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visibilityMenuRef.current && !visibilityMenuRef.current.contains(event.target as Node)) {
        setIsVisibilityMenuOpen(false);
      }
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(event.target as Node)) {
        setIsScheduleMenuOpen(false);
      }
      if (threeDMenuRef.current && !threeDMenuRef.current.contains(event.target as Node)) {
        setIs3DMenuOpen(false);
      }
      // Close post option menus on outside click
      if (activeMenuPostId && !(event.target as Element).closest('.post-options-menu-btn')) {
          setActiveMenuPostId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuPostId]);

  const handleConsultAI = useCallback(async (post: Post) => {
    setAiLoading(post.id);
    try {
      const response = await evaluateClinicalCase(post.content, post.specialty);
      setAiResponses(prev => ({ ...prev, [post.id]: response }));
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(null);
    }
  }, []);

  const handleVote = (postId: string, optionId: string) => {
    setActivePosts(prev => prev.map(post => {
        if (post.id !== postId || !post.poll) return post;
        if (post.poll.userVotedOptionId) return post; // Already voted

        const updatedOptions = post.poll.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        
        return {
            ...post,
            poll: {
                ...post.poll,
                options: updatedOptions,
                totalVotes: post.poll.totalVotes + 1,
                userVotedOptionId: optionId
            }
        };
    }));
  };

  const handleReaction = (postId: string, type: ReactionType) => {
     setActivePosts(prev => prev.map(post => {
         if (post.id !== postId) return post;
         
         const isRemoving = post.userReaction === type;
         const newReaction = isRemoving ? undefined : type;

         const updatedCounts = { ...post.reactions };
         
         // Remove old reaction if exists
         if (post.userReaction) {
             updatedCounts[post.userReaction] = Math.max(0, updatedCounts[post.userReaction] - 1);
         }

         // Add new reaction if not removing
         if (!isRemoving) {
             updatedCounts[type] = (updatedCounts[type] || 0) + 1;
         }

         return {
             ...post,
             userReaction: newReaction,
             reactions: updatedCounts
         };
     }));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
        setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const togglePollMode = () => {
    if (!isPollMode) {
        // Reset to default 3 options when opening
        setPollOptions(['', '', '']);
    }
    setIsPollMode(!isPollMode);
  };

  const toggleSaveOptions = () => {
    const newValue = !saveOptions;
    setSaveOptions(newValue);
    if (newValue) setOneTimeOption(false);
  };

  const toggleOneTimeOption = () => {
    const newValue = !oneTimeOption;
    setOneTimeOption(newValue);
    if (newValue) setSaveOptions(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            const isVideo = file.type.startsWith('video/');
            setMediaAttachments(prev => [...prev, {
              type: isVideo ? MediaType.VIDEO : MediaType.IMAGE,
              url: ev.target!.result as string
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
      // Reset input so same file can be selected again if needed (though we handle multiples)
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handle3DModelSelect = (modelType: string) => {
      setMediaAttachments(prev => [...prev, {
          type: MediaType.THREE_D,
          url: modelType
      }]);
      setIs3DMenuOpen(false);
  };

  const removeAttachment = (index: number) => {
    setMediaAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
      if (!newPostContent.trim() && mediaAttachments.length === 0) return;

      if (scheduleType !== 'NOW' && !isAdMode) {
          // In a real app, this would send to a scheduling queue
          alert(scheduleType === 'DATE' 
            ? `Post scheduled for ${scheduleDate}` 
            : `Post scheduled to appear in ${scheduleDelay} days`);
      }

      const validOptions = pollOptions.filter(o => o.trim());
      // Only attach poll if at least 2 valid options exist
      const hasValidPoll = isPollMode && validOptions.length >= 2;

      let adConfig;
      if (isAdMode) {
          const start = new Date(adStartDate);
          const end = new Date(start);
          end.setDate(start.getDate() + parseInt(adDuration));
          
          adConfig = {
              startDate: start.toISOString(),
              endDate: end.toISOString(),
              ctaLink: adLink,
              ctaText: adBtnText
          };
      }

      const newPost: Post = {
          id: `new-${Date.now()}`,
          author: currentUser,
          type: isAdMode ? PostType.AD : (hasValidPoll ? PostType.CASE : PostType.ARTICLE), 
          // If on general wall, allow posting as general, otherwise default to current specialty
          specialty: specialty === Specialty.GENERAL ? currentUser.specialty : specialty,
          visibility: postVisibility,
          title: isAdMode ? 'Sponsored Content' : (hasValidPoll ? 'Clinical Consultation Request' : (scheduleType !== 'NOW' ? '[SCHEDULED] ' : '') + 'New Post'),
          content: newPostContent,
          timestamp: scheduleType === 'NOW' ? 'Just now' : 'Scheduled',
          comments: [],
          reactions: {
              [ReactionType.LIKE]: 0,
              [ReactionType.THINKING]: 0,
              [ReactionType.LEARNED]: 0,
              [ReactionType.LOVE]: 0,
              [ReactionType.SURPRISED]: 0
          },
          media: mediaAttachments,
          poll: hasValidPoll && !isAdMode ? {
              totalVotes: 0,
              options: validOptions.map((o, i) => ({
                  id: `opt-${i}`,
                  text: o,
                  votes: 0
              }))
          } : undefined,
          adConfig,
          isAnonymous: isAdMode ? false : isAnonymous,
          isSaved: false,
          allowComments: true
      };

      if (scheduleType === 'NOW' || isAdMode) {
        setActivePosts([newPost, ...activePosts]);
      } else {
        // Just clear inputs without adding to feed for simulation of scheduling
      }
      
      setNewPostContent('');
      setMediaAttachments([]);
      setIsPollMode(false);
      setPollOptions(['', '', '']);
      // Do not reset post visibility if saveOptions is true in a real app, 
      // but here we just reset for cleanliness or keep as is if "Save" logic was implemented fully.
      if (!saveOptions) {
          setPostVisibility(PostVisibility.GENERAL);
      }
      setIsAnonymous(false);
      setScheduleType('NOW');
      setScheduleDate('');
      setIsAdMode(false);
  };

  const handleMenuClick = (e: React.MouseEvent, postId: string) => {
      e.stopPropagation();
      setActiveMenuPostId(activeMenuPostId === postId ? null : postId);
  };

  const handleMenuAction = (postId: string, action: 'SAVE' | 'REPORT' | 'SHARE') => {
      if (action === 'SAVE') {
          setActivePosts(prev => prev.map(p => {
              if (p.id === postId) {
                  return { ...p, isSaved: !p.isSaved };
              }
              return p;
          }));
      } else if (action === 'REPORT') {
          alert(t.reported);
      } else if (action === 'SHARE') {
          // For demo purposes
          alert("Link copied to clipboard!");
      }
      setActiveMenuPostId(null);
  };

  const toggleComments = (postId: string) => {
      const newSet = new Set(expandedComments);
      if (newSet.has(postId)) {
          newSet.delete(postId);
      } else {
          newSet.add(postId);
      }
      setExpandedComments(newSet);
  };

  const submitComment = (postId: string) => {
      const text = commentDrafts[postId]?.trim();
      if (!text) return;

      const newComment: Comment = {
          id: `c-${Date.now()}`,
          author: currentUser,
          content: text,
          timestamp: 'Just now',
          reactions: {},
          replies: []
      };

      setActivePosts(prev => prev.map(p => {
          if (p.id === postId) {
              return { ...p, comments: [...p.comments, newComment] };
          }
          return p;
      }));

      setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
  };

  const submitReply = (postId: string, commentId: string) => {
      const text = replyDrafts[commentId]?.trim();
      if (!text) return;

      const newReply: Comment = {
          id: `r-${Date.now()}`,
          author: currentUser,
          content: text,
          timestamp: 'Just now',
          reactions: {},
      };

      setActivePosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          
          const updatedComments = p.comments.map(c => {
              if (c.id === commentId) {
                  return { ...c, replies: [...(c.replies || []), newReply] };
              }
              return c;
          });

          return { ...p, comments: updatedComments };
      }));

      setReplyDrafts(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
  };

  const handleCommentReaction = (postId: string, commentId: string) => {
      setActivePosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          
          const updatedComments = p.comments.map(c => {
              if (c.id !== commentId) return c;
              
              const isLiked = c.userHasReacted;
              const newReactions = { ...(c.reactions || {}) };
              
              // Simple Love reaction for comments
              if (isLiked) {
                  newReactions['LOVE'] = Math.max(0, (newReactions['LOVE'] || 1) - 1);
              } else {
                  newReactions['LOVE'] = (newReactions['LOVE'] || 0) + 1;
              }
              
              return { ...c, reactions: newReactions, userHasReacted: !isLiked };
          });

          return { ...p, comments: updatedComments };
      }));
  };

  const filteredPosts = activePosts.filter(post => {
    // If it is an ad
    if (post.type === PostType.AD && post.adConfig) {
        const now = new Date();
        const start = new Date(post.adConfig.startDate);
        const end = new Date(post.adConfig.endDate);
        const isActive = now >= start && now <= end;
        
        // Admins see all ads for management, users only see active ones
        if (currentUser.isAdmin) return true;
        return isActive;
    }

    if (viewState === 'PROFILE') {
        // Show only my posts
        return post.author.id === currentUser.id;
    }

    if (specialty === Specialty.GENERAL) {
        // General Wall: Show General and ALL visibility posts
        return post.visibility === PostVisibility.GENERAL || post.visibility === PostVisibility.ALL;
    }
    
    // Specialty Wall: Show posts for this specialty matching visibility criteria
    return post.specialty === specialty && (
        post.visibility === PostVisibility.SPECIALTY || 
        post.visibility === PostVisibility.ALL ||
        post.visibility === PostVisibility.GENERAL 
    );
  });

  const getVisibilityIcon = (v: PostVisibility) => {
    switch (v) {
        case PostVisibility.PERSONAL: return <Lock size={14} />;
        case PostVisibility.SPECIALTY: return <Users size={14} />;
        case PostVisibility.GENERAL: return <Globe size={14} />;
        case PostVisibility.ALL: return <Eye size={14} />;
    }
  };

  const getVisibilityLabel = (v: PostVisibility) => {
    switch (v) {
        case PostVisibility.PERSONAL: return t.vis_personal;
        case PostVisibility.SPECIALTY: return t.vis_specialty;
        case PostVisibility.GENERAL: return t.vis_general;
        case PostVisibility.ALL: return t.vis_all;
    }
  };

  // Helper to check ad status
  const getAdStatus = (post: Post) => {
      if (!post.adConfig) return null;
      const now = new Date();
      const start = new Date(post.adConfig.startDate);
      const end = new Date(post.adConfig.endDate);
      
      if (now < start) return { label: t.adScheduled, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      if (now > end) return { label: t.adExpired, color: 'text-red-600 bg-red-50 border-red-200' };
      return { label: t.adActive, color: 'text-green-600 bg-green-50 border-green-200' };
  };

  return (
    <div className="max-w-3xl mx-auto py-4 md:py-8 px-2 md:px-4 space-y-6 md:space-y-8">
      
      {/* Create Post Widget */}
      <div className={`bg-white p-3 md:p-5 rounded-xl shadow-sm border ${isAdMode ? 'border-amber-400 ring-4 ring-amber-50' : 'border-slate-100'} mb-6 transition-all`}>
        {currentUser.isAdmin && (
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAdMode ? t.adManagement : 'Create Post'}</span>
                <button 
                    onClick={() => {
                        setIsAdMode(!isAdMode);
                        setIsPollMode(false);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${isAdMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    <Megaphone size={14} />
                    {isAdMode ? t.createAd : t.createAd}
                </button>
            </div>
        )}

        <div className="flex gap-4">
          <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
            {isAnonymous ? (
                <UserIcon className="text-slate-400" size={24} />
            ) : (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={isAdMode ? "Enter ad copy / promotional content here..." : (isAnonymous ? `${t.createPostPlaceholder} (Posting Anonymously)` : t.createPostPlaceholder)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all resize-none placeholder:text-slate-400"
              rows={isPollMode || isAdMode ? 3 : 1}
            />

            {/* Ad Scheduling Inputs */}
            {isAdMode && (
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                    <div>
                        <label className="block text-xs font-bold text-amber-800 mb-1.5">{t.adStartDate}</label>
                        <input 
                            type="date" 
                            value={adStartDate}
                            onChange={(e) => setAdStartDate(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-amber-800 mb-1.5">{t.adDuration}</label>
                        <select 
                            value={adDuration}
                            onChange={(e) => setAdDuration(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        >
                            <option value="7">{t.duration7}</option>
                            <option value="14">14 {t.days}</option>
                            <option value="30">{t.duration30}</option>
                            <option value="365">{t.durationCustom} (1 Year)</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1"><LinkIcon size={12}/> {t.adLink}</label>
                        <input 
                            type="url" 
                            value={adLink}
                            onChange={(e) => setAdLink(e.target.value)}
                            placeholder="https://example.com/promo"
                            className="w-full text-sm px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-amber-800 mb-1.5">{t.adBtnText}</label>
                        <input 
                            type="text" 
                            value={adBtnText}
                            onChange={(e) => setAdBtnText(e.target.value)}
                            placeholder="Learn More"
                            className="w-full text-sm px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        />
                    </div>
                </div>
            )}

            {/* Media Previews */}
            {mediaAttachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {mediaAttachments.map((media, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <button 
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    {media.type === MediaType.VIDEO && (
                      <div className="aspect-video relative">
                          <video src={media.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/30 p-2 rounded-full">
                                <Video className="text-white" size={20} />
                            </div>
                        </div>
                      </div>
                    )}
                    
                    {media.type === MediaType.IMAGE && (
                       <div className="aspect-video relative">
                          <img src={media.url} alt="Attachment" className="w-full h-full object-cover" />
                       </div>
                    )}

                    {media.type === MediaType.THREE_D && (
                        <div className="h-48">
                            <ThreeDModelViewer modelType={media.url} interactive={true} language={language} />
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Poll Creator */}
            {isPollMode && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <BarChart2 size={16} className="text-teal-600" />
                            {t.createPoll}
                        </span>
                        <button onClick={() => setIsPollMode(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded-full hover:shadow-sm">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pollOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-3 items-center group">
                                <span className="text-xs font-bold text-slate-300 w-4 text-center">{idx + 1}</span>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                        placeholder={`${t.option} ${idx + 1}`}
                                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 focus:outline-none transition-all bg-white text-slate-900"
                                    />
                                </div>
                                {pollOptions.length > 2 && (
                                    <button onClick={() => handleRemovePollOption(idx)} className="text-slate-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {pollOptions.length < 6 && (
                        <button 
                            onClick={handleAddPollOption}
                            className="mt-4 rtl:mr-7 ltr:ml-7 text-xs font-bold text-teal-600 flex items-center gap-2 hover:bg-teal-50 px-3 py-2 rounded-lg transition-colors border border-dashed border-teal-200 hover:border-teal-300 w-fit"
                        >
                            <Plus size={14} /> {t.addOption}
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-wrap justify-between items-center pt-2 border-t border-slate-50 gap-2">
              <div className="flex gap-2 relative">
                 <button 
                    onClick={togglePollMode}
                    disabled={isAdMode}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors ${isPollMode ? 'bg-teal-600 text-white shadow-md shadow-teal-100' : 'text-slate-500 hover:bg-slate-100 disabled:opacity-50'}`}
                 >
                    <BarChart2 size={16} /> {isPollMode ? t.pollActive : t.addPoll}
                 </button>
                 
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    multiple 
                    accept="image/*,video/*" 
                    className="hidden" 
                 />
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2"
                 >
                     <ImageIcon size={16} /> {t.photoVideo}
                 </button>

                 {/* 3D Model Button */}
                 <div ref={threeDMenuRef}>
                    <button 
                        onClick={() => setIs3DMenuOpen(!is3DMenuOpen)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors ${is3DMenuOpen ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Box size={16} /> {t.add3DModel}
                    </button>
                    {is3DMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {t.selectModel}
                            </div>
                            <button onClick={() => handle3DModelSelect('teeth')} className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">{t.modelTeeth}</button>
                            <button onClick={() => handle3DModelSelect('bones')} className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">{t.modelBones}</button>
                            <button onClick={() => handle3DModelSelect('muscles')} className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">{t.modelMuscles}</button>
                            <button onClick={() => handle3DModelSelect('nerves')} className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">{t.modelNerves}</button>
                            <button onClick={() => handle3DModelSelect('arteries')} className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">{t.modelArteries}</button>
                        </div>
                    )}
                 </div>
              </div>

              <div className="flex gap-2 items-center flex-wrap justify-end">
                  
                  {/* Anonymous Toggle */}
                  <button 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    disabled={isAdMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isAnonymous ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100 disabled:opacity-50'}`}
                    title={isAnonymous ? "Post will be anonymous" : "Post will show your name"}
                  >
                    {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span className="hidden sm:inline">{isAnonymous ? 'Anonymous' : 'Your Name'}</span>
                  </button>

                  {/* Visibility Selector */}
                  <div className="relative" ref={visibilityMenuRef}>
                    <button 
                        onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
                        disabled={isAdMode}
                        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-slate-200 disabled:opacity-50"
                    >
                        {getVisibilityIcon(postVisibility)}
                        <span className="max-w-[120px] truncate hidden sm:inline">
                           {getVisibilityLabel(postVisibility)}
                        </span>
                        <ChevronDown size={12} className={`transition-transform duration-200 ${isVisibilityMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Persistent Dropdown Menu */}
                    {isVisibilityMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {t.visibility}
                            </div>
                            <div className="p-1">
                                {[PostVisibility.PERSONAL, PostVisibility.SPECIALTY, PostVisibility.GENERAL, PostVisibility.ALL].map((v) => (
                                    <button 
                                        key={v}
                                        onClick={() => {
                                            setPostVisibility(v);
                                            // Keep open to allow checkbox selection if needed, or close on outside click
                                        }}
                                        className={`w-full text-left px-4 py-3 text-xs flex items-center gap-3 rounded-lg transition-colors ${postVisibility === v ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className={`p-1.5 rounded-full shrink-0 ${postVisibility === v ? 'bg-teal-100' : 'bg-slate-100'}`}>
                                            {getVisibilityIcon(v)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{getVisibilityLabel(v)}</span>
                                        </div>
                                        {postVisibility === v && <CheckCircle2 size={14} className="ml-auto" />}
                                    </button>
                                ))}
                            </div>

                            {/* Checkboxes Section */}
                            <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-teal-700 transition-colors select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={saveOptions} 
                                        onChange={toggleSaveOptions}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                                    />
                                    {t.saveOptions}
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-teal-700 transition-colors select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={oneTimeOption} 
                                        onChange={toggleOneTimeOption}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                                    />
                                    {t.thisTimeOnly}
                                </label>
                            </div>
                        </div>
                    )}
                  </div>

                  {/* Scheduling Menu (Disable in Ad Mode since it has own scheduling) */}
                  {!isAdMode && (
                  <div className="relative" ref={scheduleMenuRef}>
                      <button 
                         onClick={() => setIsScheduleMenuOpen(!isScheduleMenuOpen)}
                         className={`p-2 rounded-full transition-colors ${scheduleType !== 'NOW' ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:bg-slate-100'}`}
                         title={t.schedulePost}
                      >
                         <CalendarClock size={20} />
                      </button>

                      {isScheduleMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 p-4">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">{t.schedulePost}</h4>
                              <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-sm cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                                      <input type="radio" name="schedule" checked={scheduleType === 'NOW'} onChange={() => setScheduleType('NOW')} className="text-teal-600 focus:ring-teal-500" />
                                      <span className={scheduleType === 'NOW' ? 'font-bold text-teal-700' : 'text-slate-600'}>{t.postNow}</span>
                                  </label>

                                  <div className={`p-2 rounded-lg transition-colors ${scheduleType === 'DATE' ? 'bg-slate-50' : ''}`}>
                                      <label className="flex items-center gap-3 text-sm cursor-pointer mb-2">
                                          <input type="radio" name="schedule" checked={scheduleType === 'DATE'} onChange={() => setScheduleType('DATE')} className="text-teal-600 focus:ring-teal-500" />
                                          <span className={scheduleType === 'DATE' ? 'font-bold text-teal-700' : 'text-slate-600'}>{t.scheduleDate}</span>
                                      </label>
                                      {scheduleType === 'DATE' && (
                                          <div className="pl-7">
                                              <input 
                                                type="datetime-local" 
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                                              />
                                          </div>
                                      )}
                                  </div>

                                  <div className={`p-2 rounded-lg transition-colors ${scheduleType === 'DELAY' ? 'bg-slate-50' : ''}`}>
                                      <label className="flex items-center gap-3 text-sm cursor-pointer mb-2">
                                          <input type="radio" name="schedule" checked={scheduleType === 'DELAY'} onChange={() => setScheduleType('DELAY')} className="text-teal-600 focus:ring-teal-500" />
                                          <span className={scheduleType === 'DELAY' ? 'font-bold text-teal-700' : 'text-slate-600'}>{t.postAfter}</span>
                                      </label>
                                      {scheduleType === 'DELAY' && (
                                          <div className="pl-7 flex items-center gap-2">
                                              <input 
                                                type="number" 
                                                min="1"
                                                max="30"
                                                value={scheduleDelay}
                                                onChange={(e) => setScheduleDelay(parseInt(e.target.value) || 1)}
                                                className="w-16 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                                              />
                                              <span className="text-xs text-slate-500">{t.days}</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              <button 
                                onClick={() => setIsScheduleMenuOpen(false)}
                                className="w-full mt-4 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800"
                              >
                                Done
                              </button>
                          </div>
                      )}
                  </div>
                  )}

                  <button 
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() && mediaAttachments.length === 0}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${newPostContent.trim() || mediaAttachments.length > 0 ? (isAdMode ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-100') : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    {isAdMode ? <Megaphone size={16} /> : (scheduleType === 'NOW' ? (
                        <Send size={16} className="rtl:rotate-180" />
                    ) : (
                        <Calendar size={16} />
                    ))}
                    {isAdMode ? t.createAdBtn : (scheduleType === 'NOW' ? t.post : t.schedule)}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-500">{t.noPosts}</div>
        ) : (
          filteredPosts.map(post => {
            const adStatus = getAdStatus(post);
            
            return (
            <article key={post.id} className={`bg-white rounded-xl shadow-sm border ${post.isUrgent ? 'border-red-200 ring-1 ring-red-50' : (post.type === PostType.AD ? 'border-amber-200 ring-1 ring-amber-50' : 'border-slate-100')} overflow-visible transition-all hover:shadow-md relative`}>
              
              {/* Header */}
              <div className="p-3 md:p-4 flex items-center justify-between relative">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center shrink-0 ${post.isAnonymous ? 'bg-slate-100' : ''}`}>
                    {post.isAnonymous ? (
                        <UserIcon className="text-slate-400" size={20} />
                    ) : (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm md:text-base ${post.isAnonymous ? 'text-slate-500 italic' : 'text-slate-900'}`}>
                          {post.isAnonymous ? 'Anonymous Member' : post.author.name}
                      </h3>
                      {!post.isAnonymous && post.author.isVerified && <span className="text-blue-500 text-[10px] bg-blue-50 px-1 rounded-full">✓</span>}
                      {/* Admin status chip for Ads */}
                      {post.type === PostType.AD && adStatus && currentUser.isAdmin && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${adStatus.color}`}>
                            {adStatus.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                             {post.specialty}
                        </span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                        <span>•</span>
                        {getVisibilityIcon(post.visibility)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    {post.type === PostType.AD && (
                        <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            {t.sponsored}
                        </span>
                    )}

                    {post.isSaved && (
                        <div className="text-teal-600 animate-in fade-in zoom-in duration-300">
                            <Bookmark size={18} className="fill-teal-600" />
                        </div>
                    )}

                    {post.poll && (
                        <span className="hidden sm:flex bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] px-2 py-1 rounded-full font-bold items-center gap-1">
                            <BarChart2 size={12} /> {t.consultation}
                        </span>
                    )}
                    {post.isUrgent && (
                        <span className="hidden sm:flex bg-red-50 text-red-700 border border-red-100 text-[10px] px-2 py-1 rounded-full font-bold items-center gap-1">
                            <AlertCircle size={12} /> {t.urgent}
                        </span>
                    )}

                    {/* Post Options Menu */}
                    <div className="relative ml-1 md:ml-2">
                        <button 
                            onClick={(e) => handleMenuClick(e, post.id)} 
                            className="post-options-menu-btn p-1.5 md:p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <MoreVertical size={18} />
                        </button>
                        
                        {activeMenuPostId === post.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                                <button 
                                    onClick={() => handleMenuAction(post.id, 'SAVE')} 
                                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700"
                                >
                                    <Bookmark size={16} className={post.isSaved ? "fill-teal-600 text-teal-600" : ""} /> 
                                    {post.isSaved ? t.unsavePost : t.savePost}
                                </button>
                                <button 
                                    onClick={() => handleMenuAction(post.id, 'REPORT')} 
                                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 text-red-600"
                                >
                                    <Flag size={16} /> {t.reportPost}
                                </button>
                                <button 
                                    onClick={() => handleMenuAction(post.id, 'SHARE')} 
                                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700"
                                >
                                    <Share2 size={16} /> {t.sharePost}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-3 md:px-5 pb-3">
                <h4 className="font-bold text-base md:text-lg text-slate-800 mb-2">{post.title}</h4>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm md:text-[15px]">{post.content}</p>
              </div>

              {/* Poll Render */}
              {post.poll && (
                  <div className="px-3 md:px-5 py-2 mb-4">
                      <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <BarChart2 size={14} className="text-teal-500"/> {t.createPoll}
                            </p>
                            <span className="text-xs font-semibold text-slate-400">{post.poll.totalVotes} votes</span>
                          </div>
                          
                          <div className="space-y-3">
                              {post.poll.options.map(option => {
                                  const percentage = post.poll!.totalVotes > 0 ? Math.round((option.votes / post.poll!.totalVotes) * 100) : 0;
                                  const isSelected = post.poll!.userVotedOptionId === option.id;
                                  
                                  return (
                                      <button 
                                        key={option.id}
                                        onClick={() => handleVote(post.id, option.id)}
                                        disabled={!!post.poll!.userVotedOptionId}
                                        className={`w-full relative min-h-[44px] rounded-lg overflow-hidden border transition-all group text-left rtl:text-right ${
                                            isSelected 
                                            ? 'border-teal-500 ring-1 ring-teal-500 z-10' 
                                            : 'border-slate-200 hover:border-teal-300'
                                        }`}
                                      >
                                          {/* Progress Bar Background */}
                                          <div 
                                            className={`absolute top-0 bottom-0 transition-all duration-700 ease-out ltr:left-0 rtl:right-0 ${
                                                isSelected ? 'bg-teal-100/70' : 'bg-slate-200/50'
                                            }`}
                                            style={{ 
                                                width: post.poll!.userVotedOptionId ? `${percentage}%` : '0%' 
                                            }}
                                          />
                                          
                                          {/* Content Layout */}
                                          <div className="absolute inset-0 flex justify-between items-center px-4 z-10 gap-3">
                                              <div className="flex items-center gap-3">
                                                  {/* Radio Circle / Checkmark */}
                                                  <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                      isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-400'
                                                  }`}>
                                                      {isSelected && <CheckCircle2 size={10} className="text-white" />}
                                                  </div>
                                                  <span className={`text-sm font-semibold ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                                                      {option.text}
                                                  </span>
                                              </div>

                                              {/* Percentage (Only show if voted) */}
                                              {post.poll!.userVotedOptionId && (
                                                  <div className="flex items-center gap-2 animate-in fade-in duration-500">
                                                      <span className="text-sm font-bold text-slate-700">{percentage}%</span>
                                                  </div>
                                              )}
                                          </div>
                                      </button>
                                  );
                              })}
                          </div>
                          {!post.poll.userVotedOptionId && (
                             <p className="text-center text-xs text-slate-400 mt-3 italic">Select an option to see community consensus</p>
                          )}
                      </div>
                  </div>
              )}

              {/* Media Attachments */}
              {post.media && post.media.length > 0 && (
                <div className={`mt-2 bg-slate-100 ${post.media.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}`}>
                  {post.media.map((item, idx) => (
                     <div key={idx} className={`relative ${post.media!.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
                        {item.type === MediaType.VIDEO && (
                            <video src={item.url} controls className="w-full h-full object-cover max-h-[400px] md:max-h-[500px]" />
                        )}
                        {item.type === MediaType.IMAGE && (
                            <img src={item.url} alt="Post content" className="w-full h-full object-cover max-h-[400px] md:max-h-[500px]" />
                        )}
                        {item.type === MediaType.THREE_D && (
                            <div className="h-[350px]">
                                <ThreeDModelViewer modelType={item.url} interactive={true} language={language} />
                            </div>
                        )}
                     </div>
                  ))}
                </div>
              )}

              {/* AI Assistant Section */}
              {(post.type === PostType.CASE || post.type === PostType.URGENT) && (
                <div className="px-3 md:px-5 mt-4">
                  {!aiResponses[post.id] && (
                    <button 
                      onClick={() => handleConsultAI(post)}
                      disabled={aiLoading === post.id}
                      className="text-teal-600 text-sm font-semibold flex items-center gap-2 hover:bg-teal-50 px-4 py-2.5 rounded-lg transition-colors w-full md:w-auto border border-teal-100 justify-center shadow-sm"
                    >
                      <Bot size={18} />
                      {aiLoading === post.id ? t.analyzing : t.aiConsult}
                    </button>
                  )}
                  
                  {aiResponses[post.id] && (
                    <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-xl p-5 mt-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-teal-800 font-bold mb-3 text-sm border-b border-teal-100 pb-2">
                        <Bot size={18} /> AI Consultant Evaluation
                      </div>
                      <div className="text-sm text-slate-700 prose prose-teal max-w-none leading-relaxed">
                        <ReactMarkdown>{aiResponses[post.id]}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ad CTA Section */}
              {post.type === PostType.AD && post.adConfig && post.adConfig.ctaLink && (
                  <div className="px-3 md:px-5 mt-4">
                      <a 
                        href={post.adConfig.ctaLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                          {post.adConfig.ctaText || "Learn More"} <ExternalLink size={16} />
                      </a>
                  </div>
              )}

              {/* Footer Actions */}
              <div className="p-2 px-3 md:px-4 border-t border-slate-50 mt-4">
                  {/* Reaction Counts Display */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 px-2">
                      {(Object.entries(post.reactions) as [ReactionType, number][]).map(([type, count]) => {
                          if (count === 0) return null;
                          return (
                              <div key={type} className="flex items-center gap-1">
                                  {type === ReactionType.LIKE && <ThumbsUp size={12} className="fill-blue-500 text-blue-500" />}
                                  {type === ReactionType.LOVE && <Heart size={12} className="fill-red-500 text-red-500" />}
                                  {type === ReactionType.THINKING && <Settings size={12} className="fill-slate-500 text-slate-500" />}
                                  {type === ReactionType.LEARNED && <Lightbulb size={12} className="fill-yellow-500 text-yellow-500" />}
                                  {type === ReactionType.SURPRISED && <AlertCircle size={12} className="text-orange-500" />}
                                  <span>{count}</span>
                              </div>
                          );
                      })}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Interactive Reactions */}
                    <div className="flex items-center gap-0.5 md:gap-1 overflow-x-auto no-scrollbar max-w-[60%]">
                        <button 
                            onClick={() => handleReaction(post.id, ReactionType.LIKE)}
                            className={`p-1.5 md:p-2 rounded-full transition-all hover:bg-slate-100 ${post.userReaction === ReactionType.LIKE ? 'bg-blue-50' : ''}`}
                            title="Like (Thumb Up)"
                        >
                            <ThumbsUp 
                                size={18} 
                                className={`transition-colors ${post.userReaction === ReactionType.LIKE ? 'fill-blue-500 text-blue-500' : 'text-slate-400'}`} 
                            />
                        </button>
                        
                        <button 
                            onClick={() => handleReaction(post.id, ReactionType.LOVE)}
                            className={`p-1.5 md:p-2 rounded-full transition-all hover:bg-slate-100 ${post.userReaction === ReactionType.LOVE ? 'bg-red-50' : ''}`}
                            title="Love (Heart)"
                        >
                            <Heart
                                size={18} 
                                className={`transition-colors ${post.userReaction === ReactionType.LOVE ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} 
                            />
                        </button>

                        <button 
                            onClick={() => handleReaction(post.id, ReactionType.THINKING)}
                            className={`p-1.5 md:p-2 rounded-full transition-all hover:bg-slate-100 ${post.userReaction === ReactionType.THINKING ? 'bg-slate-100' : ''}`}
                            title="Thinking (Gear)"
                        >
                            <Settings
                                size={18} 
                                className={`transition-colors ${post.userReaction === ReactionType.THINKING ? 'fill-slate-600 text-slate-600' : 'text-slate-400'}`} 
                            />
                        </button>

                         <button 
                            onClick={() => handleReaction(post.id, ReactionType.SURPRISED)}
                            className={`p-1.5 md:p-2 rounded-full transition-all hover:bg-slate-100 ${post.userReaction === ReactionType.SURPRISED ? 'bg-orange-50' : ''}`}
                            title="Surprised (Exclamation)"
                        >
                            <AlertCircle
                                size={18} 
                                className={`transition-colors ${post.userReaction === ReactionType.SURPRISED ? 'text-orange-500' : 'text-slate-400'}`} 
                            />
                        </button>

                        <button 
                            onClick={() => handleReaction(post.id, ReactionType.LEARNED)}
                            className={`p-1.5 md:p-2 rounded-full transition-all hover:bg-yellow-50 ${post.userReaction === ReactionType.LEARNED ? 'bg-yellow-100' : ''}`}
                            title="Learned (Light Bulb)"
                        >
                             <Lightbulb
                                size={18} 
                                className={`transition-colors ${post.userReaction === ReactionType.LEARNED ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} 
                            />
                        </button>
                    </div>

                    <div className="flex gap-2 md:gap-4 pl-2">
                        <button 
                            onClick={() => toggleComments(post.id)}
                            className={`flex items-center gap-1.5 md:gap-2 text-slate-500 hover:text-teal-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 ${expandedComments.has(post.id) ? 'text-teal-600 bg-teal-50' : ''}`}
                        >
                            <MessageSquare size={18} /> <span className="text-sm font-medium">{post.comments.length}</span>
                        </button>
                        <button 
                            onClick={() => handleMenuAction(post.id, 'SHARE')}
                            className="flex items-center gap-1.5 md:gap-2 text-slate-500 hover:text-teal-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
              </div>

              {/* Comment Section */}
              {expandedComments.has(post.id) && (
                  <div className="bg-slate-50 border-t border-slate-100 p-3 md:p-4 animate-in fade-in slide-in-from-top-1">
                      {/* Existing Comments */}
                      <div className="space-y-4 mb-4">
                          {post.comments.length === 0 ? (
                              <p className="text-center text-slate-400 text-sm italic py-2">No comments yet. Be the first!</p>
                          ) : (
                              post.comments.map(comment => (
                                  <div key={comment.id}>
                                      <div className="flex gap-2 md:gap-3">
                                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shrink-0 overflow-hidden">
                                              <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="flex-1">
                                              <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-slate-200 shadow-sm relative group">
                                                  <div className="flex justify-between items-start">
                                                      <span className="font-bold text-sm text-slate-800">{comment.author.name}</span>
                                                      <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                                                  </div>
                                                  <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                                                  
                                                  {/* Comment Reactions Display */}
                                                  {comment.reactions && Object.keys(comment.reactions).length > 0 && (
                                                      <div className="absolute -bottom-2 right-2 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1 text-[10px]">
                                                          <Heart size={10} className="fill-red-500 text-red-500" />
                                                          <span>{comment.reactions['LOVE']}</span>
                                                      </div>
                                                  )}
                                              </div>
                                              <div className="flex items-center gap-4 mt-1 ml-2 text-xs font-semibold text-slate-500">
                                                  <button 
                                                      onClick={() => handleCommentReaction(post.id, comment.id)}
                                                      className={`hover:text-red-500 transition-colors flex items-center gap-1 ${comment.userHasReacted ? 'text-red-500' : ''}`}
                                                  >
                                                      {t.like}
                                                  </button>
                                                  <button 
                                                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                                      className="hover:text-teal-600 transition-colors"
                                                  >
                                                      {t.reply}
                                                  </button>
                                              </div>
                                              
                                              {/* Replies */}
                                              {comment.replies && comment.replies.length > 0 && (
                                                  <div className="mt-2 space-y-2 md:mt-3 md:space-y-3">
                                                      {comment.replies.map(reply => (
                                                          <div key={reply.id} className="flex gap-2 md:gap-3">
                                                              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 shrink-0 overflow-hidden">
                                                                  <img src={reply.author.avatar} alt={reply.author.name} className="w-full h-full object-cover" />
                                                              </div>
                                                              <div className="flex-1">
                                                                  <div className="bg-slate-100/50 rounded-2xl rounded-tl-none p-2 border border-slate-100">
                                                                      <div className="flex justify-between items-start">
                                                                          <span className="font-bold text-xs text-slate-800">{reply.author.name}</span>
                                                                          <span className="text-[9px] text-slate-400">{reply.timestamp}</span>
                                                                      </div>
                                                                      <p className="text-xs text-slate-600 mt-1">{reply.content}</p>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              )}

                                              {/* Reply Input */}
                                              {activeReplyId === comment.id && (
                                                  <div className="mt-2 flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                                                      <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-200">
                                                          <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                                                      </div>
                                                      <div className="flex-1 relative">
                                                          <input
                                                              type="text"
                                                              autoFocus
                                                              value={replyDrafts[comment.id] || ''}
                                                              onChange={(e) => setReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                              onKeyDown={(e) => e.key === 'Enter' && submitReply(post.id, comment.id)}
                                                              placeholder={t.writeReply}
                                                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-200 transition-all pr-8"
                                                          />
                                                          <button 
                                                              onClick={() => submitReply(post.id, comment.id)}
                                                              disabled={!replyDrafts[comment.id]?.trim()}
                                                              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-teal-600 hover:bg-teal-50 rounded-full disabled:text-slate-300 transition-colors"
                                                          >
                                                              <Send size={12} className="rtl:rotate-180" />
                                                          </button>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>

                      {/* Comment Input */}
                      {post.allowComments !== false ? (
                          <div className="flex gap-2 md:gap-3 items-end">
                              <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-200">
                                  <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 relative">
                                  <textarea
                                      value={commentDrafts[post.id] || ''}
                                      onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      placeholder={t.writeComment}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all resize-none pr-10"
                                      rows={1}
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                              e.preventDefault();
                                              submitComment(post.id);
                                          }
                                      }}
                                  />
                                  <button 
                                      onClick={() => submitComment(post.id)}
                                      disabled={!commentDrafts[post.id]?.trim()}
                                      className="absolute right-2 bottom-2 p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                                  >
                                      <Send size={14} className="rtl:rotate-180" />
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center text-slate-400 text-sm bg-slate-100 p-2 rounded-lg flex items-center justify-center gap-2">
                              <Lock size={14} /> {t.commentsDisabled}
                          </div>
                      )}
                  </div>
              )}
            </article>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Feed;
