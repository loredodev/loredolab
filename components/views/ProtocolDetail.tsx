
import React, { useState } from 'react';
import { Protocol, Language, EvidenceLevel } from '../../types';
import { ArrowLeft, Clock, ShieldCheck, AlertTriangle, BookOpen, Play, CheckCircle2 } from 'lucide-react';
import { CONTENT } from '../../constants';

interface ProtocolDetailProps {
  protocol: Protocol;
  onBack: () => void;
  onStart: () => void;
  lang: Language;
}

export const ProtocolDetail: React.FC<ProtocolDetailProps> = ({ protocol, onBack, onStart, lang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'evidence'>('overview');
  const t = CONTENT[lang];
  const td = t.protocolDetail;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center text-lab-500 hover:text-lab-800 transition">
        <ArrowLeft className="w-4 h-4 mr-1" /> {t.common.back}
      </button>

      {/* Header Card */}
      <div className="bg-white p-8 rounded-2xl border border-lab-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BookOpen className="w-32 h-32 text-primary-900" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
             {protocol.tags.map(tag => (
               <span key={tag} className="px-2 py-1 bg-lab-100 text-lab-600 rounded text-xs font-bold uppercase tracking-wide">
                 {tag}
               </span>
             ))}
          </div>
          <h1 className="text-4xl font-bold text-lab-900 mb-2">{protocol.title}</h1>
          <p className="text-xl text-lab-600 max-w-2xl">{protocol.description}</p>
          
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center text-lab-700">
              <Clock className="w-5 h-5 mr-2 text-primary-500" />
              <span className="font-medium">{protocol.durationDays} {t.common.days}</span>
            </div>
            <div className="flex items-center text-lab-700">
              <ShieldCheck className={`w-5 h-5 mr-2 ${
                  protocol.evidenceLevel === EvidenceLevel.GOLD ? 'text-emerald-500' : 'text-amber-500'
              }`} />
              <span className="font-medium">{t.evidenceLevels[protocol.evidenceLevel]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-1 border-b border-lab-200">
        {(['overview', 'steps', 'evidence'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === tab 
                    ? 'border-primary-600 text-primary-700' 
                    : 'border-transparent text-lab-500 hover:text-lab-700'
                }`}
            >
                {td.tabs[tab]}
            </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl border border-lab-200 shadow-sm min-h-[300px]">
        {activeTab === 'overview' && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-lab-900 mb-2">{td.mechanism}</h3>
                    <p className="text-lab-700 leading-relaxed">{protocol.mechanism}</p>
                </div>
                
                <div>
                     <h3 className="text-lg font-bold text-lab-900 mb-2">{td.metrics}</h3>
                     <div className="flex gap-2">
                        {protocol.recommendedMetrics.map(m => (
                            <span key={m} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                                {m}
                            </span>
                        ))}
                     </div>
                </div>

                {protocol.contraindications.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                        <h4 className="flex items-center text-amber-800 font-bold mb-2">
                            <AlertTriangle className="w-4 h-4 mr-2" /> {td.contraindications}
                        </h4>
                        <ul className="list-disc list-inside text-amber-700 text-sm">
                            {protocol.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'steps' && (
            <div className="space-y-4">
                {protocol.steps.map((step) => (
                    <div key={step.order} className="flex gap-4 p-4 rounded-lg bg-lab-50 border border-lab-100">
                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 shadow-sm border border-lab-200">
                            {step.order}
                        </div>
                        <div>
                            <h4 className="font-bold text-lab-900">{step.title}</h4>
                            <p className="text-lab-600 text-sm mt-1">{step.description}</p>
                        </div>
                        {step.isMandatory && (
                            <div className="ml-auto">
                                <span className="text-xs font-bold text-lab-400 uppercase tracking-wider">{td.required}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'evidence' && (
            <div className="space-y-4">
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <h4 className="font-bold text-blue-900 mb-1">{td.evidenceLevel}: {t.evidenceLevels[protocol.evidenceLevel]}</h4>
                    <p className="text-sm text-blue-700">
                        {td.evidenceDescriptions[protocol.evidenceLevel]}
                    </p>
                 </div>

                 <h3 className="font-bold text-lab-900">{td.citations}</h3>
                 <ul className="space-y-3">
                    {protocol.citations.map((cit, i) => (
                        <li key={i} className="flex gap-3 text-sm text-lab-700">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium italic">"{cit.title}"</div>
                                <div className="text-lab-500">{cit.author} ({cit.year}) {cit.doi && <span className="underline ml-2 text-primary-600 cursor-pointer">DOI: {cit.doi}</span>}</div>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>
        )}
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button 
            onClick={onStart}
            className="flex items-center bg-lab-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-lab-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
            <Play className="w-5 h-5 mr-3" />
            {td.start}
        </button>
      </div>
    </div>
  );
};
