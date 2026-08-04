import React from 'react';

interface BajajLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BajajLogo: React.FC<BajajLogoProps> = ({ className = '', size = 'md' }) => {
  const boxSizes = {
    sm: 'w-8 h-8 p-1',
    md: 'w-11 h-11 p-1.5 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 p-2 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 p-2.5',
  };

  const textSizes = {
    sm: 'text-base font-black',
    md: 'text-xl sm:text-2xl font-black',
    lg: 'text-2xl sm:text-3xl font-black',
    xl: 'text-4xl font-black',
  };

  const subtextSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center space-x-2.5 sm:space-x-3 select-none ${className}`}>
      {/* Official Bajaj Blue Square Container with White Flying Wing Emblem + BAJAJ Text */}
      <div
        className={`${boxSizes[size]} bg-[#005cb9] rounded-md sm:rounded-lg flex flex-col items-center justify-between text-white shadow-md font-black tracking-tighter transition-all hover:scale-105 shrink-0 border border-blue-400/30`}
      >
        {/* Bajaj Flying Wing Emblem SVG */}
        <div className="w-full flex-1 flex items-center justify-center pt-0.5">
          <svg
            className="w-[85%] h-[85%] fill-white"
            viewBox="0 0 100 65"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Upper Wing Polygon */}
            <polygon points="26,6 78,28 54,28 10,8" />
            {/* Middle Main Wing Polygon */}
            <polygon points="22,22 88,48 62,48 8,24" />
            {/* Lower Shadow Wing Polygon */}
            <polygon points="36,40 76,56 56,56 22,42" />
          </svg>
        </div>

        {/* BAJAJ Text at Bottom of Square */}
        <span className="leading-none pb-0.5 tracking-widest font-black uppercase text-[8px] sm:text-[10px] scale-95 font-sans">
          BAJAJ
        </span>
      </div>

      {/* CREDIT Text in Matching Bajaj Blue */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-black ${textSizes[size]} text-[#005cb9] dark:text-blue-400 tracking-tight leading-none uppercase font-sans`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          CREDIT
        </span>
        <span className={`font-bold text-slate-500 dark:text-slate-400 tracking-wider leading-none mt-1 uppercase ${subtextSizes[size]}`}>
          Bajaj Auto Credit Ltd.
        </span>
      </div>
    </div>
  );
};
