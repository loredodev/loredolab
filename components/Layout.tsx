
import React from 'react';
import { LayoutDashboard, FlaskConical, FileText, Settings, Menu, X, Microscope, Building2, BookOpen, Droplets, Brain, BarChart2, Users, Search, Command } from 'lucide-react';
import { Language, UserRole } from '../types';
import { CONTENT } from '../constants';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  userRole: UserRole;
  onOpenCommandPalette: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView, lang, setLang, userRole, onOpenCommandPalette }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const t = CONTENT[lang];
  const isPt = lang === 'pt';

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(id);
        setIsMobileMenuOpen(false);
      }}
      className={`relative group flex items-center w-full px-4 py-3 mb-1.5 rounded-xl transition-all duration-300 font-medium text-sm ${
        activeView === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 transition-colors ${activeView === id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
      <span className={activeView === id ? 'font-bold' : ''}>{label}</span>
      {activeView === id && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Background Ambience (Subtle Deep Glows) */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50">
        <Logo className="scale-75" theme="dark" />
        <div className="flex gap-2">
            <button onClick={onOpenCommandPalette} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-slate-800">
            {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
            </button>
        </div>
      </div>

      {/* Sidebar - Dark Mode Integrated */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8">
            <Logo theme="dark" />
          </div>

          {/* COMMAND PALETTE BUTTON */}
          <div className="px-4 mb-6">
              <button 
                onClick={onOpenCommandPalette}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-slate-800 transition-all group text-sm"
              >
                  <Search className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span className="flex-1 text-left font-medium">{isPt ? 'Buscar...' : 'Search...'}</span>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-300">⌘</span>
                      <span className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-300">K</span>
                  </div>
              </button>
          </div>
          
          <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-1 scrollbar-hide">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-4 mt-2 opacity-80 font-heading">
                {isPt ? 'Laboratório' : 'Laboratory'}
            </div>
            <NavItem id="dashboard" icon={LayoutDashboard} label={t.nav.dashboard} />
            <NavItem id="protocols" icon={FlaskConical} label={t.nav.protocols} />
            <NavItem id="active" icon={Microscope} label={t.nav.active} />
            <NavItem id="analytics" icon={BarChart2} label={t.nav.analytics} />
            <NavItem id="reports" icon={FileText} label={t.nav.reports} />

            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-4 mt-8 opacity-80 font-heading">
                {isPt ? 'Bio-OS' : 'Bio-OS'}
            </div>
            <NavItem id="community" icon={Users} label={t.nav.community} />
            <NavItem id="knowledge" icon={BookOpen} label={t.nav.knowledge} />
            <NavItem id="hydration" icon={Droplets} label={t.nav.hydration} />
            <NavItem id="mind" icon={Brain} label={t.nav.mind} />
            
            {userRole === 'MANAGER' && (
              <>
               <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-4 mt-8 opacity-80 font-heading">
                   {isPt ? 'Equipe' : 'Team'}
               </div>
               <NavItem id="organization" icon={Building2} label={t.nav.organization} />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
             <NavItem id="settings" icon={Settings} label={t.nav.settings} />
             <div className="mt-4 flex items-center gap-3 px-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">v2.1 • Online</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10 flex flex-col h-screen">
        {/* Top Bar for Language Switcher */}
        <div className="sticky top-0 z-40 px-6 md:px-10 py-4 flex justify-end items-center pointer-events-none">
            <div className="pointer-events-auto flex space-x-1 bg-slate-800/80 backdrop-blur-xl p-1 rounded-full shadow-lg border border-slate-700">
                <button 
                    onClick={() => setLang('en')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        lang === 'en' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLang('pt')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        lang === 'pt' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    PT
                </button>
            </div>
        </div>

        <div className="flex-1 px-4 md:px-10 pb-10 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
