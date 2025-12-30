
import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, Camera, Chrome, Facebook, Apple, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Screen } from '../types';
import { 
  auth, 
  db, 
  googleProvider, 
  facebookProvider,
  appleProvider,
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  doc,
  setDoc 
} from '../services/firebase';

interface AuthProps {
  setScreen: (screen: Screen) => void;
  onAuth: (userData: any) => void;
}

const LoginRegister: React.FC<AuthProps> = ({ setScreen, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSocialLogin = async (platform: 'Google' | 'Facebook' | 'Apple') => {
    setIsLoading(true);
    setError('');
    
    let provider;
    if (platform === 'Google') provider = googleProvider;
    else if (platform === 'Facebook') provider = facebookProvider;
    else provider = appleProvider;

    try {
      const result = await signInWithPopup(auth, provider);
      onAuth(result.user);
      setScreen('menu');
    } catch (err: any) {
      console.error(`${platform} Login Error:`, err);
      setError(`${platform} login failed. Ensure the provider is enabled in your Firebase Console.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, data.email as string, data.password as string);
        onAuth(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email as string, data.password as string);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          school: data.school,
          occupation: data.occupation,
          avatar: profileImg || '',
          createdAt: new Date()
        });
        onAuth(userCredential.user);
      }
      setScreen('menu');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar p-6 animate-in">
      <div className="flex items-center justify-between mb-8 mt-4">
        <button onClick={() => setScreen('landing')} className="p-2 glass-panel rounded-full text-white/60">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter">OJA-ODAN</h1>
        <div className="w-10"></div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-black mb-2">{isLogin ? 'Sign In' : 'Join Us'}</h2>
        <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.5em]">Experience the sanctuary</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">{error}</div>}

      <GlassCard className="w-full backdrop-blur-3xl p-8 mb-16 border-white/20">
        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="flex flex-col items-center mb-8">
              <div 
                className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {profileImg ? <img src={profileImg} className="w-full h-full object-cover" alt="Profile" /> : <Camera className="text-white/20" size={30} />}
                <input ref={fileInputRef} type="file" hidden onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setProfileImg(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} accept="image/*" />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" placeholder="First Name" className="glass-input p-4 rounded-2xl text-sm" required />
              <input name="lastName" placeholder="Last Name" className="glass-input p-4 rounded-2xl text-sm" required />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-white/40" size={18} />
            <input name="email" type="email" placeholder="Email" className="w-full pl-12 glass-input p-4 rounded-2xl text-sm" required />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-white/40" size={18} />
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-12 glass-input p-4 rounded-2xl text-sm" required />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-white/40"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {!isLogin && (
            <>
              <input name="phone" placeholder="Phone Number" className="glass-input p-4 rounded-2xl text-sm w-full" required />
              <input name="address" placeholder="Address" className="glass-input p-4 rounded-2xl text-sm w-full" required />
              <input name="school" placeholder="School" className="glass-input p-4 rounded-2xl text-sm w-full" required />
              <input name="occupation" placeholder="Occupation" className="glass-input p-4 rounded-2xl text-sm w-full" required />
            </>
          )}

          <button disabled={isLoading} className="w-full bg-white text-purple-900 font-black py-5 rounded-[2rem] shadow-xl text-xs tracking-widest active:scale-95 transition-all">
            {isLoading ? "PROCESSING..." : (isLogin ? 'SIGN IN' : 'REGISTER')}
          </button>
        </form>

        <div className="mt-12 text-center">
            <p className="text-[9px] uppercase font-black opacity-20 mb-6 tracking-widest">Social Connection</p>
            <div className="flex justify-center gap-6">
                <button onClick={() => handleSocialLogin('Google')} className="p-4 glass-panel rounded-2xl hover:bg-white/10 transition-colors"><Chrome size={22} /></button>
                <button onClick={() => handleSocialLogin('Facebook')} className="p-4 glass-panel rounded-2xl hover:bg-white/10 transition-colors"><Facebook size={22} /></button>
                <button onClick={() => handleSocialLogin('Apple')} className="p-4 glass-panel rounded-2xl hover:bg-white/10 transition-colors"><Apple size={22} /></button>
            </div>
            <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-xs text-pink-300 font-black uppercase underline underline-offset-8">
                {isLogin ? "Join Oja-odan" : "Already member?"}
            </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginRegister;
