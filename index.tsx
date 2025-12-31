
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, MessageCircle, User as UserIcon, Send, 
  Mail, Lock, Camera, Chrome, Facebook, Apple, 
  ShieldCheck, LogOut, Eye, EyeOff, Sparkles, Globe,
  Heart, Share2, MessageSquare, Plus, Bell, MoreHorizontal,
  ArrowRight, ArrowLeft, Loader2, Zap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider,
  signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";

// =========================================================
// 1. FIREBASE CONFIGURATION (PASTE YOUR DETAILS HERE)
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"
};

// --- SAFE INITIALIZATION ---
let auth: any = null;
let googleProvider: any = null;
let facebookProvider: any = null;
let appleProvider: any = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
  appleProvider = new OAuthProvider('apple.com');
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// =========================================================
// 2. MAIN APP COMPONENT
// =========================================================
const App: React.FC = () => {
  const [screen, setScreen] = useState<'landing' | 'login' | 'register' | 'home' | 'oracle' | 'messenger' | 'profile'>('landing');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- AUTH OBSERVER ---
  useEffect(() => {
    if (!auth) {
      setError("Firebase not initialized. Check your config in index.tsx");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'Sanctuary Member',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=12'
        });
        setScreen('home');
      } else {
        setUser(null);
        if (screen === 'home' || screen === 'profile') setScreen('landing');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---
  const handleSocialAuth = async (platform: 'google' | 'facebook' | 'apple') => {
    if (!auth) return alert("Firebase keys missing!");
    const provider = platform === 'google' ? googleProvider : platform === 'facebook' ? facebookProvider : appleProvider;
    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      alert(`Social Auth Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent, isReg: boolean) => {
    e.preventDefault();
    if (!auth) return alert("Firebase keys missing!");
    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement).value;
    const password = (form.querySelector('input[type="password"]') as HTMLInputElement).value;

    try {
      setIsLoading(true);
      if (isReg) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI COMPONENTS ---
  const GlassCard = ({ children, className = "", onClick }: any) => (
    <div onClick={onClick} className={`glass-panel rounded-[2.5rem] p-5 transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}>
      {children}
    </div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-6 left-6 right-6 h-16 glass-panel rounded-full flex items-center justify-between px-8 z-50 border-white/10 shadow-2xl">
      {[
        { id: 'home', icon: <Home size={22} /> },
        { id: 'messenger', icon: <MessageCircle size={22} /> },
        { id: 'oracle', icon: <Sparkles size={22} className="text-pink-400" /> },
        { id: 'profile', icon: <UserIcon size={22} /> }
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id as any)}
          className={`p-2 rounded-full transition-all ${screen === item.id ? 'bg-white text-indigo-950 shadow-xl scale-110' : 'text-white/40'}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );

  // --- SCREEN RENDERS ---
  const renderLanding = () => (
    <div className="flex flex-col h-full animate-in">
      <div className="relative h-[60%] shrink-0 overflow-hidden rounded-b-[4.5rem]">
        <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-black/20 to-transparent"></div>
        <div className="absolute bottom-12 left-10 right-10">
          <h1 className="text-7xl font-black italic tracking-tighter text-white mb-2 leading-none">OJA<br/>ODAN</h1>
          <p className="text-white/60 text-sm font-medium">Digital Heritage. Community Unity.</p>
        </div>
      </div>
      <div className="p-10 flex flex-col justify-center flex-1 space-y-4">
        <button onClick={() => setScreen('register')} className="w-full bg-white text-indigo-950 font-black py-6 rounded-full shadow-2xl tracking-[0.2em] text-xs flex items-center justify-center gap-2">
          JOIN THE SANCTUARY <ArrowRight size={18} />
        </button>
        <button onClick={() => setScreen('login')} className="w-full glass-panel py-6 rounded-full text-white/60 font-black text-xs tracking-[0.2em]">
          SIGN IN
        </button>
      </div>
    </div>
  );

  const renderAuth = (isReg: boolean) => (
    <div className="flex flex-col h-full p-8 animate-in overflow-y-auto no-scrollbar">
      <button onClick={() => setScreen('landing')} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center mb-12"><ArrowLeft size={20} /></button>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{isReg ? 'Join Us' : 'Welcome'}</h1>
        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.5em] mt-2">Identity Hub</p>
      </div>
      <GlassCard className="p-8 border-white/20">
        <form onSubmit={(e) => handleEmailAuth(e, isReg)} className="space-y-6">
          <div className="relative"><Mail className="absolute left-5 top-5 text-white/20" size={18} /><input type="email" placeholder="Email" className="w-full pl-14 glass-input p-5 rounded-3xl text-sm" required /></div>
          <div className="relative"><Lock className="absolute left-5 top-5 text-white/20" size={18} /><input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-14 glass-input p-5 rounded-3xl text-sm" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-white/20">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          <button className="w-full bg-white text-purple-900 font-black py-5 rounded-full shadow-2xl tracking-widest text-xs uppercase">{isReg ? 'Register' : 'Authenticate'}</button>
        </form>
        <div className="mt-10 text-center">
          <p className="text-[9px] text-white/20 font-black tracking-[0.3em] uppercase mb-6">Social Connect</p>
          <div className="flex justify-center gap-6">
            <button onClick={() => handleSocialAuth('google')} className="p-4 glass-panel rounded-2xl hover:bg-white/10"><Chrome className="text-white/40" size={20} /></button>
            <button onClick={() => handleSocialAuth('facebook')} className="p-4 glass-panel rounded-2xl hover:bg-white/10"><Facebook className="text-white/40" size={20} /></button>
            {/* Fix: changed handleSocialLogin to handleSocialAuth to resolve "Cannot find name 'handleSocialLogin'" error */}
            <button onClick={() => handleSocialAuth('apple')} className="p-4 glass-panel rounded-2xl hover:bg-white/10"><Apple className="text-white/40" size={20} /></button>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col h-full pt-8 pb-32 px-4 overflow-y-auto no-scrollbar animate-in">
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className="text-3xl font-black italic text-white tracking-tighter uppercase">OJA-ODAN</h1>
        <div className="flex gap-4">
          <button className="p-3 glass-panel rounded-full text-white/50 relative"><Bell size={20} /><div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full"></div></button>
        </div>
      </div>
      
      {/* Stories/Circles */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8 pb-2 px-2">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5"><Plus size={20} className="text-white/30" /></div>
          <span className="text-[9px] font-black text-white/40 uppercase">Add</span>
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full p-1 border-2 border-pink-500 shadow-lg">
              <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-full h-full rounded-full object-cover border-2 border-[#0f172a]" />
            </div>
            <span className="text-[9px] font-black text-white/60 uppercase">Circle {i}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <GlassCard className="p-0 overflow-hidden border-white/5 shadow-2xl">
          <div className="p-4 flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?img=32" className="w-11 h-11 rounded-full border border-white/20" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white">Amara Okafor</h4>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">@amara_spirit • 1h ago</p>
            </div>
          </div>
          <div className="px-5 pb-4 text-left"><p className="text-sm leading-relaxed text-white/80">Connecting with our roots while building the future. Today feels like a new beginning! ✨🌿</p></div>
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" className="w-full h-72 object-cover" />
          <div className="p-4 flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs font-black text-pink-500"><Heart size={18} fill="currentColor" /> 245</button>
            <button className="flex items-center gap-2 text-xs font-black text-white/40"><MessageSquare size={18} /> 18</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col h-full p-8 pb-32 animate-in text-center">
      <div className="mt-12 mb-12">
        <div className="w-36 h-36 rounded-full border-4 border-indigo-500/30 p-1 mx-auto mb-8 shadow-2xl">
          <img src={user?.avatar} className="w-full h-full rounded-full object-cover border-4 border-[#0f172a]" />
        </div>
        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">{user?.name}</h2>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em]">{user?.email}</p>
      </div>
      <button onClick={() => signOut(auth)} className="mt-auto w-full py-5 rounded-full glass-panel border-red-500/20 text-red-400 font-black text-xs tracking-widest flex items-center justify-center gap-3 uppercase active:scale-95"><LogOut size={18} /> Sign Out</button>
    </div>
  );

  // --- LOADING / ERROR HANDLERS ---
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-sanctuary">
        <Loader2 size={40} className="animate-spin text-pink-500 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Opening Portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-sanctuary p-10 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6"><ShieldCheck className="text-red-500" /></div>
        <h2 className="text-2xl font-black italic text-white uppercase mb-2">Setup Error</h2>
        <p className="text-white/40 text-xs leading-relaxed mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 glass-panel rounded-full text-[10px] font-black uppercase tracking-widest text-white">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-sanctuary">
      <div className="relative z-10 w-full h-full flex flex-col">
        {screen === 'landing' ? renderLanding() : 
         screen === 'login' ? renderAuth(false) : 
         screen === 'register' ? renderAuth(true) : 
         screen === 'home' ? renderHome() : 
         screen === 'profile' ? renderProfile() : renderLanding()}
      </div>
      {!['landing', 'login', 'register'].includes(screen) && <BottomNav />}
    </div>
  );
};

// Start
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
