
import React, { useState, useEffect } from 'react';
import { User, Conversation, Message, Language } from '../types';
import { MOCK_CONVERSATIONS, TRANSLATIONS } from '../constants';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';

interface MessagingProps {
  currentUser: User;
  initialTargetUser?: User | null;
  language: Language;
}

const Messaging: React.FC<MessagingProps> = ({ currentUser, initialTargetUser, language }) => {
  const t = TRANSLATIONS[language];
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // Handle initializing a conversation with a specific user (from profile)
  useEffect(() => {
    if (initialTargetUser) {
        const existingConv = conversations.find(c => c.participants.some(p => p.id === initialTargetUser.id));
        if (existingConv) {
            setActiveConversationId(existingConv.id);
        } else {
            // Create a temporary/new conversation structure for UI
            const newId = `new-${Date.now()}`;
            const newConv: Conversation = {
                id: newId,
                participants: [initialTargetUser],
                messages: [],
                unreadCount: 0
            };
            setConversations([newConv, ...conversations]);
            setActiveConversationId(newId);
        }
    } else if (conversations.length > 0 && !activeConversationId) {
        // Select first by default if desktop
        // setActiveConversationId(conversations[0].id);
    }
  }, [initialTargetUser]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeParticipant = activeConversation?.participants.find(p => p.id !== currentUser.id);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversationId) return;

    const newMessage: Message = {
        id: `m-${Date.now()}`,
        senderId: currentUser.id,
        content: messageText,
        timestamp: 'Just now',
        isRead: false
    };

    setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
            return {
                ...c,
                messages: [...c.messages, newMessage]
            };
        }
        return c;
    }));
    
    setMessageText('');
  };

  return (
    <div className="flex-1 flex flex-col md:my-6 md:mx-auto w-full md:max-w-6xl md:h-[calc(100vh-140px)] bg-white md:rounded-2xl md:shadow-sm md:border border-slate-200 overflow-hidden h-[calc(100vh-65px)]">
       <div className="flex h-full">
         {/* Sidebar List */}
         <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100">
               <h2 className="font-bold text-xl text-slate-800 mb-4">{t.messages}</h2>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder={t.search}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white border focus:border-teal-200 rounded-lg text-sm focus:outline-none transition-all"
                  />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
               {conversations.map(conv => {
                   const participant = conv.participants.find(p => p.id !== currentUser.id);
                   if (!participant) return null;
                   const lastMsg = conv.messages[conv.messages.length - 1];
                   
                   return (
                       <button 
                          key={conv.id}
                          onClick={() => setActiveConversationId(conv.id)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left rtl:text-right ${activeConversationId === conv.id ? 'bg-teal-50/50' : ''}`}
                       >
                           <div className="relative w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                               <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                               {participant.status === 'AVAILABLE' && (
                                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                               )}
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-baseline mb-1">
                                   <span className="font-bold text-slate-800 text-sm truncate">{participant.name}</span>
                                   {lastMsg && <span className="text-[10px] text-slate-400">{lastMsg.timestamp}</span>}
                               </div>
                               <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                   {lastMsg ? lastMsg.content : t.startConversation}
                               </p>
                           </div>
                           {conv.unreadCount > 0 && (
                               <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                   {conv.unreadCount}
                               </div>
                           )}
                       </button>
                   );
               })}
            </div>
         </div>

         {/* Chat Area */}
         <div className={`flex-1 flex flex-col bg-slate-50/50 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            {activeConversationId && activeParticipant ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                      <div className="flex items-center gap-3">
                          <button 
                             onClick={() => setActiveConversationId(null)}
                             className="md:hidden text-slate-500"
                          >
                              Back
                          </button>
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                              <img src={activeParticipant.avatar} alt={activeParticipant.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 text-sm">{activeParticipant.name}</h3>
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                  {activeParticipant.status === 'AVAILABLE' ? 'Online' : 'Offline'}
                              </span>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={20} /></button>
                          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={20} /></button>
                          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                      </div>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {activeConversation!.messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <p>{t.noMessages}</p>
                              <p className="text-sm">Say hello to Dr. {activeParticipant.name.split(' ')[1]}</p>
                          </div>
                      ) : (
                          activeConversation!.messages.map(msg => {
                              const isMe = msg.senderId === currentUser.id;
                              return (
                                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm text-sm ${
                                          isMe 
                                          ? 'bg-teal-600 text-white rounded-br-none' 
                                          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                                      }`}>
                                          <p>{msg.content}</p>
                                          <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                                              {msg.timestamp}
                                          </div>
                                      </div>
                                  </div>
                              );
                          })
                      )}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-slate-200">
                      <div className="flex gap-2">
                          <input
                             type="text"
                             value={messageText}
                             onChange={(e) => setMessageText(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                             placeholder={t.typeMessage}
                             className="flex-1 bg-slate-100 border-transparent focus:bg-white border focus:border-teal-300 rounded-full px-4 py-3 text-sm focus:outline-none transition-all"
                          />
                          <button 
                              onClick={handleSendMessage}
                              disabled={!messageText.trim()}
                              className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-md"
                          >
                              <Send size={20} className="rtl:rotate-180" />
                          </button>
                      </div>
                  </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Send size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">{t.messages}</h3>
                    <p>{t.startConversation}</p>
                </div>
            )}
         </div>
       </div>
    </div>
  );
};

export default Messaging;
