
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", showText = true, theme = 'dark' }) => {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Container */}
      <div className="relative w-10 h-10 flex-shrink-0 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center overflow-hidden">
            {/* Abstract "L" / Growth Chart shape */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transform group-hover:scale-110 transition-transform duration-300">
                <path d="M6 19C6 19 6 8 6 6C6 4.5 8 4 9 5L13 9C14 10 16 10 17 9L21 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="21" cy="5" r="2" fill="white" />
            </svg>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-heading font-extrabold tracking-tight text-xl leading-none ${textColor}`}>
            Loredo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">LAB</span>
          </span>
          <span className={`text-[9px] font-bold tracking-[0.25em] uppercase opacity-70 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Science OS
          </span>
        </div>
      )}
    </div>
  );
};
