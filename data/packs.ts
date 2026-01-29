
import { ProtocolPack, Language } from '../types';

const PACKS_EN: ProtocolPack[] = [
  {
    id: 'starter',
    title: 'Starter Pack',
    description: 'High impact, low effort protocols to get started.',
    iconName: 'Zap',
    colorClass: 'bg-amber-100 text-amber-700',
    protocolIds: [
      'pomodoro-classic',
      'pomodoro-science',
      'ultradian',
      'nsdr',
      'physiological-sigh',
      'morning-sunlight',
      'caffeine-cutoff',
      'hydration-morning',
      'daily-priorities'
    ]
  },
  {
    id: 'sleep',
    title: 'Sleep Optimization',
    description: 'Protocols based on CBT-I and sleep hygiene.',
    iconName: 'Moon',
    colorClass: 'bg-indigo-100 text-indigo-700',
    protocolIds: [
      'blue-block',
      'sleep-schedule',
      'sleep-temp',
      'nsdr',
      'warm-bath',
      'dim-lights',
      'pre-sleep-routine'
    ]
  },
  {
    id: 'habits',
    title: 'Habit Formation',
    description: 'Behavioral science to build lasting routines.',
    iconName: 'CheckSquare',
    colorClass: 'bg-emerald-100 text-emerald-700',
    protocolIds: [
      'habit-stacking',
      'two-minute-rule',
      'implementation-intentions',
      'dont-break-chain',
      'environment-design'
    ]
  },
  {
    id: 'stress',
    title: 'Stress & Anxiety',
    description: 'Tools for autonomic and mental regulation.',
    iconName: 'Activity',
    colorClass: 'bg-rose-100 text-rose-700',
    protocolIds: [
      'physiological-sigh',
      'box-breathing',
      'journaling',
      'pmr',
      'grounding',
      'nature-break'
    ]
  },
  {
    id: 'focus',
    title: 'Deep Focus',
    description: 'Maximize productivity and reduce distractions.',
    iconName: 'Crosshair',
    colorClass: 'bg-blue-100 text-blue-700',
    protocolIds: [
      'pomodoro-classic',
      'ultradian',
      'no-notifications',
      'single-tab',
      'airplane-mode',
      'first-block',
      'phone-gray'
    ]
  },
  {
    id: 'recovery',
    title: 'Active Recovery',
    description: 'Protocols to restore energy without sleeping.',
    iconName: 'BatteryCharging',
    colorClass: 'bg-teal-100 text-teal-700',
    protocolIds: [
      'nsdr',
      'power-nap',
      'active-breaks',
      'silent-walk',
      'digital-detox'
    ]
  },
  {
    id: 'planning',
    title: 'Planning & Strategy',
    description: 'Organization and goal setting.',
    iconName: 'Map',
    colorClass: 'bg-purple-100 text-purple-700',
    protocolIds: [
      'weekly-planning',
      'daily-priorities',
      'eat-frog',
      'timeboxing',
      'rule-1-3-5',
      'async-standup'
    ]
  }
];

const PACKS_PT: ProtocolPack[] = [
  {
    id: 'starter',
    title: 'Pack Iniciante',
    description: 'Protocolos de alto impacto e baixo esforço para começar.',
    iconName: 'Zap',
    colorClass: 'bg-amber-100 text-amber-700',
    protocolIds: [
      '001-pomodoro-classic',
      '002-pomodoro-science',
      '003-ultradian',
      '016', // NSDR
      '017', // Suspiro
      '013', // Luz Natural
      '014', // Cafeina
      '024', // Hidratacao
      '009'  // Prioridades
    ]
  },
  {
    id: 'sleep',
    title: 'Otimização do Sono',
    description: 'Protocolos baseados em CBT-I e higiene do sono.',
    iconName: 'Moon',
    colorClass: 'bg-indigo-100 text-indigo-700',
    protocolIds: [
      '011', // Telas Off (Blue block)
      '012', // Horario Fixo
      '015', // Quarto Fresco
      '016', // NSDR
      'p-magnesium' // This might still be missing if not mapped in ADDITIONAL_CORE, but strictly mapped items will show.
    ]
  },
  {
    id: 'habits',
    title: 'Formação de Hábitos',
    description: 'Ciência comportamental para criar rotinas duradouras.',
    iconName: 'CheckSquare',
    colorClass: 'bg-emerald-100 text-emerald-700',
    protocolIds: [
      'ii', // Intencoes de implementacao (Generated ID base)
      '008', // Regra 2 min
      '023', // Journaling (5 min)
      '007', // Ritual inicio
      'social' // Accountability (Generated ID base)
    ]
  },
  {
    id: 'stress',
    title: 'Stress e Ansiedade',
    description: 'Ferramentas de regulação autonômica e mental.',
    iconName: 'Activity',
    colorClass: 'bg-rose-100 text-rose-700',
    protocolIds: [
      '017', // Suspiro
      '028', // Binaural (Relax/Focus)
      '010', // Encerramento/Gratitude concept
      'pmr', // Progressive Muscle (Generated)
      'cbt-cog' // Reappraisal (Generated)
    ]
  },
  {
    id: 'focus',
    title: 'Foco Profundo',
    description: 'Maximizar produtividade e reduzir distrações.',
    iconName: 'Crosshair',
    colorClass: 'bg-blue-100 text-blue-700',
    protocolIds: [
      '001-pomodoro-classic',
      '003-ultradian',
      '005', // Sem notificacoes
      '006', // Uma aba
      '020', // Bloqueio Apps
      '028'  // Binaural
    ]
  },
  {
    id: 'recovery',
    title: 'Recuperação Ativa',
    description: 'Protocolos para restaurar energia sem dormir.',
    iconName: 'BatteryCharging',
    colorClass: 'bg-teal-100 text-teal-700',
    protocolIds: [
      '016', // NSDR
      '026', // Pausa longa
      '025', // Alongamento
      '018'  // Caminhada
    ]
  },
  {
    id: 'planning',
    title: 'Planejamento e Estratégia',
    description: 'Organização e definição de metas.',
    iconName: 'Map',
    colorClass: 'bg-purple-100 text-purple-700',
    protocolIds: [
      '022', // Revisao Semanal
      '009', // Prioridades
      '021', // Lista Anti-Overload
      'goals' // Metas (Generated)
    ]
  }
];

export const getProtocolPacks = (lang: Language): ProtocolPack[] => {
  return lang === 'pt' ? PACKS_PT : PACKS_EN;
};
