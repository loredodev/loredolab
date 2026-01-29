
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProtocolLibrary } from './components/views/ProtocolLibrary';
import { ProtocolDetail } from './components/views/ProtocolDetail';
import { ActiveExperiment } from './components/views/ActiveExperiment';
import { Login } from './components/views/Login';
import { Onboarding } from './components/views/Onboarding';
import { OrgDashboard } from './components/views/OrgDashboard';
import { Settings } from './components/views/Settings';
import { KnowledgeBase } from './components/views/KnowledgeBase';
import { HydrationTracker } from './components/views/HydrationTracker';
import { MindReprogramming } from './components/views/MindReprogramming';
import { GamificationHub } from './components/views/GamificationHub';
import { AdvancedAnalytics } from './components/views/AdvancedAnalytics';
import { CONTENT, getProtocols } from './constants';
import { Experiment, ExperimentStatus, Protocol, LogEntry, Language, User, UserRole, Chronotype } from './types';
import { generateExperimentInsight } from './services/geminiService';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus, Loader2, Microscope, FileText, ArrowRight, Sun, Moon, Sunrise, Clock } from 'lucide-react';
import { MetricsChart } from './components/MetricsChart';
import { supabase } from './services/supabase';
import { CommandPalette } from './components/CommandPalette';

const App: React.FC = () => {
  // --- Global State ---
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [lang, setLang] = useState<Language>('en');
  const [activeView, setActiveView] = useState('dashboard');
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  
  // --- Experiment State ---
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Auto-detect language
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) {
      setLang('pt');
    }
  }, []);

  // --- Keyboard Shortcut for Command Palette (Cmd+K / Ctrl+K) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Supabase Auth Listener ---
  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSessionToUser(session.user);
      } else {
        setLoadingSession(false);
      }
    }).catch(err => {
      console.error("Session check failed:", err);
      setLoadingSession(false);
    });

    // 2. Listen for changes (login, logout, signup)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSessionToUser(session.user);
      } else {
        setUser(null);
        setLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSessionToUser = (authUser: any) => {
      const metadata = authUser.user_metadata || {};
      setUser({
          id: authUser.id,
          name: metadata.full_name || '',
          email: authUser.email || '',
          role: metadata.role || 'SCIENTIST',
          onboardingCompleted: metadata.onboarding_completed || false,
          chronotype: metadata.chronotype, // Mapping new field
          avatarUrl: metadata.avatar_url
      });
      setLoadingSession(false);
  };

  const t = CONTENT[lang];
  const currentProtocols = getProtocols(lang);

  // Sync active protocol info if language changes
  useEffect(() => {
    if (selectedProtocol) {
      const updatedProto = currentProtocols.find(p => p.id === selectedProtocol.id);
      if (updatedProto) setSelectedProtocol(updatedProto);
    }
  }, [lang]);

  // --- Auth Handlers ---
  
  const handleOnboardingComplete = async (name: string, role: UserRole, chronotype: Chronotype) => {
    if (user) {
      const updatedUser = { ...user, name, role, chronotype, onboardingCompleted: true };
      setUser(updatedUser);
      try {
          await supabase.auth.updateUser({
              data: { full_name: name, role: role, chronotype: chronotype, onboarding_completed: true }
          });
      } catch (error) {
          console.error("Failed to update user profile", error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveExperiment(null);
    setActiveView('dashboard');
  };

  // --- Experiment Actions ---

  const handleSelectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setActiveView('detail');
  };

  const startExperiment = () => {
    if (!selectedProtocol) return;
    const newExperiment: Experiment = {
      id: `exp-${Date.now()}`,
      protocolId: selectedProtocol.id,
      status: ExperimentStatus.BASELINE,
      startDate: new Date().toISOString(),
      baselineLogs: [],
      interventionLogs: []
    };
    setActiveExperiment(newExperiment);
    setActiveView('active');
  };

  const handleLogSubmit = (val: number, notes: string) => {
    if (!activeExperiment) return;

    const entry: LogEntry = {
      date: new Date().toISOString(),
      metricValue: val,
      notes: notes
    };

    const updatedExperiment = { ...activeExperiment };
    
    if (updatedExperiment.status === ExperimentStatus.BASELINE) {
      updatedExperiment.baselineLogs = [...updatedExperiment.baselineLogs, entry];
      if (updatedExperiment.baselineLogs.length >= 3) {
        updatedExperiment.status = ExperimentStatus.INTERVENTION;
      }
    } else {
      updatedExperiment.interventionLogs = [...updatedExperiment.interventionLogs, entry];
    }

    setActiveExperiment(updatedExperiment);
  };

  const handleImportCsv = (logs: LogEntry[]) => {
      if (!activeExperiment) return;
      const updated = { ...activeExperiment };
      if (updated.status === ExperimentStatus.BASELINE) {
          updated.baselineLogs = [...updated.baselineLogs, ...logs];
      } else {
          updated.interventionLogs = [...updated.interventionLogs, ...logs];
      }
      setActiveExperiment(updated);
  };

  const finishExperiment = async () => {
    if (!activeExperiment || !selectedProtocol) return;
    setIsAnalyzing(true);
    const updatedExperiment = { ...activeExperiment, status: ExperimentStatus.COMPLETED };
    
    try {
        const report = await generateExperimentInsight(updatedExperiment, selectedProtocol, lang);
        updatedExperiment.aiAnalysis = report || undefined;
    } catch (e) {
        console.error(e);
    }
    
    setActiveExperiment(updatedExperiment);
    setIsAnalyzing(false);
    setActiveView('reports');
  };

  // --- Render Logic ---

  if (loadingSession) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
      );
  }

  if (!user) return <Login onLogin={() => {}} lang={lang} setLang={setLang} />;
  
  if (!user.onboardingCompleted) return <Onboarding onComplete={handleOnboardingComplete} lang={lang} setLang={setLang} />;

  const getChronotypeInfo = (c?: Chronotype) => {
      switch(c) {
          case 'lion': return { icon: Sunrise, label: lang === 'pt' ? 'Leão' : 'Lion', time: '06:00 - 10:00' };
          case 'wolf': return { icon: Moon, label: lang === 'pt' ? 'Lobo' : 'Wolf', time: '18:00 - 22:00' };
          case 'bear': return { icon: Sun, label: lang === 'pt' ? 'Urso' : 'Bear', time: '10:00 - 14:00' };
          default: return null;
      }
  };

  const chronotypeInfo = getChronotypeInfo(user.chronotype);

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
                    {t.dashboard.title}
                </h1>
                <p className="text-slate-400 font-medium mt-2 text-lg">
                    {t.dashboard.welcome}, <span className="font-bold text-blue-400">{user.name || user.email}</span>. {t.dashboard.ready}
                </p>
            </div>
            
            {/* Bio-Personalization Badge */}
            {chronotypeInfo && (
                <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <chronotypeInfo.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-heading">Bio-Type</div>
                        <div className="font-bold text-white text-sm">{chronotypeInfo.label}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-700 mx-2"></div>
                    <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-heading">Peak Flow</div>
                        <div className="font-bold text-blue-400 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {chronotypeInfo.time}
                        </div>
                    </div>
                </div>
            )}
        </header>

        {activeExperiment ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                {/* Decorative blob in background */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 font-heading">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        {t.dashboard.currentExp}
                    </h2>
                    <button 
                        onClick={() => setActiveView('active')} 
                        className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition flex items-center gap-2 group/btn"
                    >
                        {t.dashboard.openDash} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 font-heading">{t.dashboard.protocol}</div>
                        <div className="font-bold text-slate-800 text-lg leading-tight font-heading">{selectedProtocol?.title}</div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 font-heading">{t.dashboard.status}</div>
                        <div className="font-bold text-emerald-600 text-lg flex items-center gap-2 bg-emerald-100 w-fit px-3 py-1 rounded-lg">
                            {t.status[activeExperiment.status]}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 font-heading">{t.dashboard.dataPoints}</div>
                        <div className="font-bold text-slate-800 text-lg font-mono">
                            {activeExperiment.baselineLogs.length + activeExperiment.interventionLogs.length} <span className="text-slate-400 text-sm font-sans font-medium">logs</span>
                        </div>
                    </div>
                </div>
                <div className="h-64 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                    <MetricsChart experiment={activeExperiment} lang={lang} />
                </div>
            </div>
        ) : (
            <div className="text-center py-24 bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] border border-slate-700 shadow-lg relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-700 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 border border-slate-600">
                        <Microscope className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-heading font-black text-white mb-3">{t.active.noActive}</h3>
                    <p className="text-slate-400 mb-10 max-w-md mx-auto text-lg">{t.dashboard.noData}</p>
                    <button 
                        onClick={() => setActiveView('protocols')}
                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-500 transition shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-1 flex items-center gap-3"
                    >
                        {t.library.browse} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
    </div>
  );

  const renderReportView = () => {
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-white">{t.reports.analyzing}</h2>
                <p className="text-slate-400">Generating scientific insights...</p>
            </div>
        );
    }
    if (!activeExperiment || !activeExperiment.aiAnalysis) {
        return (
            <div className="text-center py-20 animate-in fade-in">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">{t.reports.noReports}</h2>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">{t.reports.completeToGen}</p>
                {activeExperiment ? (
                    <button onClick={() => setActiveView('active')} className="text-blue-400 font-bold hover:underline">
                        Go to Active Experiment &rarr;
                    </button>
                ) : (
                    <button onClick={() => setActiveView('protocols')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition">
                        {t.library.browse}
                    </button>
                )}
            </div>
        );
    }
    const report = activeExperiment.aiAnalysis;
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 pb-20">
            <button onClick={() => setActiveView('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-700">
                &larr; {t.reports.backToDash}
            </button>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl">
                <header className="border-b border-slate-100 pb-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">{selectedProtocol?.title || "Experiment"}: {t.reports.finalReport}</h1>
                            <p className="text-slate-500 mt-2 font-medium">N=1 Experiment • {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-200">{t.reports.finalized}</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[2rem] border border-blue-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
                         <h3 className="font-bold text-blue-900 mb-3 uppercase text-xs tracking-widest font-heading">{t.reports.headline}</h3>
                         <p className="text-2xl font-bold text-blue-800 leading-snug font-heading">{report.headline}</p>
                     </div>
                     <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                         <h3 className="font-bold text-slate-500 mb-3 uppercase text-xs tracking-widest font-heading">{t.reports.statSummary}</h3>
                         <p className="text-slate-800 font-medium text-lg leading-relaxed">{report.statisticalSummary}</p>
                     </div>
                </div>

                <div className="mb-10">
                    <h3 className="font-bold text-slate-900 mb-6 text-xl font-heading">{t.reports.visualData}</h3>
                    <div className="h-80 border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                        <MetricsChart experiment={activeExperiment} lang={lang} />
                    </div>
                </div>

                <div className="prose prose-lg prose-indigo max-w-none font-sans">
                     <h3 className="text-xl font-bold font-heading">{t.reports.observations}</h3>
                     <p className="text-gray-600">{report.observation}</p>
                     <h3 className="text-xl font-bold font-heading">{t.reports.recommendations}</h3>
                     <p className="text-gray-600">{report.recommendation}</p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 text-xs text-slate-400">
                    <p className="font-black uppercase tracking-widest mb-1">{t.reports.limitations}</p>
                    <p>{report.disclaimer}</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <>
        <CommandPalette 
            isOpen={isCmdOpen} 
            onClose={() => setIsCmdOpen(false)} 
            onNavigate={(v) => setActiveView(v)} 
            lang={lang} 
        />
        
        <Layout 
          activeView={activeView} 
          onChangeView={setActiveView} 
          lang={lang} 
          setLang={setLang}
          userRole={user.role}
          onOpenCommandPalette={() => setIsCmdOpen(true)} // Passed down
        >
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'protocols' && <ProtocolLibrary onSelectProtocol={handleSelectProtocol} lang={lang} />}
          {activeView === 'detail' && selectedProtocol && (
              <ProtocolDetail 
                protocol={selectedProtocol} 
                lang={lang} 
                onBack={() => setActiveView('protocols')} 
                onStart={startExperiment} 
              />
          )}
          {activeView === 'active' && activeExperiment && selectedProtocol && (
              <ActiveExperiment 
                experiment={activeExperiment} 
                protocol={selectedProtocol} 
                lang={lang}
                onLogSubmit={handleLogSubmit}
                onFinish={finishExperiment}
                onImportCsv={handleImportCsv}
              />
          )}
          {activeView === 'reports' && renderReportView()}
          
          {activeView === 'knowledge' && <KnowledgeBase lang={lang} user={user} />}
          {activeView === 'hydration' && <HydrationTracker lang={lang} user={user} />}
          {activeView === 'mind' && <MindReprogramming lang={lang} />}
          {activeView === 'community' && <GamificationHub lang={lang} user={user} />}
          {activeView === 'analytics' && <AdvancedAnalytics lang={lang} />}
          {activeView === 'organization' && <OrgDashboard lang={lang} />}
          {activeView === 'settings' && <Settings user={user} onLogout={handleLogout} lang={lang} />}
        </Layout>
    </>
  );
};

export default App;
