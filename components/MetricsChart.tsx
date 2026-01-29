
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Experiment, Language } from '../types';
import { CONTENT } from '../constants';

interface MetricsChartProps {
  experiment: Experiment;
  lang: Language;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ experiment, lang }) => {
  const t = CONTENT[lang];
  
  // Combine data for charting
  const baselineData = experiment.baselineLogs.map((log, index) => ({
    name: `B${index + 1}`,
    value: log.metricValue,
    phase: t.phases.baseline,
    fullDate: log.date
  }));

  const interventionData = experiment.interventionLogs.map((log, index) => ({
    name: `I${index + 1}`,
    value: log.metricValue,
    phase: t.phases.intervention,
    fullDate: log.date
  }));

  const data = [...baselineData, ...interventionData];

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center bg-white rounded-xl border border-dashed border-lab-300 text-lab-400 w-full">
        {t.dashboard.noData}
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-lab-200 overflow-hidden">
      <h3 className="text-sm font-semibold text-lab-600 mb-4">{t.dashboard.timeline}</h3>
      {/* Definindo altura fixa de 350px para evitar erro de dimensão -1 */}
      <div style={{ width: '100%', height: 350, minHeight: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                itemStyle={{ color: '#1e293b' }}
            />
            <Legend />
            {baselineData.length > 0 && (
                <ReferenceLine x={`B${baselineData.length}`} stroke="red" strokeDasharray="3 3" label={t.phases.intervention} />
            )}
            <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }} 
            />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
