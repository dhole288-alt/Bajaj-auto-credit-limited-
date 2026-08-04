import React from 'react';
import { IndianRupee, Percent, ShieldCheck, Zap, Sparkles, TrendingUp, Award } from 'lucide-react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Top Ambient Glow Blob - Bajaj Royal Blue */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
      
      {/* Bottom Right Glow Blob - Gold Accent */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />

      {/* Center Subtle Cyan Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-400/5 dark:bg-sky-500/10 rounded-full blur-3xl" />

      {/* Floating Finance Icons & Particles */}
      <div className="absolute top-20 left-[10%] opacity-20 dark:opacity-30 text-[#024b9c] dark:text-blue-400 animate-float">
        <IndianRupee className="w-8 h-8" />
      </div>

      <div className="absolute top-40 right-[12%] opacity-15 dark:opacity-25 text-amber-500 animate-float" style={{ animationDelay: '1.5s' }}>
        <Percent className="w-9 h-9" />
      </div>

      <div className="absolute top-[55%] left-[5%] opacity-15 dark:opacity-25 text-blue-500 animate-float" style={{ animationDelay: '2.5s' }}>
        <ShieldCheck className="w-10 h-10" />
      </div>

      <div className="absolute top-[65%] right-[8%] opacity-20 dark:opacity-30 text-amber-400 animate-float" style={{ animationDelay: '3.5s' }}>
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="absolute bottom-28 left-[18%] opacity-15 dark:opacity-25 text-[#024b9c] dark:text-blue-400 animate-float" style={{ animationDelay: '4s' }}>
        <TrendingUp className="w-9 h-9" />
      </div>

      <div className="absolute bottom-40 right-[22%] opacity-15 dark:opacity-25 text-blue-600 animate-float" style={{ animationDelay: '2s' }}>
        <Award className="w-8 h-8" />
      </div>

      {/* Fine Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" 
        style={{
          backgroundImage: `radial-gradient(#024b9c 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />
    </div>
  );
};
