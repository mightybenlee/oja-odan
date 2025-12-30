
import React from 'react';
import { ArrowRight, Users, Heart, Sparkles, Globe } from 'lucide-react';
import { Screen } from '../types';

interface LandingProps {
  setScreen: (screen: Screen) => void;
}

const Landing: React.FC<LandingProps> = ({ setScreen }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar animate-in bg-black/5">
      {/* Brand Hero */}
      <div className="relative h-[480px] shrink-0 overflow-hidden rounded-b-[4.5rem] shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover transform scale-110"
          alt="Oja-odan Community"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b4b] via-black/30 to-transparent"></div>
        <div className="absolute bottom-16 left-10 right-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-pink-400" size={20} />
            <span className="text-pink-300 text-[11px] font-black uppercase tracking-[0.5em]">The Digital Sanctuary</span>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white mb-3 drop-shadow-2xl">Oja-odan</h1>
          <p className="text-white/80 text-base leading-relaxed max-w-[320px] font-medium">
            A safe haven where our culture meets the future of social connection.
          </p>
        </div>
      </div>

      <div className="p-10 space-y-14">
        <div className="space-y-5">
          <h2 className="text-3xl font-bold leading-tight">Your Heritage. <br/>Digitally Reimagined.</h2>
          <p className="text-sm text-white/60 leading-relaxed font-light">
            In Oja-odan, every interaction is personal. We bridge the gap between our traditions and the global digital ecosystem.
          </p>
        </div>

        {/* Community Gallery */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] uppercase font-black tracking-[0.3em] opacity-30 flex items-center gap-2">
                    <Globe size={14} /> Circle Highlights
                </h3>
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1b4b] bg-white/10 overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?img=${i+20}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Family" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                        <span className="text-[10px] font-black uppercase tracking-widest">Community</span>
                    </div>
                </div>
                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Friends" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                        <span className="text-[10px] font-black uppercase tracking-widest">Gatherings</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 space-y-4 pb-20">
          <button 
            onClick={() => setScreen('register')}
            className="w-full bg-white text-[#4c1d95] font-black py-6 rounded-[2.5rem] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 tracking-[0.2em] text-xs"
          >
            CREATE NEW ACCOUNT <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={() => setScreen('login')}
            className="w-full glass-panel border border-white/20 text-white font-bold py-6 rounded-[2.5rem] hover:bg-white/20 transition-all text-xs tracking-[0.2em]"
          >
            I AM ALREADY A MEMBER
          </button>
        </div>
      </div>

      <div className="p-10 border-t border-white/5 text-center space-y-4 opacity-30 mt-auto pb-12">
        <div className="flex justify-center gap-8">
            <Heart size={18} /> <Users size={18} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.6em] font-medium">Oja-odan Community Ecosystem © 2024</p>
      </div>
    </div>
  );
};

export default Landing;
