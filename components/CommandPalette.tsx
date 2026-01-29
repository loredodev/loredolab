
import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, Zap, Moon, Sun, Droplets, BookOpen, LayoutDashboard, Activity } from 'lucide-react';
import { Language } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  lang: Language;
  toggleTheme?: () => void; // Future proofing
}

type Action = {
  id: string;
  label_pt: string;
  label_en: string;
  icon: any;
  action: () => void;
  group: 'navigation' | 'action' | 'utility';
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, lang }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isPt = lang === 'pt';

  // Define actions inside component to access props
  const actions: Action[] = [
    // Navigation
    { id: 'nav-dash', label_pt: 'Ir para Painel', label_en: 'Go to Dashboard', icon: LayoutDashboard, group: 'navigation', action: () => onNavigate('dashboard') },
    { id: 'nav-lib', label_pt: 'Explorar Biblioteca', label_en: 'Browse Library', icon: BookOpen, group: 'navigation', action: () => onNavigate('protocols') },
    { id: 'nav-active', label_pt: 'Experimento Ativo', label_en: 'Active Experiment', icon: Activity, group: 'navigation', action: () => onNavigate('active') },
    { id: 'nav-mind', label_pt: 'Laboratório Mental', label_en: 'Mind Lab', icon: BrainIcon, group: 'navigation', action: () => onNavigate('mind') },
    
    // Actions
    { id: 'act-water', label_pt: 'Registrar Água', label_en: 'Log Water', icon: Droplets, group: 'action', action: () => onNavigate('hydration') },
    { id: 'act-focus', label_pt: 'Iniciar Modo Foco', label_en: 'Start Focus Mode', icon: Zap, group: 'action', action: () => onNavigate('active') }, // Shortcut to active
    
    // Utility
    // { id: 'util-theme', label_pt: 'Alternar Tema', label_en: 'Toggle Theme', icon: Moon, group: 'utility', action: () => alert('Theme toggle coming soon') },
  ];

  const filteredActions = actions.filter(action => {
    const label = isPt ? action.label_pt : action.label_en;
    return label.toLowerCase().includes(query.toLowerCase());
  });

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all scale-100">
        
        {/* Search Bar */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder={isPt ? "O que você precisa?" : "What do you need?"}
            className="flex-1 bg-transparent outline-none text-lg text-slate-800 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden md:flex items-center gap-2">
             <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs text-slate-500 font-sans">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredActions.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              {isPt ? 'Nenhum comando encontrado.' : 'No commands found.'}
            </div>
          ) : (
            <div className="space-y-1">
               {/* Could group by category here if list gets long */}
               {filteredActions.map((action, index) => (
                 <button
                    key={action.id}
                    onClick={() => { action.action(); onClose(); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      index === selectedIndex ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500' : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                 >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white text-primary-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{isPt ? action.label_pt : action.label_en}</span>
                    </div>
                    {index === selectedIndex && <ArrowRight className="w-4 h-4 text-primary-400" />}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>LoredoLAB OS v2.1</span>
            <div className="flex gap-3">
                <span><strong className="font-medium text-slate-600">↑↓</strong> {isPt ? 'navegar' : 'navigate'}</span>
                <span><strong className="font-medium text-slate-600">↵</strong> {isPt ? 'selecionar' : 'select'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const BrainIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);
