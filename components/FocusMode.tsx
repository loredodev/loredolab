
import React, { useState, useEffect } from 'react';
import { Minimize2, Play, Pause, Square, Wind, Clock } from 'lucide-react';
import { Language } from '../types';

interface FocusModeProps {
  onExit: () => void;
  lang: Language;
  taskTitle: string;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onExit, lang, taskTitle }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [isActive, setIsActive] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false); // Visual cue

  const isPt = lang === 'pt';

  // Timer Logic
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound here ideally
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const stopTimer = () => {
      setIsActive(false);
      setTimeLeft(25 * 60);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700">
        
        {/* Background Ambient Animation */}
        <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] transition-all duration-[6000ms] ${isActive ? 'scale-125 opacity-30' : 'scale-100 opacity-10'}`}></div>
            {isBreathing && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[100px] animate-breathing"></div>
            )}
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
            <div className="flex items-center gap-3 opacity-70">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-bold tracking-[0.3em] uppercase">Deep Work</span>
            </div>
            <button 
                onClick={onExit}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
                <Minimize2 className="w-4 h-4 text-white/70 group-hover:text-white" />
                <span className="text-xs font-bold text-white/70 group-hover:text-white">{isPt ? 'Minimizar' : 'Minimize'}</span>
            </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
            
            <h2 className="text-2xl md:text-4xl font-medium mb-12 opacity-90 max-w-2xl leading-relaxed">
                {taskTitle || (isPt ? "Foco no Agora" : "Focus on Now")}
            </h2>

            <div className="font-mono text-[120px] md:text-[180px] leading-none font-bold tracking-tighter tabular-nums mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-2xl">
                {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-8">
                <button 
                    onClick={toggleTimer}
                    className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                    {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                
                {isActive && (
                    <button 
                        onClick={stopTimer}
                        className="w-14 h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>
                )}
            </div>
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-12 flex gap-4 z-20">
            <button 
                onClick={() => setIsBreathing(!isBreathing)}
                className={`p-3 rounded-xl border transition-all ${isBreathing ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                title={isPt ? "Guia de Respiração" : "Breath Guide"}
            >
                <Wind className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setTimeLeft(25*60)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all"
                title="25m"
            >
                <span className="text-xs font-bold">25</span>
            </button>
            <button 
                onClick={() => setTimeLeft(90*60)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all"
                title="90m"
            >
                <span className="text-xs font-bold">90</span>
            </button>
        </div>

    </div>
  );
};
