import React from 'react';
import { Home, Phone, MessageCircle, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen }) => {
  const navItems = [
    { id: 'menu', icon: <Home size={24} />, label: 'Home' },
    { id: 'calling', icon: <Phone size={24} />, label: 'Calls' },
    { id: 'messenger', icon: <MessageCircle size={24} />, label: 'Chat' },
    { id: 'profile', icon: <User size={24} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 h-16 glass-panel rounded-full flex items-center justify-between px-6 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id as Screen)}
          className={`p-2 rounded-full transition-all duration-300 ${
            currentScreen === item.id 
              ? 'bg-white text-purple-600 shadow-lg scale-110' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;