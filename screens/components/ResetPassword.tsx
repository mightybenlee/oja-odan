
import React, { useState } from 'react';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Screen } from '../types';

interface ResetProps {
  setScreen: (screen: Screen) => void;
}

const ResetPassword: React.FC<ResetProps> = ({ setScreen }) => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-in">
        <GlassCard className="w-full p-10 rounded-[3rem] text-center backdrop-blur-3xl">
            <div className="w-20 h-20 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-3">Recovery</h1>
            <p className="text-sm text-white/50 mb-10 leading-relaxed">
                {submitted 
                    ? "Check your email inbox for the secure reset link." 
                    : "Enter your registered email to regain access back to your account."}
            </p>

            {!submitted ? (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                    <div className="relative text-left">
                        <Mail className="absolute left-4 top-4 text-white/40" size={18} />
                        <input name="email" type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 rounded-2xl glass-input text-sm" required />
                    </div>
                    <button type="submit" className="w-full bg-white text-[#4c1d95] font-black py-5 rounded-[2rem] shadow-2xl tracking-widest text-sm">
                        SEND RECOVERY LINK
                    </button>
                </form>
            ) : (
                <button onClick={() => setScreen('login')} className="w-full bg-white text-[#4c1d95] font-black py-5 rounded-[2rem] shadow-2xl tracking-widest text-sm">
                    BACK TO LOGIN
                </button>
            )}

            <button onClick={() => setScreen('login')} className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mx-auto hover:opacity-100 transition-opacity">
                <ArrowLeft size={14} /> Back
            </button>
        </GlassCard>
    </div>
  );
};

export default ResetPassword;
