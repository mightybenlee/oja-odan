import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-2xl p-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/20 active:scale-95' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;