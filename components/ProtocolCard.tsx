import React from 'react';
import { Protocol, EvidenceLevel, Language } from '../types';
import { ChevronRight, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { CONTENT } from '../constants';

interface ProtocolCardProps {
  protocol: Protocol;
  onSelect: (protocol: Protocol) => void;
  lang: Language;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, onSelect, lang }) => {
  const t = CONTENT[lang];
  
  const getEvidenceIcon = (level: EvidenceLevel) => {
    switch (level) {
      case EvidenceLevel.GOLD: return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case EvidenceLevel.SILVER: return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case EvidenceLevel.BRONZE: return <ShieldQuestion className="w-4 h-4 text-amber-500" />;
      default: return <ShieldAlert className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-lab-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 bg-lab-50 px-2 py-1 rounded-full border border-lab-100">
          {getEvidenceIcon(protocol.evidenceLevel)}
          <span className="text-xs font-medium text-lab-600">
            {t.evidenceLevels[protocol.evidenceLevel]}
          </span>
        </div>
        <span className="text-xs font-semibold text-lab-400">
          {protocol.durationDays} {t.common.days}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-lab-900 mb-2">{protocol.title}</h3>
      <p className="text-sm text-lab-600 mb-4 line-clamp-3">{protocol.description}</p>
      
      <div className="mt-auto pt-4 border-t border-lab-100 flex justify-between items-center">
        <div className="flex space-x-2">
          {protocol.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-lab-500 bg-lab-100 px-2 py-1 rounded">{tag}</span>
          ))}
        </div>
        <button 
          onClick={() => onSelect(protocol)}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
        >
          {t.library.viewDetails} <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};