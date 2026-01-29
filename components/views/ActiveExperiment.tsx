
import React from 'react';
import { Experiment, ExperimentStatus, Protocol, Language } from '../../types';
import { Plus, Check, MoreHorizontal, Calendar, TrendingUp, Zap } from 'lucide-react';
import { CONTENT } from '../../constants';
import { MetricsChart } from '../MetricsChart';
import { CsvUploader } from '../CsvUploader';
import { FocusMode } from '../FocusMode';

interface ActiveExperimentProps {
  experiment: Experiment;
  protocol: Protocol;
  onLogSubmit: (value: number, notes: string) => void;
  onFinish: () => void;
  onImportCsv: (data: any[]) => void;
  lang: Language;
}

export const ActiveExperiment: React.FC<ActiveExperimentProps> = ({ experiment, protocol, onLogSubmit, onFinish, onImportCsv, lang }) => {
  const [logValue, setLogValue] = React.useState(5);
  const [logNotes, setLogNotes] = React.useState('');
  const [showImport, setShowImport] = React.useState(false);
  const [isFocusMode, setIsFocusMode] = React.useState(false);

  const t = CONTENT[lang];
  const ta = t.active;
  const isBaseline = experiment.status === ExperimentStatus.BASELINE;
  const totalLogs = experiment.baselineLogs.length + experiment.interventionLogs.length;
  const daysActive = Math.ceil((Date.now() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24));
  
  const baselineAvg = experiment.baselineLogs.length ? (experiment.baselineLogs.reduce((a,b) => a + b.metricValue, 0) / experiment.baselineLogs.length).toFixed(1) : '-';
  const interventionAvg = experiment.interventionLogs.length ? (experiment.interventionLogs.reduce((a,b) => a + b.metricValue, 0) / experiment.interventionLogs.length).toFixed(1) : '-';

  if (isFocusMode) {
      return <FocusMode lang={lang} onExit={() => setIsFocusMode(false)} taskTitle={protocol.title} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header / Status Bar */}
      <div className="bg-white rounded-xl border border-lab-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${isBaseline ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isBaseline ? ta.phase1 : ta.phase2}
                </span>
                <span className="text-lab-400 text-sm">•</span>
                <span className="text-lab-500 text-sm font-medium">{protocol.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-lab-900">
                {ta.day} {daysActive} {t.common.of} {protocol.durationDays}
            </h1>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={() => setIsFocusMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
             >
                <Zap className="w-4 h-4 fill-white" />
                {lang === 'pt' ? 'Modo Foco' : 'Focus Mode'}
             </button>
             <button 
                onClick={() => setShowImport(!showImport)}
                className="px-4 py-2 bg-white border border-lab-300 text-lab-700 rounded-lg text-sm font-medium hover:bg-lab-50"
             >
                {ta.importCsv}
             </button>
             {experiment.interventionLogs.length >= 3 && (
                <button 
                    onClick={onFinish}
                    className="px-4 py-2 bg-lab-900 text-white rounded-lg text-sm font-bold hover:bg-lab-800"
                >
                    {ta.finish}
                </button>
             )}
         </div>
      </div>

      {showImport && (
         <div className="bg-white p-4 rounded-xl border border-lab-200 shadow-lg relative z-10 animate-in slide-in-from-top-2">
             <CsvUploader 
                lang={lang} 
                onCancel={() => setShowImport(false)} 
                onUploadComplete={(logs) => {
                    onImportCsv(logs);
                    setShowImport(false);
                }} 
             />
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Main Chart Column */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-lab-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lab-800">{ta.trajectory}</h3>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                            <span className="text-lab-500">{ta.baseline}: <span className="font-mono font-bold text-lab-900">{baselineAvg}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                             <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-lab-500">{ta.intervention}: <span className="font-mono font-bold text-lab-900">{interventionAvg}</span></span>
                        </div>
                    </div>
                </div>
                <div className="h-80">
                    <MetricsChart experiment={experiment} lang={lang} />
                </div>
            </div>

            {/* Recent Logs List (Collapsed for MVP) */}
            <div className="bg-white p-6 rounded-xl border border-lab-200 shadow-sm">
                <h3 className="font-bold text-lab-800 mb-4">{ta.recentLogs}</h3>
                <div className="space-y-2">
                    {[...experiment.interventionLogs, ...experiment.baselineLogs].slice(-3).reverse().map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-lab-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="font-mono font-bold text-primary-700 bg-white border border-lab-200 w-8 h-8 flex items-center justify-center rounded">
                                    {log.metricValue}
                                </div>
                                <div className="text-sm text-lab-600">{log.notes || 'No notes'}</div>
                            </div>
                            <div className="text-xs text-lab-400">
                                {new Date(log.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {totalLogs === 0 && <div className="text-lab-400 italic text-sm">{ta.noLogs}</div>}
                </div>
            </div>
         </div>

         {/* Sidebar: Log Input & Stats */}
         <div className="space-y-6">
            
            {/* Quick Log Card */}
            <div className="bg-gradient-to-br from-white to-lab-50 p-6 rounded-xl border border-lab-200 shadow-sm">
                <h3 className="font-bold text-lab-900 mb-4 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                    {ta.todaysLog}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-lab-600">{ta.score} ({isBaseline ? ta.baseline : ta.intervention})</span>
                            <span className="font-bold text-primary-700 text-lg">{logValue}</span>
                        </div>
                        <input 
                            type="range" min="1" max="10" 
                            value={logValue}
                            onChange={(e) => setLogValue(parseInt(e.target.value))}
                            className="w-full h-2 bg-lab-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-xs text-lab-400 px-1 mt-1">
                            <span>{ta.poor}</span>
                            <span>{ta.excellent}</span>
                        </div>
                    </div>

                    <textarea 
                        className="w-full text-sm p-3 border border-lab-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        rows={3}
                        placeholder={ta.contextPlaceholder}
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                    />

                    <button 
                        onClick={() => {
                            onLogSubmit(logValue, logNotes);
                            setLogNotes('');
                        }}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition shadow-sm flex items-center justify-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {ta.logEntry}
                    </button>
                </div>
            </div>

            {/* Tips Card */}
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 text-sm mb-2">{ta.tipTitle}</h4>
                <p className="text-xs text-indigo-800 leading-relaxed">
                    {isBaseline ? ta.tipBaseline : ta.tipIntervention}
                </p>
            </div>

         </div>
      </div>
    </div>
  );
};
