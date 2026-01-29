
import React, { useState, useEffect } from 'react';
import { Language, User } from '../../types';
import { Plus, Trophy, Settings, Save, Minus, Droplets, Brain, Activity, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { CONTENT } from '../../constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';
import { getTodayHydration, logHydration } from '../../services/tracking';

interface HydrationTrackerProps {
  lang: Language;
  user: User;
}

// Helper to generate the last 7 days labels (real dates, empty values)
const getLast7Days = (lang: Language) => {
  const history = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' });
    
    history.push({
      day: dayName,
      amount: 0, // Start clean for real usage
      isToday: i === 0,
      fullDate: d.toISOString()
    });
  }
  return history;
};

const SCIENCE_CONTENT = {
  en: {
    importanceTitle: "Why Hydration Matters",
    importanceDesc: "Water is not just fuel; it is the medium in which all cellular transport and metabolic reactions occur. A deficit of just 1-2% in body water mass can significantly impair cognitive function.",
    benefitsTitle: "Physiological Benefits",
    benefits: [
      { title: "Cognitive Focus", desc: "Maintains alertness and reduces perceived effort." },
      { title: "Thermoregulation", desc: "Essential for managing body heat during work/exercise." },
      { title: "Mood Stability", desc: "Dehydration is strongly linked to irritability and anxiety." }
    ],
    studiesTitle: "Key Evidence",
    studies: [
      { citation: "Lieberman, H. R. (2007).", title: "Hydration and cognition: a critical review and recommendations for future research.", result: "Mild dehydration disrupts mood and cognitive performance." },
      { citation: "Adan, A. (2012).", title: "Cognitive performance and dehydration.", result: "Visual attention and short-term memory are the first to degrade." }
    ]
  },
  pt: {
    importanceTitle: "A Ciência da Hidratação",
    importanceDesc: "A água não é apenas combustível; é o meio onde ocorrem todas as reações metabólicas e transporte celular. Um déficit de apenas 1-2% na massa de água corporal pode prejudicar significativamente a função cognitiva.",
    benefitsTitle: "Benefícios Fisiológicos",
    benefits: [
      { title: "Foco Cognitivo", desc: "Mantém o estado de alerta e reduz a percepção de esforço." },
      { title: "Termorregulação", desc: "Essencial para controlar o calor corporal durante trabalho/exercício." },
      { title: "Estabilidade de Humor", desc: "A desidratação está fortemente ligada à irritabilidade e ansiedade." }
    ],
    studiesTitle: "Evidência Chave",
    studies: [
      { citation: "Lieberman, H. R. (2007).", title: "Hydration and cognition.", result: "Desidratação leve interrompe o humor e a performance cognitiva." },
      { citation: "Adan, A. (2012).", title: "Cognitive performance and dehydration.", result: "Atenção visual e memória de curto prazo são as primeiras funções a degradar." }
    ]
  }
};

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({ lang, user }) => {
  const t = CONTENT[lang].hydration;
  const edu = SCIENCE_CONTENT[lang];
  
  // State
  const [goalMl, setGoalMl] = useState(3000);
  const [currentMl, setCurrentMl] = useState(0); 
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(3000);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize History on mount & fetch today's data
  useEffect(() => {
    const initialData = getLast7Days(lang);
    setChartData(initialData);

    const fetchData = async () => {
        setIsLoading(true);
        const todayAmount = await getTodayHydration(user.id);
        setCurrentMl(todayAmount);
        setIsLoading(false);
    };
    fetchData();
  }, [lang, user.id]);

  // Update the last item in chartData when currentMl changes
  useEffect(() => {
    setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        const newData = [...prevData];
        newData[newData.length - 1] = {
            ...newData[newData.length - 1],
            amount: currentMl
        };
        return newData;
    });
  }, [currentMl]);

  const streak = currentMl >= goalMl ? 1 : 0; 
  const percentage = Math.min(100, Math.round((currentMl / goalMl) * 100));

  const addWater = async (amount: number) => {
    const previous = currentMl;
    const newTotal = Math.min(currentMl + amount, 5000); 
    
    // Optimistic Update
    setCurrentMl(newTotal);
    setSaveError(null);
    
    // DB Update
    const { error } = await logHydration(user.id, amount);
    if (error) {
        // Rollback on error
        setCurrentMl(previous);
        console.error("Hydration DB Error details:", error);
        setSaveError(error.message || 'Error saving data.');
        setTimeout(() => setSaveError(null), 5000);
    }
  };

  const saveGoal = () => {
    setGoalMl(tempGoal);
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-lab-900">{t.title}</h1>
          <p className="text-lab-500 mt-1">{t.subtitle}</p>
        </div>
      </header>

      {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>
                  {lang === 'pt' ? 'Erro ao salvar: ' : 'Error saving: '}
                  <span className="font-mono text-xs ml-1">{saveError}</span>
              </span>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Status Card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-lab-200 p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
             {/* Background Wave Animation simulation */}
             <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-50 transition-all duration-1000 ease-out" 
                style={{ height: `${percentage}%`, opacity: 0.3 }} 
             />
             
             <div className="relative z-10 text-center w-full max-w-md">
                 
                 {/* Circle Progress Indicator */}
                 <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-lab-100 stroke-current" 
                        strokeWidth="8" 
                        cx="50" cy="50" r="40" 
                        fill="transparent" 
                      />
                      <circle 
                        className={`progress-ring__circle stroke-current transition-all duration-1000 ease-out ${percentage >= 100 ? 'text-green-500' : 'text-blue-500'}`}
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        cx="50" cy="50" r="40" 
                        fill="transparent" 
                        strokeDasharray="251.2" 
                        strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-lab-400" />
                        ) : (
                            <span className={`text-4xl font-black ${percentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>{percentage}%</span>
                        )}
                    </div>
                 </div>

                 <div className="text-6xl font-black text-lab-900 mb-2 tracking-tight">
                    {currentMl} <span className="text-2xl text-lab-400 font-medium">ml</span>
                 </div>
                 
                 {/* Editable Goal */}
                 <div className="flex items-center justify-center gap-2 mb-8">
                    {isEditingGoal ? (
                        <div className="flex items-center gap-2 bg-lab-50 p-1 rounded-lg border border-lab-200 animate-in fade-in">
                            <button onClick={() => setTempGoal(Math.max(1000, tempGoal - 250))} className="p-1 hover:bg-white rounded"><Minus className="w-4 h-4" /></button>
                            <span className="font-bold font-mono text-lg w-16 text-center">{tempGoal}</span>
                            <button onClick={() => setTempGoal(tempGoal + 250)} className="p-1 hover:bg-white rounded"><Plus className="w-4 h-4" /></button>
                            <button onClick={saveGoal} className="bg-green-500 text-white p-1 rounded ml-1 hover:bg-green-600"><Save className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="group flex items-center gap-2 text-lab-500 font-medium uppercase tracking-widest text-sm">
                            <span>{t.goal}: {goalMl} ml</span>
                            <button 
                                onClick={() => { setTempGoal(goalMl); setIsEditingGoal(true); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-lab-100 rounded text-lab-400"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                 </div>
                 
                 <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => addWater(250)}
                        className="flex items-center bg-white border border-blue-200 text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition transform hover:-translate-y-1 shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" /> 250ml
                    </button>
                    <button 
                        onClick={() => addWater(500)}
                        className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg shadow-blue-200"
                    >
                        <Plus className="w-5 h-5 mr-2" /> 500ml
                    </button>
                 </div>
             </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
            {/* Streak Card & Chart (Same as before) */}
            <div className={`bg-white rounded-2xl border p-6 shadow-sm relative overflow-hidden transition-colors ${percentage >= 100 ? 'border-green-200 bg-green-50' : 'border-lab-200'}`}>
                <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className={`p-2 rounded-lg ${percentage >= 100 ? 'bg-green-200 text-green-700' : 'bg-amber-100 text-amber-600'}`}>
                        <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold ${percentage >= 100 ? 'text-green-800' : 'text-lab-900'}`}>{t.streak}</h3>
                </div>
                
                <div className="flex items-baseline gap-2 relative z-10">
                    <div className={`text-5xl font-black ${percentage >= 100 ? 'text-green-800' : 'text-lab-900'}`}>{streak}</div>
                    <div className="text-lab-500 font-medium">{CONTENT[lang].common.days}</div>
                </div>
                
                <p className="text-xs text-lab-400 mt-2 relative z-10">
                    {percentage >= 100 
                        ? (lang === 'pt' ? 'Meta batida!' : 'Goal reached!') 
                        : (lang === 'pt' ? 'Continue bebendo!' : 'Keep drinking!')
                    }
                </p>

                <Trophy className={`absolute -bottom-4 -right-4 w-32 h-32 opacity-50 rotate-12 ${percentage >= 100 ? 'text-green-200' : 'text-amber-50'}`} />
            </div>

            {/* History Chart */}
            <div className="bg-white rounded-2xl border border-lab-200 p-6 shadow-sm h-64 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lab-900">{t.history}</h3>
                    <div className="text-xs text-lab-400 uppercase font-bold">7 {CONTENT[lang].common.days}</div>
                </div>
                
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                                interval={0}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <ReferenceLine y={goalMl} stroke="#f59e0b" strokeDasharray="3 3" />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.amount >= goalMl ? '#22c55e' : (entry.isToday ? '#3b82f6' : '#e2e8f0')} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>

      {/* Science & Education Section */}
      <div className="bg-white rounded-2xl border border-lab-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-lab-900">{edu.importanceTitle}</h2>
                  <p className="text-sm text-lab-500">Evidence Level: GOLD</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <p className="text-lab-700 leading-relaxed mb-6">
                      {edu.importanceDesc}
                  </p>
                  
                  <h3 className="font-bold text-lab-900 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" /> {edu.benefitsTitle}
                  </h3>
                  <ul className="space-y-3">
                      {edu.benefits.map((b, i) => (
                          <li key={i} className="flex gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                              <div>
                                  <span className="font-bold text-lab-800">{b.title}:</span> <span className="text-lab-600">{b.desc}</span>
                              </div>
                          </li>
                      ))}
                  </ul>
              </div>

              <div className="bg-lab-50 rounded-xl p-6 border border-lab-100">
                   <h3 className="font-bold text-lab-900 mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" /> {edu.studiesTitle}
                   </h3>
                   <div className="space-y-4">
                       {edu.studies.map((s, i) => (
                           <div key={i} className="text-sm">
                               <div className="font-medium text-lab-900 italic">"{s.title}"</div>
                               <div className="text-xs text-lab-500 mb-1">{s.citation}</div>
                               <div className="text-lab-700 pl-3 border-l-2 border-blue-200">
                                   {s.result}
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
};
