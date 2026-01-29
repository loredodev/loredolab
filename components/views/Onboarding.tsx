
import React, { useState } from 'react';
import { Language, UserRole, Chronotype } from '../../types';
import { Check, User, Building2, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { CONTENT } from '../../constants';

interface OnboardingProps {
  onComplete: (name: string, role: UserRole, chronotype: Chronotype) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang, setLang }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('SCIENTIST');
  const [chronotype, setChronotype] = useState<Chronotype | null>(null);

  const t = CONTENT[lang].auth.onboarding;
  const isPt = lang === 'pt';

  const handleNext = () => {
    if (step === 1 && name) setStep(2);
    else if (step === 2) setStep(3); 
    else if (step === 3 && chronotype) onComplete(name, role, chronotype);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4 relative overflow-hidden font-sans">
       {/* Ambient Background */}
       <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-accent-100/50 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
       </div>

       {/* Language Toggle */}
       <div className="absolute top-6 right-6 flex space-x-2 bg-white/80 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/60 z-10">
          <button 
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                lang === 'en' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('pt')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                lang === 'pt' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            PT
          </button>
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Progress Bar */}
        <div className="flex space-x-3 mb-8 px-4">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 1 ? 'bg-gradient-to-r from-primary-500 to-indigo-500' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 2 ? 'bg-gradient-to-r from-indigo-500 to-accent-500' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 3 ? 'bg-gradient-to-r from-accent-500 to-fuchsia-500' : 'bg-slate-200'}`} />
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white shadow-indigo-100/50">
          
          {/* STEP 1: NAME */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div>
                  <h2 className="text-4xl font-heading font-black text-slate-900 mb-3 tracking-tight">{t.title1}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{isPt ? 'Como devemos te chamar no laboratório?' : 'How should we address you in the lab?'}</p>
              </div>
              <input 
                autoFocus
                type="text" 
                className="w-full text-xl px-6 py-5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                placeholder={t.placeholder1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name && handleNext()}
              />
              <button 
                onClick={handleNext}
                disabled={!name}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                {t.next}
              </button>
            </div>
          )}

          {/* STEP 2: ROLE */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div>
                  <h2 className="text-4xl font-heading font-black text-slate-900 mb-3 tracking-tight">{t.title2}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{isPt ? 'Isso personaliza sua dashboard.' : 'This customizes your dashboard.'}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setRole('SCIENTIST')}
                  className={`p-6 rounded-3xl border-2 text-left flex items-center space-x-5 transition-all hover:scale-[1.02] ${
                    role === 'SCIENTIST' 
                    ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-100' 
                    : 'border-slate-100 hover:border-primary-200 bg-white'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${role === 'SCIENTIST' ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-xl mb-1 font-heading">{t.scientistTitle}</div>
                    <div className="text-sm text-slate-500 font-medium">{t.scientistDesc}</div>
                  </div>
                  {role === 'SCIENTIST' && <div className="bg-primary-500 text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>}
                </button>

                <button 
                  onClick={() => setRole('MANAGER')}
                  className={`p-6 rounded-3xl border-2 text-left flex items-center space-x-5 transition-all hover:scale-[1.02] ${
                    role === 'MANAGER' 
                    ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-100' 
                    : 'border-slate-100 hover:border-primary-200 bg-white'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${role === 'MANAGER' ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-xl mb-1 font-heading">{t.managerTitle}</div>
                    <div className="text-sm text-slate-500 font-medium">{t.managerDesc}</div>
                  </div>
                  {role === 'MANAGER' && <div className="bg-primary-500 text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>}
                </button>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-2xl shadow-slate-200"
              >
                {t.next}
              </button>
            </div>
          )}

          {/* STEP 3: CHRONOTYPE */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl font-heading font-black text-slate-900 mb-3 tracking-tight">{isPt ? 'Seu Cronotipo?' : 'Your Chronotype?'}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{isPt ? 'Para otimizar seus horários de pico biológico.' : 'To optimize your biological peak times.'}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { id: 'lion', label: isPt ? 'Leão' : 'Lion', sub: isPt ? 'Manhã' : 'Early', icon: Sunrise, desc: '05:00 - 21:00' },
                        { id: 'bear', label: isPt ? 'Urso' : 'Bear', sub: isPt ? 'Solar' : 'Solar', icon: Sun, desc: '07:00 - 23:00' },
                        { id: 'wolf', label: isPt ? 'Lobo' : 'Wolf', sub: isPt ? 'Noite' : 'Late', icon: Moon, desc: '10:00 - 02:00' },
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setChronotype(type.id as Chronotype)}
                            className={`flex flex-col items-center justify-center p-4 py-6 rounded-3xl border-2 transition-all hover:scale-[1.05] ${
                                chronotype === type.id 
                                ? 'border-accent-500 bg-accent-50 text-accent-900 shadow-lg shadow-accent-100' 
                                : 'border-slate-100 hover:border-accent-200 text-slate-500 bg-white'
                            }`}
                        >
                            <type.icon className={`w-10 h-10 mb-3 ${chronotype === type.id ? 'text-accent-600' : 'text-slate-300'}`} />
                            <span className="font-bold text-lg font-heading">{type.label}</span>
                            <span className="text-xs uppercase font-bold tracking-wider opacity-60 mb-2">{type.sub}</span>
                            <span className="text-[10px] font-mono bg-white/50 px-2 py-1 rounded-md">{type.desc}</span>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!chronotype}
                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                    {t.complete}
                </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
