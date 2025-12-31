import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, MessageCircle, User as UserIcon, Send, 
  Mail, Lock, Camera, Chrome, Facebook, Apple, 
  ShieldCheck, LogOut, Eye, EyeOff, Sparkles, Globe,
  Heart, Share2, MessageSquare, Plus, ChevronRight,
  Zap, Loader2, ArrowRight, ArrowLeft, Bell, MoreHorizontal
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase/app";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// =========================================================
// 2. TYPES & STATE
// =========================================================
type Screen = 'landing' | 'login' | 'register' | 'home' | 'messenger' | 'oracle' | 'profile';

interface Post {
  id: string;
  author: string;
  username: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: number;
  time: string;
}

// =========================================================
// 3. MAIN APPLICATION
// =========================================================
const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      author: 'Amara Okafor',
      username: 'amara_spirit',
      avatar: 'https://i.pravatar.cc/150?img=32',
      content: 'Connecting with our roots while building the future. Today feels like a new beginning in the sanctuary! ✨🌿 #OjaOdan',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      likes: 245,
      liked: false,
      comments: 18,
      time: '1h ago'
    }
  ]);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'Explorer',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=12'
        });
        setScreen('home');
      } else {
        setUser(null);
        if (screen !== 'register' && screen !== 'login') setScreen('landing');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---
  const handleSocialLogin = async (platform: 'google' | 'facebook' | 'apple') => {
    const provider = platform === 'google' ? googleProvider : platform === 'facebook' ? facebookProvider : appleProvider;
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      alert(`Login Error: ${err.message}`);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent, isReg: boolean) => {
    e.preventDefault();
    const email = (e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement).value;
    const password = (e.currentTarget.querySelector('input[type="password"]') as HTMLInputElement).value;
    try {
      if (isReg) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const askOracle = async (prompt: string): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are the Oracle of Oja-odan, a wise and mystical social community guide. You provide cultural wisdom, help users navigate the sanctuary, and encourage community unity. Keep responses brief, poetic, and helpful.",
        },
      });
      return response.text || "The ancestors are quiet right now.";
    } catch (err) {
      return "The sanctuary connection is flickering. Try again later.";
    }
  };

  // --- UI COMPONENTS ---
  const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <div onClick={onClick} className={`glass-panel rounded-[2.5rem] p-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/10 active:scale-[0.98]' : ''} ${className}`}>
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
          onClick={() => setScreen(item.id as Screen)}
          className={`p-2 rounded-full transition-all duration-300 ${screen === item.id ? 'bg-white text-indigo-950 shadow-xl scale-110' : 'text-white/40 hover:text-white'}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );

  // --- SCREEN RENDERS ---

  const renderLanding = () => (
    <div className="flex flex-col h-full animate-in">
      <div className="relative h-[65%] shrink-0 overflow-hidden rounded-b-[4.5rem]">
        <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-black/20 to-transparent"></div>
        <div className="absolute bottom-16 left-10 right-10">
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <Globe size={14} className="text-pink-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Community Reborn</span>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter text-white mb-2 leading-none">OJA<br/>ODAN</h1>
          <p className="text-white/60 text-sm font-medium">Digital sanctuary for a modern tribe.</p>
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
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{isReg ? 'Genesis' : 'Welcome'}</h1>
        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.5em] mt-2">Identity Hub</p>
      </div>
      <GlassCard className="p-8 border-white/20">
        <form onSubmit={(e) => handleEmailAuth(e, isReg)} className="space-y-6">
          {isReg && <input placeholder="Your Name" className="w-full glass-input p-5 rounded-3xl text-sm" required />}
          <div className="relative">
            <Mail className="absolute left-5 top-5 text-white/20" size={18} />
            <input type="email" placeholder="Email Address" className="w-full pl-14 glass-input p-5 rounded-3xl text-sm" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-5 text-white/20" size={18} />
            <input type={showPassword ? "text" : "password"} placeholder="Secure Password" className="w-full pl-14 glass-input p-5 rounded-3xl text-sm" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-white/20">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="w-full bg-white text-purple-900 font-black py-5 rounded-full shadow-2xl tracking-widest text-xs">
            {isReg ? 'REGISTER ACCOUNT' : 'LOG IN'}
          </button>
        </form>
        <div className="mt-12 text-center">
          <p className="text-[9px] text-white/20 font-black tracking-[0.3em] uppercase mb-6">Social Portals</p>
          <div className="flex justify-center gap-8">
            <button onClick={() => handleSocialLogin('google')} className="p-4 glass-panel rounded-2xl"><Chrome className="text-white/40 hover:text-white" size={20} /></button>
            <button onClick={() => handleSocialLogin('facebook')} className="p-4 glass-panel rounded-2xl"><Facebook className="text-white/40 hover:text-white" size={20} /></button>
            <button onClick={() => handleSocialLogin('apple')} className="p-4 glass-panel rounded-2xl"><Apple className="text-white/40 hover:text-white" size={20} /></button>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col h-full pt-6 pb-28 px-4 overflow-y-auto no-scrollbar animate-in">
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-black italic tracking-tighter text-white">OJA-ODAN</h1>
        <button className="p-3 glass-panel rounded-full text-white/50 relative"><Bell size={20} /><div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full"></div></button>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8 pb-2">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5"><Plus size={20} className="text-white/30" /></div>
          <span className="text-[9px] font-black text-white/40 uppercase">Add</span>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full p-1 border-2 border-pink-500 shadow-lg cursor-pointer">
              <img src={`https://i.pravatar.cc/150?img=${i + 15}`} className="w-full h-full rounded-full object-cover border-2 border-[#0f172a]" />
            </div>
            <span className="text-[9px] font-black text-white/60 uppercase">Circle {i}</span>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        {posts.map((post, idx) => (
          <GlassCard key={post.id} className="p-0 overflow-hidden border-white/5 shadow-2xl">
            <div className="p-4 flex items-center gap-3">
              <img src={post.avatar} className="w-11 h-11 rounded-full border border-white/20" />
              <div className="flex-1 text-left">
                <h4 className="font-bold text-sm text-white">{post.author}</h4>
                <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">@{post.username} • {post.time}</p>
              </div>
              <button className="opacity-30 p-2 text-white"><MoreHorizontal size={20} /></button>
            </div>
            <div className="px-5 pb-4 text-left"><p className="text-sm leading-relaxed text-white/80">{post.content}</p></div>
            {post.image && <img src={post.image} className="w-full h-72 object-cover border-y border-white/5" />}
            <div className="p-4 flex items-center gap-6">
              <button onClick={() => {
                const updated = [...posts];
                updated[idx].liked = !updated[idx].liked;
                updated[idx].likes += updated[idx].liked ? 1 : -1;
                setPosts(updated);
              }} className={`flex items-center gap-2 text-xs font-black transition-colors ${post.liked ? 'text-pink-500' : 'text-white/40'}`}>
                <Heart size={18} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-xs font-black text-white/40"><MessageSquare size={18} /> {post.comments}</button>
              <button className="ml-auto text-white/20 p-2"><Share2 size={18} /></button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderOracle = () => {
    const [msgs, setMsgs] = useState<{role:'user'|'model', text:string}[]>([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
    const handleSend = async () => {
      if(!input.trim()) return;
      const t = input; setMsgs(p => [...p, {role:'user', text:t}]); setInput(''); setTyping(true);
      const res = await askOracle(t); setMsgs(p => [...p, {role:'model', text:res}]); setTyping(false);
    };
    return (
      <div className="flex flex-col h-full animate-in overflow-hidden">
        <div className="pt-16 pb-8 text-center glass-panel border-b border-white/5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 mx-auto mb-4">
            <div className="w-full h-full rounded-full bg-indigo-950 flex items-center justify-center"><Sparkles className="text-pink-400" size={32} /></div>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">The Oracle</h2>
          <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em]">Ancient Knowledge, Digital Soul</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-indigo-950 font-bold rounded-tr-none' : 'glass-panel border-pink-500/20 text-pink-100 rounded-tl-none'}`}>{m.text}</div>
            </div>
          ))}
          {typing && <div className="text-[10px] text-pink-400 animate-pulse tracking-widest font-black text-center uppercase">Channelling...</div>}
          <div ref={scrollRef} />
        </div>
        <div className="p-6 pb-28">
          <div className="glass-panel rounded-full p-2 flex items-center gap-3 border-white/10 shadow-2xl">
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()} placeholder="Ask for wisdom..." className="flex-1 bg-transparent px-6 outline-none text-sm text-white" />
            <button onClick={handleSend} className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white"><Send size={18} /></button>
          </div>
        </div>
      </div>
    );
  };

  const renderMessenger = () => (
    <div className="flex flex-col h-full p-6 animate-in pb-28 overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-black italic text-white uppercase mb-10 text-left">Ecosystem</h2>
      <div className="space-y-4">
        {[
          { id: '1', name: 'June Ojo', avatar: 'https://i.pravatar.cc/150?img=21', last: 'Join the circle later?', time: '10:45', online: true },
          { id: '2', name: 'Team Alpha', avatar: 'https://images.unsplash.com/photo-1523464862212-d6631d073194?w=100&h=100&fit=crop', last: 'Ecosystem update ready.', time: 'Yesterday', online: false }
        ].map(chat => (
          <GlassCard key={chat.id} className="flex items-center gap-4 border-white/5">
            <div className="relative">
              <img src={chat.avatar} className="w-14 h-14 rounded-full border-2 border-white/10 object-cover" />
              {chat.online && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] bg-green-500"></div>}
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-bold text-white text-base">{chat.name}</h4>
                <span className="text-[10px] text-white/30 uppercase font-black">{chat.time}</span>
              </div>
              <p className="text-xs text-white/40 truncate">{chat.last}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col h-full p-8 pb-32 overflow-y-auto no-scrollbar animate-in">
      <div className="text-center mt-12 mb-12">
        <div className="w-36 h-36 rounded-full border-4 border-indigo-500/30 p-1 bg-gradient-to-tr from-pink-500/30 to-indigo-600/30 shadow-2xl mx-auto mb-8">
          <img src={user?.avatar} className="w-full h-full rounded-full object-cover border-4 border-[#0f172a]" />
        </div>
        <h2 className="text-4xl font-black italic text-white mb-1 uppercase tracking-tighter">{user?.name}</h2>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em]">{user?.email}</p>
      </div>
      <div className="space-y-4">
        {[
          { icon: <Mail size={18} />, label: 'Identity Port', val: user?.email },
          { icon: <ShieldCheck size={18} />, label: 'Status', val: 'Verified Member' }
        ].map((item, i) => (
          <GlassCard key={i} className="flex items-center gap-5 border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">{item.icon}</div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">{item.label}</p>
              <p className="font-bold text-sm text-white">{item.val}</p>
            </div>
          </GlassCard>
        ))}
      </div>
      <button onClick={() => signOut(auth)} className="mt-16 w-full py-5 rounded-full glass-panel border-red-500/20 text-red-400 font-black text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95">
        <LogOut size={18} /> SIGN OUT FROM SANCTUARY
      </button>
    </div>
  );

  if (isLoading && !user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-sanctuary">
        <Loader2 size={40} className="animate-spin text-pink-500 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Opening Portal...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-sanctuary">
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10 w-full h-full flex flex-col">
        {screen === 'landing' ? renderLanding() : 
         screen === 'login' ? renderAuth(false) : 
         screen === 'register' ? renderAuth(true) : 
         screen === 'home' ? renderHome() : 
         screen === 'messenger' ? renderMessenger() : 
         screen === 'oracle' ? renderOracle() : 
         screen === 'profile' ? renderProfile() : renderLanding()}
      </div>
      {!['landing', 'login', 'register'].includes(screen) && <BottomNav />}
    </div>
  );
};

// Start the Application
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
