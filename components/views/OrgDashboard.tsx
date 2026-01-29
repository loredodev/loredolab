
import React, { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Download, ShieldCheck, Search, Filter, Calendar, MoreHorizontal, Plus, Mail, AlertCircle, BarChart2 } from 'lucide-react';
import { Organization, TeamInsight, Language } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { CONTENT } from '../../constants';

// --- Types for Local Table ---
interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'invited' | 'offline';
  lastActive: string;
  focusScore: number | null; // Null means no data yet
  avatarInitials: string;
}

// --- Mock Data Generators (Reset to Day 1 State) ---
const getMockOrg = (lang: Language): Organization => ({
  id: 'org-1',
  name: lang === 'pt' ? 'Sua Organização' : 'Your Organization',
  plan: 'FREE', // Start on Free/Trial
  members: 1 // Just the current user
});

const getMockMembers = (lang: Language): TeamMember[] => {
    // Return only the current user (Manager)
    return [
        { 
            id: '1', 
            name: lang === 'pt' ? 'Você (Gestor)' : 'You (Manager)', 
            role: 'Team Lead', 
            department: 'Management', 
            status: 'active', 
            lastActive: lang === 'pt' ? 'Agora' : 'Now', 
            focusScore: null, 
            avatarInitials: 'ME' 
        }
    ];
};

// Empty insights for new account
const getMockInsights = (lang: Language): TeamInsight[] => {
  return []; 
};

// Empty chart data
const getMockTeamData = (lang: Language) => {
    return [
        { name: lang === 'pt' ? 'Engenharia' : 'Eng', score: 0, color: '#e2e8f0' },
        { name: lang === 'pt' ? 'Design' : 'Design', score: 0, color: '#e2e8f0' },
        { name: lang === 'pt' ? 'Produto' : 'Product', score: 0, color: '#e2e8f0' },
        { name: lang === 'pt' ? 'Vendas' : 'Sales', score: 0, color: '#e2e8f0' },
    ];
}

interface OrgDashboardProps {
  lang: Language;
}

export const OrgDashboard: React.FC<OrgDashboardProps> = ({ lang }) => {
  const t = CONTENT[lang].org;
  const mockOrg = getMockOrg(lang);
  const mockInsights = getMockInsights(lang);
  const mockTeamData = getMockTeamData(lang);
  const [members, setMembers] = useState(getMockMembers(lang));
  
  const [dateRange, setDateRange] = useState(lang === 'pt' ? 'Últimos 30 Dias' : 'Last 30 Days');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleExport = () => {
      alert(lang === 'pt' ? 'Não há dados suficientes para gerar relatório.' : 'Not enough data to generate report.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lab-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-lab-500 mb-2">
            <Building2Icon className="w-5 h-5" />
            <span className="uppercase text-xs font-bold tracking-wider text-lab-400">{lang === 'pt' ? 'Painel Corporativo' : 'Enterprise Dashboard'}</span>
          </div>
          <h1 className="text-3xl font-bold text-lab-900">{mockOrg.name}</h1>
          <p className="text-lab-500 text-sm mt-1">
             {lang === 'pt' ? 'Gerencie a saúde produtiva da sua equipe.' : 'Manage your team\'s productive health.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <button className="flex items-center space-x-2 bg-white border border-lab-300 text-lab-700 px-4 py-2.5 rounded-lg hover:bg-lab-50 text-sm font-medium shadow-sm transition-all">
                    <Calendar className="w-4 h-4 text-lab-500" />
                    <span>{dateRange}</span>
                </button>
            </div>
            <button 
                onClick={handleExport}
                className="flex items-center space-x-2 bg-white border border-lab-300 text-lab-700 px-4 py-2.5 rounded-lg hover:bg-lab-50 shadow-sm transition-all text-sm font-bold opacity-50 cursor-not-allowed"
                title={lang === 'pt' ? "Necessário coletar dados primeiro" : "Need data collection first"}
            >
                <Download className="w-4 h-4" />
                <span>{t.export}</span>
            </button>
        </div>
      </header>

      {/* KPI Cards Row - ZERO STATE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
            title={t.activeMembers} 
            value={members.length.toString()} 
            trend="0" 
            trendLabel={lang === 'pt' ? 'sem alterações' : 'no change'}
            positive={true}
        />
        <KPICard 
            title={t.protocolsCompleted} 
            value="0" 
            trend="-" 
            trendLabel={lang === 'pt' ? 'aguardando dados' : 'waiting for data'}
            positive={true}
            colorClass="text-lab-400"
        />
        <KPICard 
            title={t.healthScore} 
            value="-" 
            suffix="/10"
            trend="-" 
            trendLabel={lang === 'pt' ? 'cálculo pendente' : 'pending calc'}
            positive={true}
            colorClass="text-lab-400"
        />
         <KPICard 
            title={lang === 'pt' ? 'Risco de Burnout' : 'Burnout Risk'} 
            value="-" 
            trend="-" 
            trendLabel={lang === 'pt' ? 'dados insuficientes' : 'insufficient data'}
            positive={true}
            colorClass="text-lab-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart - ZERO STATE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-lab-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="font-bold text-lab-900 text-lg">{t.teamChart}</h3>
                <p className="text-xs text-lab-500">{lang === 'pt' ? 'Média de foco reportada por departamento.' : 'Self-reported focus average by department.'}</p>
             </div>
             <button className="text-lab-400 hover:bg-lab-50 p-2 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
             </button>
          </div>
          
          <div className="h-64 w-full flex items-center justify-center bg-lab-50 rounded-lg border border-dashed border-lab-200 relative overflow-hidden">
             {/* Ghost Chart for visual cue */}
             <div className="absolute inset-0 opacity-20 pointer-events-none grayscale">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockTeamData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#cbd5e1" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
             
             <div className="relative z-10 text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-lab-100">
                <BarChart2 className="w-8 h-8 text-lab-400 mx-auto mb-2" />
                <h4 className="font-bold text-lab-800">{lang === 'pt' ? 'Nenhum dado de equipe' : 'No Team Data'}</h4>
                <p className="text-xs text-lab-500 mb-4">{lang === 'pt' ? 'Convide membros para começar a coletar métricas.' : 'Invite members to start collecting metrics.'}</p>
                <button 
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-700 transition"
                >
                    {lang === 'pt' ? 'Convidar Equipe' : 'Invite Team'}
                </button>
             </div>
          </div>
        </div>

        {/* Insights Column - ZERO STATE */}
        <div className="bg-white p-6 rounded-xl border border-lab-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lab-900 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lab-400" />
            {t.insights}
          </h3>
          <p className="text-xs text-lab-500 mb-6">{lang === 'pt' ? 'Gerado por Gemini AI com dados anonimizados.' : 'Generated by Gemini AI using anonymized logs.'}</p>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-lab-50 rounded-xl border border-lab-100 border-dashed h-full min-h-[200px]">
             <AlertCircle className="w-8 h-8 text-lab-300 mb-2" />
             <p className="text-sm font-bold text-lab-600">{lang === 'pt' ? 'Aguardando Dados' : 'Waiting for Data'}</p>
             <p className="text-xs text-lab-400 mt-1 max-w-[200px]">
                {lang === 'pt' 
                    ? 'Os insights aparecerão aqui após sua equipe completar os primeiros protocolos.' 
                    : 'Insights will appear here after your team completes their first protocols.'}
             </p>
          </div>
          
          {/* Button disabled/hidden in empty state */}
          <div className="mt-4 text-center">
             <span className="text-xs text-lab-300 select-none">
                {lang === 'pt' ? 'Relatório indisponível' : 'Report unavailable'}
             </span>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-lab-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-lab-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                  <h3 className="font-bold text-lg text-lab-900">{lang === 'pt' ? 'Membros da Equipe' : 'Team Members'}</h3>
                  <p className="text-sm text-lab-500">{lang === 'pt' ? 'Gerencie acesso e visualize performance individual.' : 'Manage access and view individual performance.'}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-2 bg-lab-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-lab-800 transition shadow-sm"
                  >
                      <Plus className="w-4 h-4" />
                      {lang === 'pt' ? 'Convidar Novo' : 'Invite New'}
                  </button>
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lab-400" />
                      <input 
                        type="text" 
                        placeholder={lang === 'pt' ? "Buscar..." : "Search..."}
                        className="pl-9 pr-4 py-2 border border-lab-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-40 md:w-auto"
                      />
                  </div>
              </div>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-lab-50 text-lab-500 font-bold uppercase text-xs">
                      <tr>
                          <th className="px-6 py-4">{lang === 'pt' ? 'Nome' : 'Name'}</th>
                          <th className="px-6 py-4">{lang === 'pt' ? 'Cargo' : 'Role'}</th>
                          <th className="px-6 py-4">{lang === 'pt' ? 'Status' : 'Status'}</th>
                          <th className="px-6 py-4 text-right">{lang === 'pt' ? 'Score Foco' : 'Focus Score'}</th>
                          <th className="px-6 py-4 text-right">{lang === 'pt' ? 'Última Atividade' : 'Last Active'}</th>
                          <th className="px-6 py-4"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-100">
                      {members.map(member => (
                          <tr key={member.id} className="hover:bg-lab-50/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs border border-primary-200">
                                          {member.avatarInitials}
                                      </div>
                                      <div>
                                          <div className="font-bold text-lab-900">{member.name}</div>
                                          {/* Use current user email or generic */}
                                          <div className="text-xs text-lab-500">manager@company.com</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="text-lab-900 font-medium">{member.role}</div>
                                  <div className="text-xs text-lab-500">{member.department}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${member.status === 'active' ? 'bg-green-100 text-green-800' : 
                                      member.status === 'invited' ? 'bg-blue-100 text-blue-800' : 'bg-lab-100 text-lab-800'}
                                  `}>
                                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                          member.status === 'active' ? 'bg-green-500' : 
                                          member.status === 'invited' ? 'bg-blue-500' : 'bg-lab-500'
                                      }`}></span>
                                      {member.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  {member.focusScore !== null ? (
                                    <>
                                        <div className="font-bold text-lab-900">{member.focusScore}</div>
                                        <div className="w-16 h-1.5 bg-lab-100 rounded-full ml-auto mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${member.focusScore >= 8 ? 'bg-green-500' : member.focusScore >= 6 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                style={{width: `${member.focusScore * 10}%`}}
                                            />
                                        </div>
                                    </>
                                  ) : (
                                    <span className="text-xs text-lab-400 italic">--</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right text-lab-500 font-mono text-xs">
                                  {member.lastActive}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-lab-400 hover:text-primary-600 transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          {members.length > 5 && (
            <div className="p-4 border-t border-lab-200 bg-lab-50 text-center">
                <button className="text-sm font-bold text-lab-600 hover:text-lab-900">
                    {lang === 'pt' ? 'Ver Todos os Membros' : 'View All Members'}
                </button>
            </div>
          )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
        <Users className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
           <h4 className="font-bold text-blue-900 text-sm">{t.privacyNote}</h4>
           <p className="text-xs text-blue-700 mt-1">
             {t.privacyDesc}
           </p>
        </div>
      </div>

      {/* Invitation Modal Mockup */}
      {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold text-lab-900 mb-4">{lang === 'pt' ? 'Convidar Membro' : 'Invite Member'}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-lab-500 uppercase mb-1">Email</label>
                          <div className="relative">
                              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-lab-400" />
                              <input type="email" className="w-full pl-9 p-2 border border-lab-300 rounded-lg text-sm" placeholder="colleague@company.com" />
                          </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => {
                                alert(lang === 'pt' ? 'Convite enviado!' : 'Invitation sent!');
                                setIsInviteOpen(false);
                            }}
                            className="flex-1 bg-lab-900 text-white py-2 rounded-lg font-bold hover:bg-lab-800"
                          >
                              {lang === 'pt' ? 'Enviar Convite' : 'Send Invite'}
                          </button>
                          <button 
                            onClick={() => setIsInviteOpen(false)}
                            className="px-4 py-2 border border-lab-300 rounded-lg font-bold text-lab-600 hover:bg-lab-50"
                          >
                              {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Sub-component for KPI Cards to keep main file cleaner
const KPICard = ({ title, value, trend, trendLabel, positive, suffix, colorClass }: any) => (
    <div className="bg-white p-6 rounded-xl border border-lab-200 shadow-sm">
        <div className="text-xs font-bold text-lab-500 uppercase tracking-wider mb-2">{title}</div>
        <div className="flex justify-between items-end">
            <div className={`text-3xl font-bold ${colorClass || 'text-lab-900'}`}>
                {value}<span className="text-lg text-lab-400 font-medium">{suffix}</span>
            </div>
            {trend !== '-' && (
                <div className={`text-xs font-bold px-2 py-1 rounded flex items-center ${trend === '0' ? 'bg-lab-100 text-lab-600' : (positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}`}>
                    {trend !== '0' && (positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />)}
                    {trend === '0' ? '-' : trend}
                </div>
            )}
        </div>
        <div className="text-[10px] text-lab-400 mt-2 text-right">{trendLabel}</div>
    </div>
);

const Building2Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);
