import React from 'react';
import { Search, Mic, MessageSquare, Megaphone, Lightbulb, Bell, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Screen } from '../types';

interface MainMenuProps {
  setScreen: (screen: Screen) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ setScreen }) => {
  const menuItems = [
    { icon: <Mic className="text-pink-400" size={24} />, title: "Voice Notes", sub: "Record your thoughts" },
    { icon: <MessageSquare className="text-purple-400" size={24} />, title: "Gemini Chat", sub: "Ask AI anything" },
    { icon: <ImageIcon className="text-blue-400" size={24} />, title: "Gallery", sub: "View your photos" },
    { icon: <Megaphone className="text-yellow-400" size={24} />, title: "Announcements", sub: "Latest updates" },
    { icon: <Lightbulb className="text-green-400" size={24} />, title: "Ideas", sub: "Brainstorming" },
  ];

  return (
    <div className="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setScreen('profile')}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white/50 flex items-center justify-center font-bold text-lg group-hover:border-white transition-colors">
            JD
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight group-hover:text-pink-300 transition-colors uppercase tracking-widest">Oja-odan</h2>
            <p className="text-xs text-white/60">Welcome back, John</p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 text-white/60" size={20} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input outline-none focus:border-white/40 transition-all"
        />
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 gap-4">
        {menuItems.map((item, index) => (
          <GlassCard key={index} className="flex items-center gap-4 hover:bg-white/15 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
              {item.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-white/50">{item.sub}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
            </div>
          </GlassCard>
        ))}
      </div>
        
      {/* Status Card */}
      <GlassCard className="mt-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
         <div className="flex items-center gap-3 mb-2">
            <Bell size={18} className="text-yellow-300"/>
            <span className="font-semibold text-sm uppercase tracking-wider text-white/80">Notification</span>
         </div>
         <p className="text-sm leading-relaxed">
            You have 3 unread messages from the design team and a missed call from Sarah.
         </p>
      </GlassCard>
    </div>
  );
};

export default MainMenu;