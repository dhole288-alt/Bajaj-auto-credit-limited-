import React from 'react';

interface BajajLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BajajLogo: React.FC<BajajLogoProps> = ({ className = '', size = 'md' }) => {
  const boxSizes = {
    sm: 'w-7 h-7 text-[7px]',
    md: 'w-9 h-9 text-[9px]',
    lg: 'w-11 h-11 text-[10px]',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-lg sm:text-xl',
  };

  return (
    <div className={`flex items-center space-x-2 select-none ${className}`}>
      {/* Blue Box with White Bajaj Wing Emblem & BAJAJ Text */}
      <div
        className={`${boxSizes[size]} bg-[#024b9c] rounded-lg flex flex-col items-center justify-center text-white shadow-xs font-black tracking-tighter transition-transform hover:scale-105 shrink-0`}
      >
        {/* Bajaj Flying Wing Emblem SVG */}
        <svg
          className="w-[60%] h-[45%] fill-current text-white"
          viewBox="0 0 100 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Authentic Bajaj Wing Geometry */}
          <path d="M12 48 L42 12 C46 7, 54 7, 58 12 L88 48 C92 53, 86 58, 80 54 L50 32 L20 54 C14 58, 8 53, 12 48 Z" />
          <path d="M32 46 L50 32 L68 46 L50 20 Z" opacity="0.4" />
        </svg>
        <span className="leading-none mt-0.5 tracking-widest font-extrabold uppercase scale-90">
          BAJAJ
        </span>
      </div>

      {/* CREDIT Text in Bajaj Blue */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-black ${textSizes[size]} text-[#024b9c] dark:text-blue-400 tracking-tight leading-none uppercase`}
        >
          CREDIT
        </span>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider leading-none mt-0.5 uppercase hidden sm:inline-block">
          Bajaj Auto Credit Ltd.
        </span>
      </div>
    </div>
  );
};
