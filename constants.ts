
import { Protocol, EvidenceLevel, Language, ExperimentStatus, PlanConfig, PlanTier } from './types';
import { PROTOCOLS_BY_LANG } from './data/protocols';

// --- Billing Configuration ---
// IMPORTANTE: Você deve substituir os 'priceId' abaixo pelos IDs reais do seu Painel do Stripe.
// 1. Crie uma conta no Stripe (stripe.com).
// 2. Crie dois produtos: "Plano Lab Director" e "Plano Chief Scientist".
// 3. Copie o "API ID" do preço (começa com price_... ou prod_...) e cole abaixo.

export const PLAN_LIMITS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Scientist', 
    priceMonthly: 0,
    entitlements: {
      maxActiveExperiments: 1,
      maxMembers: 1,
      canUploadCsv: false,
      canExportReports: false,
      aiModelVersion: 'gemini-flash',
      supportLevel: 'community',
      advancedAnalytics: false
    },
    features: []
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Lab Director',
    priceMonthly: 29.90, // Ajuste para o valor real que você criar no Stripe
    priceId: 'price_1SuQHqREbvolxYWvfh7wl5Qp', 
    entitlements: {
      maxActiveExperiments: 3,
      maxMembers: 1,
      canUploadCsv: true,
      canExportReports: true,
      aiModelVersion: 'gemini-flash',
      supportLevel: 'email',
      advancedAnalytics: true
    },
    features: [],
    highlight: true
  },
  SUPER_PREMIUM: {
    id: 'SUPER_PREMIUM',
    name: 'Chief Scientist',
    priceMonthly: 59.90, // Ajuste para o valor real
    priceId: 'price_1SuQHqREbvolxYWvfh7wl5Qp',
    entitlements: {
      maxActiveExperiments: 999,
      maxMembers: 5,
      canUploadCsv: true,
      canExportReports: true,
      aiModelVersion: 'gemini-pro',
      supportLevel: 'dedicated',
      advancedAnalytics: true
    },
    features: []
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Global Corp',
    priceMonthly: 0, 
    entitlements: {
      maxActiveExperiments: 999,
      maxMembers: 9999,
      canUploadCsv: true,
      canExportReports: true,
      aiModelVersion: 'gemini-pro',
      supportLevel: 'dedicated',
      advancedAnalytics: true
    },
    features: []
  }
};

export const CONTENT = {
  en: {
    common: { days: "Days", back: "Back", start: "Start Experiment", loading: "Loading...", of: "of" },
    nav: { dashboard: "Dashboard", protocols: "Library", active: "Active Exp.", reports: "Reports", analytics: "Analytics & AI", community: "Community", knowledge: "Knowledge", mind: "Mind Lab", hydration: "Hydration", organization: "Organization", settings: "Settings", currentUser: "Current User", role: "Scientist Alpha", tier: "Free Tier" },
    settings: {
        title: "Account Settings",
        logout: "Log out",
        tabs: { profile: "Profile", billing: "Plans & Billing" },
        profile: { header: "Personal Information", name: "Full Name", email: "Email Address", role: "Role", joined: "Joined on", avatar: "Profile Photo", changePhoto: "Change Photo", save: "Save Changes", saved: "Saved!", integrations: "Integrations", integrationsDesc: "Connect external tools.", privacy: "Privacy", backup: "Backup", backupDesc: "Download your data.", delete: "Delete Account", deleteDesc: "Remove data.", deleteConfirm: "Are you sure?", uploading: "Uploading..." },
        billing: { header: "Subscription", currentPlan: "Current Plan", cycle: "/month", manageStripe: "Manage Billing", upgrade: "Upgrade", downgrade: "Change", current: "Current", popular: "Most Popular", unlimited: "Unlimited", features: "Included:", plans: { FREE: { name: "Scientist", features: ["1 Active Exp", "Manual Log"] }, PREMIUM: { name: "Lab Director", features: ["3 Active Exp", "CSV Upload"] }, SUPER_PREMIUM: { name: "Chief Scientist", features: ["Unlimited", "Gemini Pro"] } } },
        integrations: {
            apple: { title: "Apple Health / Google Fit", desc: "Sync biometric data." },
            calendar: { title: "Google Calendar", desc: "Sync protocol blocks." }
        }
    },
    knowledge: { title: "Knowledge Base", subtitle: "Essential reading.", read: "Read", unread: "Unread", reading: "Reading", markRead: "Mark as Read", markUnread: "Mark as Unread", startReading: "Start Reading", updateProgress: "Update Progress", addBook: "Add External Book", myLibrary: "My Library", achievements: "Achievements", goal: "Yearly Goal", booksRead: "Books Read", searchPlaceholder: "Search...", filterCategory: "Filter", addModal: { title: "Add New Book", name: "Title", author: "Author", category: "Category", cover: "URL", add: "Add Book", cancel: "Cancel" } },
    hydration: { title: "Hydration Tracker", subtitle: "Stay hydrated.", goal: "Goal", current: "Current", add250: "+ 250ml", add500: "+ 500ml", history: "History", streak: "Streak" },
    mind: { 
        title: "Mind Lab", 
        subtitle: "Generative audio architecture for deep focus, sleep, and neural reprogramming.", 
        affirmations: "Daily Affirmations", 
        audio: "Psychoacoustic Tools", 
        play: "Play", 
        pause: "Pause",
        engine: "NeuroSonic Engine™",
        categories: { guided: "NSDR / Hypnosis", solfeggio: "Solfeggio", brainwaves: "Binaural Beats", noise: "Colored Noise" },
        generating: "Generating...",
        immersive: "IMMERSIVE",
        howTo: {
            title: "How and Why to Use?",
            consistencyTitle: "Consistency is Key",
            consistencyDesc: "The brain needs repeated exposure to 'entrain' brainwaves. Use daily for at least 15 minutes.",
            headphonesTitle: "Stereo Headphones",
            headphonesDesc: "Essential for 'Binaural' tracks to create the ghost frequency inside the brain.",
            safetyTitle: "Safety & Timing",
            safetyDesc: "Do not use NSDR or Delta/Theta frequencies while driving."
        },
        guide: {
            title: "Frequency Quick Guide",
            gamma: "Extreme Focus & Problem Solving",
            beta: "Active Work & Reading",
            alpha: "Relaxed Flow & Learning",
            theta: "Deep Meditation & Creativity",
            delta: "Deep Sleep & Physical Healing",
            quote: "Everything is energy and that’s all there is to it. Match the frequency of the reality you want and you cannot help but get that reality."
        },
        player: { breathe: "Breathe... Relax... Listen." }
    },
    gamification: {
        title: "Community & Challenges",
        subtitle: "Gamify your evolution and connect with others.",
        tabs: { challenges: "Challenges", leaderboard: "Ranking", feed: "Feed" },
        filters: { all: "All" },
        cards: {
            participants: "participants",
            progress: "Progress",
            continue: "Continue",
            leave: "Leave Challenge",
            join: "Join Challenge",
            empty: "No challenges found in this category."
        },
        leaderboard: {
            title: "Global Leaderboard",
            updated: "Updated today",
            rank: "Senior Scientist"
        },
        feed: {
            placeholder: "Share a win or tip...",
            post: "Post",
            empty: "Be the first to post!",
            comments: "No comments yet.",
            writeComment: "Write a comment..."
        }
    },
    analytics: {
        title: "Advanced Analytics & AI",
        subtitle: "Correlations between metrics, mood, and performance.",
        checkin: {
            title: "Daily Check-in",
            desc: "How are you feeling? AI uses this to calibrate suggestions.",
            options: { tired: "😫 Tired", neutral: "😐 Neutral", good: "🙂 Good", fire: "🔥 On Fire" }
        },
        charts: {
            correlation: "Correlation: Focus vs Mood",
            empty: "Start an experiment to see real data."
        },
        insight: {
            title: "AI Insight",
            waiting: "Waiting for enough data to generate correlations."
        }
    },
    auth: { loginTitle: "Productivity Lab", loginSubtitle: "Scientific method of work.", emailLabel: "Email", emailPlaceholder: "scientist@lab.com", continue: "Continue", terms: "By continuing...", errorRequired: "Email required.", errorInvalid: "Invalid email.", onboarding: { title1: "Your Name?", placeholder1: "Dr. Freeman", next: "Next", title2: "Usage?", scientistTitle: "Individual", scientistDesc: "Personal experiments.", managerTitle: "Manager", managerDesc: "Team focus.", complete: "Finish" } },
    evidenceLevels: { GOLD: 'Gold Standard', SILVER: 'Observational', BRONZE: 'Anecdotal' },
    status: { [ExperimentStatus.SETUP]: 'Setup', [ExperimentStatus.BASELINE]: 'Baseline', [ExperimentStatus.INTERVENTION]: 'Intervention', [ExperimentStatus.COMPLETED]: 'Completed', [ExperimentStatus.ARCHIVED]: 'Archived' },
    dashboard: { title: "Dashboard", welcome: "Welcome", ready: "Ready?", currentExp: "Current Exp", openDash: "Open Dash", protocol: "Protocol", status: "Status", dataPoints: "Data", activeProtocol: "Active", phase: "Phase", none: "None", select: "Select a protocol", logsCollected: "Logs", systemStatus: "System", operational: "Operational", trajectory: "Trajectory", noData: "No data.", timeline: "Timeline", importCsv: "Import CSV", upgradeToPro: "Upgrade" },
    library: { title: "Library", subtitle: "Methods.", startConfirm: "Start", viewDetails: "Details", browse: "Browse", createCustom: "Custom", searchPlaceholder: "Search...", filters: "Filters", noProtocols: "None", tryAdjusting: "Try again.", packs: { focus: "Focus", sleep: "Sleep", habits: "Habits", stress: "Stress", days: "days" } },
    protocolDetail: { mechanism: "Mechanism", metrics: "Metrics", contraindications: "Contraindications", evidenceLevel: "Evidence", citations: "Citations", tabs: { overview: "Overview", steps: "Steps", evidence: "Evidence" }, required: "Required", start: "Start", evidenceDescriptions: { GOLD: "Strong evidence.", SILVER: "Moderate.", BRONZE: "Anecdotal." } },
    active: { day: "Day", phase1: "Baseline", phase2: "Intervention", importCsv: "Import", finish: "Finish", trajectory: "Trajectory", recentLogs: "Recent", noLogs: "None", todaysLog: "Today", score: "Score", baseline: "Baseline", intervention: "Intervention", poor: "Poor", excellent: "Excellent", contextPlaceholder: "Notes", logEntry: "Log", tipTitle: "Tip", tipBaseline: "Be honest.", tipIntervention: "Consistency.", noActive: "No Active Experiment", goToLib: "Visit Library" },
    reports: { title: "Reports", finalReport: "Final", finalized: "FINALIZED", headline: "Headline", statSummary: "Stats", visualData: "Visuals", observations: "AI Obs", recommendations: "Recs", limitations: "Notes", generated: "On", completed: "DONE", visualization: "Visual", aiAnalysis: "AI", analyzing: "Analyzing...", failed: "Failed.", details: "Details", duration: "Time", evidence: "Evidence", noReports: "None", completeToGen: "Finish exp.", backToDash: "Back" },
    org: { title: "Organization", export: "Export", activeMembers: "Members", protocolsCompleted: "Done", healthScore: "Health", teamChart: "Team Chart", insights: "Insights", privacyNote: "Privacy", privacyDesc: "Data is anonymous." },
    phases: { baseline: "Baseline", intervention: "Intervention" },
    csv: { title: "Upload CSV", dragDrop: "Drop here", supported: "Columns needed.", importAs: "As:", importButton: "Import", cancel: "Cancel", success: "Imported.", error: "Error.", columns: "Columns:", preview: "Preview:" }
  },
  pt: {
    common: { days: "Dias", back: "Voltar", start: "Iniciar", loading: "Carregando...", of: "de" },
    nav: { dashboard: "Painel", protocols: "Biblioteca", active: "Exp. Ativo", reports: "Relatórios", analytics: "Análise & IA", community: "Comunidade", knowledge: "Sabedoria", mind: "Laboratório Mental", hydration: "Hidratação", organization: "Organização", settings: "Configurações" },
    settings: {
        title: "Configurações",
        logout: "Sair da Conta",
        tabs: { profile: "Meu Perfil", billing: "Planos e Assinatura" },
        profile: { header: "Informações Pessoais", name: "Nome Completo", email: "E-mail", role: "Cargo", joined: "Membro desde", avatar: "Foto de Perfil", changePhoto: "Alterar", save: "Salvar Alterações", saved: "Salvo!", integrations: "Integrações", integrationsDesc: "Conecte ferramentas externas.", privacy: "Privacidade e Dados", backup: "Backup", backupDesc: "Baixe seus dados.", delete: "Excluir Conta", deleteDesc: "Remover dados permanentemente.", deleteConfirm: "Tem certeza?", uploading: "Enviando..." },
        billing: { header: "Assinatura", currentPlan: "Plano Atual", cycle: "/mês", manageStripe: "Gerenciar Pagamentos", upgrade: "Fazer Upgrade", downgrade: "Mudar Plano", current: "Plano Atual", popular: "Mais Popular", unlimited: "Ilimitado", features: "Vantagens:", plans: { FREE: { name: "Cientista (Grátis)", features: ["1 Experimento Ativo", "Registro Manual"] }, PREMIUM: { name: "Diretor de Lab", features: ["3 Experimentos Ativos", "Upload de CSV"] }, SUPER_PREMIUM: { name: "Cientista Chefe", features: ["Experimentos Ilimitados", "IA Pro (Gemini)"] } } },
        integrations: {
            apple: { title: "Apple Health / Google Fit", desc: "Sincronize passos e sono." },
            calendar: { title: "Google Calendar", desc: "Sincronize blocos de rotina." }
        }
    },
    knowledge: { title: "Sabedoria", subtitle: "Leituras essenciais.", read: "Lido", unread: "Não Lido", reading: "Lendo", markRead: "Concluir", markUnread: "Não Lido", startReading: "Começar", updateProgress: "Atualizar", addBook: "Novo Livro", myLibrary: "Minha Estante", achievements: "Conquistas", goal: "Meta Anual", booksRead: "Lidos", searchPlaceholder: "Buscar livro...", filterCategory: "Filtrar", addModal: { title: "Adicionar", name: "Título", author: "Autor", category: "Categoria", cover: "URL", add: "Salvar", cancel: "Cancelar" } },
    hydration: { title: "Hidratação", subtitle: "Mantenha o foco.", goal: "Meta", current: "Atual", add250: "+ 250ml", add500: "+ 500ml", history: "Histórico", streak: "Sequência" },
    mind: { 
        title: "Laboratório Mental", 
        subtitle: "Arquitetura de áudio generativa para foco profundo, sono e reprogramação neural.", 
        affirmations: "Afirmações Diárias", 
        audio: "Ferramentas Sonoras", 
        play: "Tocar", 
        pause: "Pausar",
        engine: "NeuroSonic Engine™",
        categories: { guided: "NSDR / Hipnose", solfeggio: "Solfeggio", brainwaves: "Ondas Binaurais", noise: "Ruído Colorido" },
        generating: "Gerando...",
        immersive: "IMERSIVO",
        howTo: {
            title: "Como e Por Que Usar?",
            consistencyTitle: "Consistência é Chave",
            consistencyDesc: "O cérebro precisa de exposição repetida para 'arrastar' (entrainment) as ondas cerebrais. Use diariamente por pelo menos 15 minutos.",
            headphonesTitle: "Fones de Ouvido Estéreo",
            headphonesDesc: "Essencial para faixas 'Binaurais'. O motor gera tons diferentes para cada ouvido, criando uma frequência fantasma.",
            safetyTitle: "Segurança e Timing",
            safetyDesc: "Não use NSDR ou frequências Delta/Theta ao dirigir."
        },
        guide: {
            title: "Guia Rápido de Frequências",
            gamma: "Foco Extremo & Resolução de Problemas",
            beta: "Trabalho Ativo & Leitura",
            alpha: "Flow Relaxado & Aprendizado",
            theta: "Meditação Profunda & Criatividade",
            delta: "Sono Profundo & Cura Física",
            quote: "Tudo é energia e isso é tudo o que há. Sintonize a frequência que você deseja e inevitavelmente essa será a sua realidade."
        },
        player: { breathe: "Respire... Relaxe... Escute." }
    },
    gamification: {
        title: "Comunidade & Desafios",
        subtitle: "Gamifique sua evolução e conecte-se.",
        tabs: { challenges: "Desafios", leaderboard: "Ranking", feed: "Feed" },
        filters: { all: "Todos" },
        cards: {
            participants: "participantes",
            progress: "Progresso",
            continue: "Continuar",
            leave: "Abandonar",
            join: "Aceitar Desafio",
            empty: "Nenhum desafio encontrado nesta categoria."
        },
        leaderboard: {
            title: "Ranking Global",
            updated: "Atualizado hoje",
            rank: "Cientista Sênior"
        },
        feed: {
            placeholder: "Compartilhe uma conquista ou dica...",
            post: "Postar",
            empty: "Seja o primeiro a postar!",
            comments: "Nenhum comentário ainda.",
            writeComment: "Escreva um comentário..."
        }
    },
    analytics: {
        title: "Análise Avançada & IA",
        subtitle: "Correlações entre métricas, humor e performance.",
        checkin: {
            title: "Check-in Diário",
            desc: "Como você se sente hoje? A IA usa isso para calibrar sugestões.",
            options: { tired: "😫 Cansado", neutral: "😐 Neutro", good: "🙂 Bem", fire: "🔥 Voando" }
        },
        charts: {
            correlation: "Correlação: Foco vs Humor",
            empty: "Inicie um experimento para ver dados reais."
        },
        insight: {
            title: "Insight da IA",
            waiting: "Aguardando dados suficientes para gerar correlações."
        }
    },
    auth: { loginTitle: "Productivity Lab", loginSubtitle: "Ciência aplicada ao trabalho.", emailLabel: "Email", emailPlaceholder: "cientista@lab.com", continue: "Continuar", terms: "Ao continuar...", errorRequired: "Email obrigatório.", errorInvalid: "Email inválido.", onboarding: { title1: "Seu Nome?", placeholder1: "Dr. Freeman", next: "Próximo", title2: "Uso?", scientistTitle: "Individual", scientistDesc: "Experimentos pessoais.", managerTitle: "Gestor", managerDesc: "Foco no time.", complete: "Concluir" } },
    evidenceLevels: { GOLD: 'Padrão Ouro', SILVER: 'Observacional', BRONZE: 'Anecdótico' },
    status: { [ExperimentStatus.SETUP]: 'Configuração', [ExperimentStatus.BASELINE]: 'Baseline', [ExperimentStatus.INTERVENTION]: 'Intervenção', [ExperimentStatus.COMPLETED]: 'Concluído', [ExperimentStatus.ARCHIVED]: 'Arquivado' },
    dashboard: { title: "Painel", welcome: "Olá", ready: "Pronto?", currentExp: "Exp Atual", openDash: "Abrir", protocol: "Protocolo", status: "Status", dataPoints: "Dados", activeProtocol: "Ativo", phase: "Fase", none: "Nenhum", select: "Selecione", logsCollected: "Logs", systemStatus: "Sistema", operational: "Ok", trajectory: "Trajetória", noData: "Sem dados.", timeline: "Histórico", importCsv: "Importar CSV", upgradeToPro: "Upgrade" },
    library: { title: "Biblioteca", subtitle: "Métodos.", startConfirm: "Iniciar", viewDetails: "Detalhes", browse: "Navegar", createCustom: "Novo", searchPlaceholder: "Buscar...", filters: "Filtros", noProtocols: "Nenhum", tryAdjusting: "Mude filtros.", packs: { focus: "Foco", sleep: "Sono", habits: "Hábitos", stress: "Stress", days: "dias" } },
    protocolDetail: { mechanism: "Mecanismo", metrics: "Métricas", contraindications: "Contraindicações", evidenceLevel: "Evidência", citations: "Citações", tabs: { overview: "Visão Geral", steps: "Passos", evidence: "Evidência" }, required: "Obrigatório", start: "Iniciar", evidenceDescriptions: { GOLD: "Evidência forte.", SILVER: "Moderada.", BRONZE: "Anecdótica." } },
    active: { day: "Dia", phase1: "Baseline", phase2: "Intervenção", importCsv: "Importar", finish: "Concluir", trajectory: "Desempenho", recentLogs: "Recentes", noLogs: "Nenhum", todaysLog: "Hoje", score: "Nota", baseline: "Baseline", intervention: "Intervenção", poor: "Ruim", excellent: "Excelente", contextPlaceholder: "Notas", logEntry: "Log", tipTitle: "Dica", tipBaseline: "Seja honesto.", tipIntervention: "Constância.", noActive: "Nenhum Experimento", goToLib: "Vá à Biblioteca" },
    reports: { title: "Relatórios", finalReport: "Final", finalized: "FINALIZADO", headline: "Destaque", statSummary: "Estatísticas", visualData: "Gráficos", observations: "IA", recommendations: "Recs", limitations: "Avisos", generated: "Em", completed: "FEITO", visualization: "Visual", aiAnalysis: "IA", analyzing: "Analisando...", failed: "Falhou.", details: "Detalhes", duration: "Tempo", evidence: "Evidência", noReports: "Nenhum", completeToGen: "Conclua exp.", backToDash: "Voltar" },
    org: { title: "Organização", export: "Exportar", activeMembers: "Membros", protocolsCompleted: "Feitos", healthScore: "Saúde", teamChart: "Time", insights: "Insights", privacyNote: "Privacidade", privacyDesc: "Dados anônimos." },
    phases: { baseline: "Baseline", intervention: "Intervention" },
    csv: { title: "Upload CSV", dragDrop: "Arraste aqui", supported: "Colunas.", importAs: "Como:", importButton: "Importar", cancel: "Cancelar", success: "Pronto.", error: "Erro.", columns: "Colunas:", preview: "Prévia:" }
  }
};

export const getProtocols = (lang: Language): Protocol[] => {
  return PROTOCOLS_BY_LANG[lang] || PROTOCOLS_BY_LANG['en'];
};

export const PROTOCOLS = getProtocols('en');
