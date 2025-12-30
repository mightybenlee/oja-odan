import React from 'react';
import { MessageCircle, MoreHorizontal, Edit } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Contact, Screen } from '../types';

interface MessengerProps {
  onChatSelect: (contactId: string) => void;
}

const Messenger: React.FC<MessengerProps> = ({ onChatSelect }) => {
  const chats: Contact[] = [
    { id: 'ai', name: 'Gemini AI', avatar: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', lastMessage: 'How can I help you today?', time: 'Now' },
    { id: '1', name: 'Jane', avatar: 'https://picsum.photos/100/100?random=10', lastMessage: 'See you at 8pm!', time: '22:07' },
    { id: '2', name: 'Berto', avatar: 'https://picsum.photos/100/100?random=11', lastMessage: 'Can you send the file?', time: '22:05' },
    { id: '3', name: 'Team Alpha', avatar: 'https://picsum.photos/100/100?random=12', lastMessage: 'Meeting is rescheduled.', time: '19:30' },
    { id: '4', name: 'Mom', avatar: 'https://picsum.photos/100/100?random=13', lastMessage: 'Call me when you can.', time: '14:20' },
  ];

  return (
    <div className="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                 <MessageCircle size={20} />
             </div>
             <div>
                <h2 className="font-bold text-lg leading-tight">MESSENGER</h2>
                <p className="text-xs text-white/60">5 Unread messages</p>
             </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Edit size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <MoreHorizontal size={20} />
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {chats.map((chat) => (
          <GlassCard 
            key={chat.id} 
            onClick={() => onChatSelect(chat.id)}
            className="flex items-center justify-between group relative overflow-hidden"
          >
             {/* Dynamic background for AI chat */}
             {chat.id === 'ai' && (
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
             )}
             
            <div className="flex items-center gap-4 relative z-10 w-full">
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-full border-2 ${chat.id === 'ai' ? 'border-purple-400 p-1 bg-white' : 'border-white/20'} overflow-hidden`}>
                     <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover rounded-full" />
                </div>
                {chat.id !== 'ai' && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1b4b] bg-green-500"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-bold text-lg truncate ${chat.id === 'ai' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300' : ''}`}>
                        {chat.name} {chat.id === 'ai' && '✨'}
                    </h3>
                    <span className="text-xs text-white/40">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-white/60 truncate pr-4">{chat.lastMessage}</p>
                    {chat.id !== 'ai' && (
                        <div className="flex items-center justify-center w-5 h-5 bg-pink-500 rounded-full text-[10px] font-bold">1</div>
                    )}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Messenger;