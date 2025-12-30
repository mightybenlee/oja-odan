import React from 'react';
import { Camera, LogOut, User, MapPin, School, Briefcase, Phone, Mail, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Screen } from '../types';

interface UserProfileProps {
  setScreen: (screen: Screen) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ setScreen }) => {
  // Mock user data matching the new registration fields
  const userData = {
    firstName: 'Babatunde',
    lastName: 'Ojo',
    email: 'babatunde@ojaodan.com',
    phone: '080-1234-5678',
    address: '123 Community St, Lagos',
    school: 'Oja-odan Tech Institute',
    occupation: 'Software Engineer',
    avatar: 'https://picsum.photos/200/200?random=50',
    gender: 'Male',
    age: '28'
  };

  return (
    <div className="flex flex-col h-full pt-6 pb-24 px-6 overflow-y-auto no-scrollbar">
       <div className="flex justify-between items-center mb-8">
        <h2 className="font-black text-2xl tracking-tighter italic">MY PROFILE</h2>
        <button className="text-[10px] font-black uppercase tracking-widest text-pink-400">Settings</button>
      </div>

      {/* Profile Card */}
      <GlassCard className="flex flex-col items-center p-8 mb-8 relative rounded-[3rem] shadow-2xl border-white/20">
        <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-1 shadow-2xl">
                <img 
                    src={userData.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-[#1a1b4b]"
                />
            </div>
            <button className="absolute bottom-1 right-1 p-3 bg-white text-purple-900 rounded-full shadow-xl hover:scale-110 transition-transform">
                <Camera size={18} />
            </button>
        </div>

        <h1 className="text-3xl font-black italic mb-1">{userData.firstName} {userData.lastName}</h1>
        <div className="flex items-center gap-2 mb-6 opacity-60">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs uppercase font-black tracking-widest">Active Member</span>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 text-center border-t border-white/10 pt-6">
            <div>
                <p className="text-[9px] uppercase font-black opacity-30 mb-1">Occupation</p>
                <p className="text-sm font-bold">{userData.occupation}</p>
            </div>
            <div>
                <p className="text-[9px] uppercase font-black opacity-30 mb-1">Age</p>
                <p className="text-sm font-bold">{userData.age} Yrs</p>
            </div>
        </div>
      </GlassCard>

      {/* Info List */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-2">Identity Details</h3>
        
        <GlassCard className="flex items-center gap-4 p-5 rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                <Mail size={20} />
            </div>
            <div className="flex-1">
                <p className="text-[9px] uppercase font-black opacity-30">Email Address</p>
                <p className="text-sm font-bold">{userData.email}</p>
            </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-5 rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                <Phone size={20} />
            </div>
            <div className="flex-1">
                <p className="text-[9px] uppercase font-black opacity-30">Contact Phone</p>
                <p className="text-sm font-bold">{userData.phone}</p>
            </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-5 rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                <School size={20} />
            </div>
            <div className="flex-1">
                <p className="text-[9px] uppercase font-black opacity-30">Education</p>
                <p className="text-sm font-bold">{userData.school}</p>
            </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-5 rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                <MapPin size={20} />
            </div>
            <div className="flex-1">
                <p className="text-[9px] uppercase font-black opacity-30">Location</p>
                <p className="text-sm font-bold">{userData.address}</p>
            </div>
        </GlassCard>
      </div>

      <button 
        onClick={() => setScreen('landing')}
        className="mt-12 w-full py-5 rounded-[2.5rem] bg-white/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest mb-10"
      >
        <LogOut size={18} />
        Sign Out from Oja-odan
      </button>
    </div>
  );
};

export default UserProfile;