import React from 'react';
import { Phone, Video, MoreHorizontal, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Contact } from '../types';

const Calling: React.FC = () => {
  const contacts: Contact[] = [
    { id: '1', name: 'June', avatar: 'https://picsum.photos/100/100?random=1', time: '10:30 AM', missedCall: true },
    { id: '2', name: 'Billie', avatar: 'https://picsum.photos/100/100?random=2', time: 'Yesterday' },
    { id: '3', name: 'Banny', avatar: 'https://picsum.photos/100/100?random=3', time: 'Yesterday' },
    { id: '4', name: 'Vittoli', avatar: 'https://picsum.photos/100/100?random=4', time: 'Mon' },
    { id: '5', name: 'Carlo', avatar: 'https://picsum.photos/100/100?random=5', time: 'Sun', missedCall: true },
    { id: '6', name: 'Sarah', avatar: 'https://picsum.photos/100/100?random=6', time: 'Sun' },
  ];

  return (
    <div className="flex flex-col h-full pt-4 pb-24 px-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                 <Phone size={20} />
             </div>
             <div>
                <h2 className="font-bold text-lg leading-tight">CALLING</h2>
                <p className="text-xs text-white/60">Recent History</p>
             </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal />
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <GlassCard key={contact.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={contact.avatar} alt={contact.name} className="w-14 h-14 rounded-full border-2 border-white/20 object-cover" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1b4b] ${contact.missedCall ? 'bg-red-500' : 'bg-green-500'}`}></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{contact.name}</h3>
                <div className="flex items-center gap-1 text-xs text-white/50">
                    {contact.missedCall ? <ArrowDownLeft size={12} className="text-red-400"/> : <ArrowUpRight size={12} className="text-green-400"/>}
                    <span>{contact.time}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="p-3 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-900/20">
                 <Phone size={18} fill="currentColor" />
               </button>
            </div>
          </GlassCard>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
            View All Contacts
        </button>
      </div>
    </div>
  );
};

export default Calling;