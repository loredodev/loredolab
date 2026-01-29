
import React, { useState, useMemo } from 'react';
import { Protocol, Language, EvidenceLevel } from '../../types';
import { ProtocolCard } from '../ProtocolCard';
import { Search, Filter, Microscope, Zap, Moon, CheckSquare, Activity, Crosshair, BatteryCharging, Map as MapIcon, Plus, X } from 'lucide-react';
import { CONTENT, getProtocols } from '../../constants';
import { getProtocolPacks } from '../../data/packs';

interface ProtocolLibraryProps {
  onSelectProtocol: (protocol: Protocol) => void;
  lang: Language;
}

const IconMap: Record<string, any> = {
  Zap, Moon, CheckSquare, Activity, Crosshair, BatteryCharging, Map: MapIcon
};

const isProtocolInPack = (protocolId: string, packIds: string[]) => {
    const normalize = (s: string) => s.toLowerCase().trim();
    const pid = normalize(protocolId);
    return packIds.some(rawPackId => {
        const packId = normalize(rawPackId);
        return pid === packId || pid.startsWith(`${packId}-`);
    });
};

export const ProtocolLibrary: React.FC<ProtocolLibraryProps> = ({ onSelectProtocol, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<EvidenceLevel | 'ALL'>('ALL');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  
  const t = CONTENT[lang];
  const allProtocols = useMemo(() => getProtocols(lang), [lang]);
  const packs = useMemo(() => getProtocolPacks(lang), [lang]);

  const filteredProtocols = useMemo(() => {
    return allProtocols.filter(p => {
      if (selectedPackId) {
         const pack = packs.find(pk => pk.id === selectedPackId);
         if (!pack || !isProtocolInPack(p.id, pack.protocolIds)) return false;
      }
      if (filterLevel !== 'ALL' && p.evidenceLevel !== filterLevel) return false;
      if (searchTerm.trim()) {
          try {
              const term = searchTerm.toLowerCase();
              if (!p.title.toLowerCase().includes(term) && !p.description.toLowerCase().includes(term)) return false;
          } catch (e) { return false; }
      }
      return true;
    });
  }, [allProtocols, searchTerm, filterLevel, selectedPackId, packs]);

  const clearAllFilters = () => { setSearchTerm(''); setFilterLevel('ALL'); setSelectedPackId(null); };
  const gridKey = `${selectedPackId}-${filterLevel}-${searchTerm}-${filteredProtocols.length}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between md:items-start gap-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.library.title}</h1>
            <p className="text-slate-500 mt-2 text-lg">{t.library.subtitle}</p>
        </div>
        <button 
            onClick={() => alert('Feature coming soon')}
            className="flex items-center bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black transition shadow-lg hover:shadow-xl w-full md:w-auto justify-center transform hover:-translate-y-0.5"
        >
            <Plus className="w-4 h-4 mr-2" />
            {t.library.createCustom}
        </button>
      </header>

      {/* Packs - More Vivid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {packs.map(pack => {
            const isActive = selectedPackId === pack.id;
            const Icon = IconMap[pack.iconName] || Zap;
            const count = allProtocols.filter(p => isProtocolInPack(p.id, pack.protocolIds)).length;
            
            return (
                <button
                    key={pack.id}
                    onClick={() => setSelectedPackId(isActive ? null : pack.id)}
                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col justify-between h-40 relative group overflow-hidden ${
                        isActive
                        ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white shadow-xl scale-[1.02]' 
                        : 'border-transparent bg-white hover:border-indigo-200 hover:shadow-lg shadow-sm'
                    }`}
                >
                    <div className={`absolute top-0 right-0 p-16 rounded-full blur-2xl opacity-10 transition-colors ${pack.colorClass.replace('text-', 'bg-')}`}></div>
                    
                    <div className="flex justify-between items-start w-full relative z-10">
                        <div className={`p-3 rounded-2xl w-fit transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                            {count}
                        </span>
                    </div>
                    <div className="relative z-10">
                        <div className="font-bold text-lg text-slate-900 leading-tight mb-1">{pack.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{pack.description}</div>
                    </div>
                </button>
            );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-2 z-20 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={t.library.searchPlaceholder}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="relative">
              <select 
                className="h-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-100 appearance-none pr-10"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as EvidenceLevel | 'ALL')}
              >
                <option value="ALL">All Levels</option>
                <option value={EvidenceLevel.GOLD}>🥇 Gold Standard</option>
                <option value={EvidenceLevel.SILVER}>🥈 Silver</option>
                <option value={EvidenceLevel.BRONZE}>🥉 Bronze</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
      </div>

      {/* Results */}
      <div className="flex justify-between items-end px-2">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {filteredProtocols.length} Results
          </div>
          {(selectedPackId || filterLevel !== 'ALL' || searchTerm) && (
              <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition">
                  Clear Filters
              </button>
          )}
      </div>

      {filteredProtocols.length > 0 ? (
        <div key={gridKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtocols.map(p => (
            <ProtocolCard key={p.id} protocol={p} lang={lang} onSelect={onSelectProtocol} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white/50 rounded-3xl border border-dashed border-slate-300">
          <Microscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">{t.library.noProtocols}</h3>
          <p className="text-slate-500 mb-6">{t.library.tryAdjusting}</p>
          <button onClick={clearAllFilters} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 shadow-sm">
              Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
