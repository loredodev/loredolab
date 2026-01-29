
import React, { useState } from 'react';
import { Language } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Brain, Activity, Lightbulb } from 'lucide-react';
import { CONTENT } from '../../constants';

interface AdvancedAnalyticsProps {
  lang: Language;
}

const GET_DATA = (lang: Language) => {
    const days = lang === 'pt' 
        ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
    return days.map(day => ({
        day, 
        focus: 0, 
        mood: 0, 
        energy: 0 
    }));
};

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ lang }) => {
  const t = CONTENT[lang].analytics;
  const isPt = lang === 'pt';
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const data = GET_DATA(lang);

  const moods = [
      { id: 'tired', label: t.checkin.options.tired },
      { id: 'neutral', label: t.checkin.options.neutral },
      { id: 'good', label: t.checkin.options.good },
      { id: 'fire', label: t.checkin.options.fire },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <header>
            <h1 className="text-3xl font-bold text-lab-900">{t.title}</h1>
            <p className="text-lab-500 mt-1">{t.subtitle}</p>
        </header>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">{t.checkin.title}</h2>
                    <p className="opacity-80 max-w-lg">
                        {t.checkin.desc}
                    </p>
                </div>
                <Brain className="w-10 h-10 opacity-50" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moods.map((m) => (
                    <button 
                        key={m.id} 
                        onClick={() => setTodayMood(m.id)}
                        className={`p-4 rounded-xl backdrop-blur-md border transition-all font-medium text-center ${
                            todayMood === m.id 
                            ? 'bg-white text-indigo-900 border-white' 
                            : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-lab-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-lab-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary-600" />
                    {t.charts.correlation}
                </h3>
                
                {/* Altura fixa de 350px para evitar erro width(-1) */}
                <div style={{ width: '100%', height: 350, minHeight: 350 }} className="relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={[0, 10]} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip />
                            <Area type="monotone" dataKey="focus" stroke="#3b82f6" fill="url(#colorFocus)" strokeWidth={3} />
                            <Area type="monotone" dataKey="mood" stroke="#ec4899" fill="transparent" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center border border-lab-200 shadow-sm">
                            <p className="text-lab-500 font-medium text-sm">
                                {t.charts.empty}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="font-bold text-amber-900 flex items-center mb-3">
                        <Lightbulb className="w-5 h-5 mr-2" />
                        {t.insight.title}
                    </h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                        {t.insight.waiting}
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
