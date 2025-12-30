import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#1a1b4b] via-[#2e1065] to-[#4c1d95]">
      {/* Abstract Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-bounce" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[20%] right-[20%] w-60 h-60 bg-indigo-400 rounded-full mix-blend-screen filter blur-2xl opacity-30 animate-pulse"></div>
      
      {/* Noise texture overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
    </div>
  );
};

export default Background;