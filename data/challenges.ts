
export type ChallengeCategory = 
  | 'productivity' 
  | 'health' 
  | 'mental-health' 
  | 'focus' 
  | 'growth' 
  | 'teamwork' 
  | 'relaxation' 
  | 'planning' 
  | 'innovation' 
  | 'self-care';

export interface Challenge {
    id: string;
    category: ChallengeCategory;
    title_pt: string;
    title_en: string;
    desc_pt: string;
    desc_en: string;
    participants: number;
    progress: number;
    reward: string;
    joined: boolean;
}

export const CHALLENGE_CATEGORIES_LIST: { id: ChallengeCategory; label_pt: string; label_en: string }[] = [
    { id: 'productivity', label_pt: 'Produtividade', label_en: 'Productivity' },
    { id: 'health', label_pt: 'Saúde & Bem-estar', label_en: 'Health & Wellness' },
    { id: 'mental-health', label_pt: 'Saúde Mental', label_en: 'Mental Health' },
    { id: 'focus', label_pt: 'Foco', label_en: 'Focus' },
    { id: 'growth', label_pt: 'Crescimento', label_en: 'Growth' },
    { id: 'teamwork', label_pt: 'Trabalho em Equipe', label_en: 'Teamwork' },
    { id: 'relaxation', label_pt: 'Relaxamento', label_en: 'Relaxation' },
    { id: 'planning', label_pt: 'Planejamento', label_en: 'Planning' },
    { id: 'innovation', label_pt: 'Inovação', label_en: 'Innovation' },
    { id: 'self-care', label_pt: 'Autocuidado', label_en: 'Self-Care' },
];

export const ALL_CHALLENGES: Challenge[] = [
    // --- PRODUCTIVITY ---
    {
        id: 'prod-1', category: 'productivity',
        title_pt: 'Desafio Pomodoro', title_en: 'Pomodoro Challenge',
        desc_pt: 'Complete 5 ciclos de Pomodoro.', desc_en: 'Complete 5 Pomodoro cycles.',
        participants: 0, progress: 0, reward: '⏱️', joined: false
    },
    {
        id: 'prod-2', category: 'productivity',
        title_pt: 'Foco de 60 Minutos', title_en: '60-Minute Focus',
        desc_pt: 'Trabalhe em uma tarefa por 60 minutos sem interrupções.', desc_en: 'Work on one task for 60 minutes without interruptions.',
        participants: 0, progress: 0, reward: '🔥', joined: false
    },
    {
        id: 'prod-3', category: 'productivity',
        title_pt: 'Trabalho Profundo', title_en: 'Deep Work Challenge',
        desc_pt: 'Complete 4 blocos de 90 minutos de trabalho profundo.', desc_en: 'Complete 4 blocks of 90 minutes of deep work.',
        participants: 0, progress: 0, reward: '🧠', joined: false
    },
    {
        id: 'prod-4', category: 'productivity',
        title_pt: 'Regra dos 2 Minutos', title_en: '2-Minute Rule',
        desc_pt: 'Conclua 10 tarefas que podem ser feitas em menos de 2 minutos.', desc_en: 'Complete 10 tasks that take less than 2 minutes.',
        participants: 0, progress: 0, reward: '⚡', joined: false
    },
    {
        id: 'prod-5', category: 'productivity',
        title_pt: 'Bloqueio de Distrações', title_en: 'Distraction Block',
        desc_pt: 'Bloqueie notificações por 3 horas enquanto trabalha.', desc_en: 'Block notifications for 3 hours while working.',
        participants: 0, progress: 0, reward: '🛡️', joined: false
    },
    {
        id: 'prod-6', category: 'productivity',
        title_pt: '30 Minutos de Foco', title_en: '30 Minutes of Focus',
        desc_pt: 'Dedique 30 minutos de foco absoluto.', desc_en: 'Dedicate 30 minutes to absolute focus.',
        participants: 0, progress: 0, reward: '🎯', joined: false
    },
    {
        id: 'prod-7', category: 'productivity',
        title_pt: '5 Tarefas Concluídas', title_en: '5 Tasks Done',
        desc_pt: 'Conclua 5 tarefas importantes no mesmo dia.', desc_en: 'Complete 5 important tasks in the same day.',
        participants: 0, progress: 0, reward: '✅', joined: false
    },
    {
        id: 'prod-8', category: 'productivity',
        title_pt: 'Minutos Focados', title_en: 'Focused Minutes',
        desc_pt: 'Complete 120 minutos de trabalho focado no dia.', desc_en: 'Complete 120 minutes of focused work in a day.',
        participants: 0, progress: 0, reward: '⏳', joined: false
    },
    {
        id: 'prod-9', category: 'productivity',
        title_pt: 'Sem Redes Sociais', title_en: 'No Social Media',
        desc_pt: 'Fique 4 horas sem acessar redes sociais.', desc_en: 'Go 4 hours without accessing social media.',
        participants: 0, progress: 0, reward: '📵', joined: false
    },
    {
        id: 'prod-10', category: 'productivity',
        title_pt: 'Lista de Tarefas', title_en: 'To-Do List',
        desc_pt: 'Planeje e execute 10 tarefas do seu checklist.', desc_en: 'Plan and execute 10 tasks from your checklist.',
        participants: 0, progress: 0, reward: '📝', joined: false
    },

    // --- HEALTH ---
    {
        id: 'health-1', category: 'health',
        title_pt: 'Desafio de Hidratação', title_en: 'Hydration Challenge',
        desc_pt: 'Beba 2L de água por dia durante uma semana.', desc_en: 'Drink 2L of water daily for a week.',
        participants: 0, progress: 0, reward: '💧', joined: false
    },
    {
        id: 'health-2', category: 'health',
        title_pt: 'Desafio da Postura', title_en: 'Posture Challenge',
        desc_pt: 'Mantenha uma postura correta durante o trabalho por 4 horas.', desc_en: 'Maintain correct posture while working for 4 hours.',
        participants: 0, progress: 0, reward: '🪑', joined: false
    },
    {
        id: 'health-3', category: 'health',
        title_pt: 'Desafio de Alongamento', title_en: 'Stretching Challenge',
        desc_pt: 'Faça 10 minutos de alongamento a cada 2 horas de trabalho.', desc_en: 'Do 10 minutes of stretching every 2 hours of work.',
        participants: 0, progress: 0, reward: '🧘', joined: false
    },
    {
        id: 'health-4', category: 'health',
        title_pt: 'Café da Manhã Saudável', title_en: 'Healthy Breakfast',
        desc_pt: 'Comece o dia com um café da manhã saudável por 7 dias.', desc_en: 'Start the day with a healthy breakfast for 7 days.',
        participants: 0, progress: 0, reward: '🥑', joined: false
    },
    {
        id: 'health-5', category: 'health',
        title_pt: 'Desafio de Caminhada', title_en: 'Walking Challenge',
        desc_pt: 'Caminhe 30 minutos por dia durante 7 dias.', desc_en: 'Walk 30 minutes a day for 7 days.',
        participants: 0, progress: 0, reward: '🚶', joined: false
    },
    {
        id: 'health-6', category: 'health',
        title_pt: '10.000 Passos', title_en: '10,000 Steps',
        desc_pt: 'Dê 10.000 passos por dia por 5 dias consecutivos.', desc_en: 'Take 10,000 steps a day for 5 consecutive days.',
        participants: 0, progress: 0, reward: '👣', joined: false
    },
    {
        id: 'health-7', category: 'health',
        title_pt: 'Desafio de Meditação', title_en: 'Meditation Challenge',
        desc_pt: 'Medite por 10 minutos todos os dias por 30 dias.', desc_en: 'Meditate for 10 minutes every day for 30 days.',
        participants: 0, progress: 0, reward: '🧘‍♂️', joined: false
    },
    {
        id: 'health-8', category: 'health',
        title_pt: 'Desafio de Sono', title_en: 'Sleep Challenge',
        desc_pt: 'Durma 8 horas todas as noites durante uma semana.', desc_en: 'Sleep 8 hours every night for a week.',
        participants: 0, progress: 0, reward: '😴', joined: false
    },
    {
        id: 'health-9', category: 'health',
        title_pt: 'Alimentação Consciente', title_en: 'Mindful Eating',
        desc_pt: 'Coma sem distrações por uma semana.', desc_en: 'Eat without distractions for a week.',
        participants: 0, progress: 0, reward: '🍽️', joined: false
    },
    {
        id: 'health-10', category: 'health',
        title_pt: 'Chá Detox', title_en: 'Detox Tea',
        desc_pt: 'Substitua uma bebida com cafeína por chá detox por 7 dias.', desc_en: 'Replace a caffeinated drink with detox tea for 7 days.',
        participants: 0, progress: 0, reward: '🍵', joined: false
    },

    // --- MENTAL HEALTH ---
    {
        id: 'mental-1', category: 'mental-health',
        title_pt: 'Desafio de Gratidão', title_en: 'Gratitude Challenge',
        desc_pt: 'Escreva 3 coisas pelas quais você é grato todos os dias por 7 dias.', desc_en: 'Write 3 things you are grateful for every day for 7 days.',
        participants: 0, progress: 0, reward: '🙏', joined: false
    },
    {
        id: 'mental-2', category: 'mental-health',
        title_pt: 'Desafio de Silêncio', title_en: 'Silence Challenge',
        desc_pt: 'Passe 30 minutos em silêncio, sem nenhuma distração, todos os dias.', desc_en: 'Spend 30 minutes in silence, without distraction, every day.',
        participants: 0, progress: 0, reward: '🤫', joined: false
    },
    {
        id: 'mental-3', category: 'mental-health',
        title_pt: 'Desafio de Desconectar', title_en: 'Disconnect Challenge',
        desc_pt: 'Desconecte-se da tecnologia por 1 hora antes de dormir por 7 dias.', desc_en: 'Disconnect from technology 1 hour before bed for 7 days.',
        participants: 0, progress: 0, reward: '🔌', joined: false
    },
    {
        id: 'mental-4', category: 'mental-health',
        title_pt: 'Desafio de Journaling', title_en: 'Journaling Challenge',
        desc_pt: 'Escreva 5 minutos todos os dias sobre como se sente.', desc_en: 'Write 5 minutes every day about how you feel.',
        participants: 0, progress: 0, reward: '📓', joined: false
    },
    {
        id: 'mental-5', category: 'mental-health',
        title_pt: 'Reflexão Positiva', title_en: 'Positive Reflection',
        desc_pt: 'Liste 5 coisas boas que aconteceram no seu dia antes de dormir.', desc_en: 'List 5 good things that happened in your day before sleeping.',
        participants: 0, progress: 0, reward: '✨', joined: false
    },
    {
        id: 'mental-6', category: 'mental-health',
        title_pt: 'Técnicas de Respiração', title_en: 'Breathing Techniques',
        desc_pt: 'Faça 5 minutos de respiração profunda para reduzir o estresse.', desc_en: 'Do 5 minutes of deep breathing to reduce stress.',
        participants: 0, progress: 0, reward: '🌬️', joined: false
    },
    {
        id: 'mental-7', category: 'mental-health',
        title_pt: 'Apreciação Pessoal', title_en: 'Self-Appreciation',
        desc_pt: 'Olhe-se no espelho e diga algo positivo sobre si mesmo todos os dias.', desc_en: 'Look in the mirror and say something positive about yourself every day.',
        participants: 0, progress: 0, reward: '💖', joined: false
    },
    {
        id: 'mental-8', category: 'mental-health',
        title_pt: 'Desafio da Ansiedade', title_en: 'Anxiety Challenge',
        desc_pt: 'Passe 10 minutos escrevendo sobre suas preocupações e depois deixe ir.', desc_en: 'Spend 10 minutes writing about your worries and then let go.',
        participants: 0, progress: 0, reward: '🍃', joined: false
    },
    {
        id: 'mental-9', category: 'mental-health',
        title_pt: 'Mindfulness', title_en: 'Mindfulness',
        desc_pt: 'Pratique mindfulness por 10 minutos todos os dias.', desc_en: 'Practice mindfulness for 10 minutes every day.',
        participants: 0, progress: 0, reward: '👁️', joined: false
    },
    {
        id: 'mental-10', category: 'mental-health',
        title_pt: 'Limpeza Mental', title_en: 'Mental Declutter',
        desc_pt: 'Elimine 10 itens de sua lista de tarefas ou pendências.', desc_en: 'Eliminate 10 items from your to-do or backlog list.',
        participants: 0, progress: 0, reward: '🧹', joined: false
    },

    // --- FOCUS ---
    {
        id: 'focus-1', category: 'focus',
        title_pt: '100% de Foco', title_en: '100% Focus',
        desc_pt: 'Trabalhe 2 horas seguidas sem distrações.', desc_en: 'Work 2 hours straight without distractions.',
        participants: 0, progress: 0, reward: '💯', joined: false
    },
    {
        id: 'focus-2', category: 'focus',
        title_pt: 'Minimizar Multitarefa', title_en: 'Minimize Multitasking',
        desc_pt: 'Realize apenas uma tarefa de cada vez durante 1 dia.', desc_en: 'Perform only one task at a time for 1 day.',
        participants: 0, progress: 0, reward: '1️⃣', joined: false
    },
    {
        id: 'focus-3', category: 'focus',
        title_pt: 'Concentração Máxima', title_en: 'Maximum Concentration',
        desc_pt: 'Dedique 90 minutos para um único projeto.', desc_en: 'Dedicate 90 minutes to a single project.',
        participants: 0, progress: 0, reward: '🧠', joined: false
    },
    {
        id: 'focus-4', category: 'focus',
        title_pt: 'Ouvindo Foco', title_en: 'Listening to Focus',
        desc_pt: 'Ouça música que ajude a melhorar a concentração (ruído branco/binaural).', desc_en: 'Listen to music that helps improve concentration (white noise/binaural).',
        participants: 0, progress: 0, reward: '🎧', joined: false
    },
    {
        id: 'focus-5', category: 'focus',
        title_pt: 'Respiração para Foco', title_en: 'Breathing for Focus',
        desc_pt: 'Pratique respiração para aumentar o foco durante o trabalho.', desc_en: 'Practice breathing to increase focus while working.',
        participants: 0, progress: 0, reward: '😤', joined: false
    },
    {
        id: 'focus-6', category: 'focus',
        title_pt: 'Análise de Tarefas', title_en: 'Task Analysis',
        desc_pt: 'Revise todas as suas tarefas e priorize as mais importantes.', desc_en: 'Review all your tasks and prioritize the most important ones.',
        participants: 0, progress: 0, reward: '📊', joined: false
    },
    {
        id: 'focus-7', category: 'focus',
        title_pt: 'Desconectar por 2 Horas', title_en: 'Disconnect for 2 Hours',
        desc_pt: 'Fique offline por 2 horas enquanto realiza uma tarefa importante.', desc_en: 'Stay offline for 2 hours while doing an important task.',
        participants: 0, progress: 0, reward: '🚫', joined: false
    },
    {
        id: 'focus-8', category: 'focus',
        title_pt: 'Eliminar Distrações', title_en: 'Eliminate Distractions',
        desc_pt: 'Elimine ao menos 3 distrações do seu ambiente de trabalho.', desc_en: 'Eliminate at least 3 distractions from your work environment.',
        participants: 0, progress: 0, reward: '🗑️', joined: false
    },
    {
        id: 'focus-9', category: 'focus',
        title_pt: 'Abandono de Multitarefa', title_en: 'Abandon Multitasking',
        desc_pt: 'Não use mais de uma aba ou aplicativo por vez durante o trabalho.', desc_en: 'Do not use more than one tab or app at a time while working.',
        participants: 0, progress: 0, reward: '🛑', joined: false
    },
    {
        id: 'focus-10', category: 'focus',
        title_pt: 'Blocos de Tempo', title_en: 'Time Blocking',
        desc_pt: 'Complete 4 blocos de 25 minutos de foco absoluto (Pomodoro).', desc_en: 'Complete 4 blocks of 25 minutes of absolute focus (Pomodoro).',
        participants: 0, progress: 0, reward: '🧱', joined: false
    },

    // --- GROWTH ---
    {
        id: 'growth-1', category: 'growth',
        title_pt: 'Leitura Diária', title_en: 'Daily Reading',
        desc_pt: 'Leia pelo menos 20 minutos todos os dias durante 7 dias.', desc_en: 'Read at least 20 minutes every day for 7 days.',
        participants: 0, progress: 0, reward: '📚', joined: false
    },
    {
        id: 'growth-2', category: 'growth',
        title_pt: 'Aprendizado Diário', title_en: 'Daily Learning',
        desc_pt: 'Dedique 30 minutos para aprender algo novo todos os dias.', desc_en: 'Dedicate 30 minutes to learn something new every day.',
        participants: 0, progress: 0, reward: '🎓', joined: false
    },
    {
        id: 'growth-3', category: 'growth',
        title_pt: 'Superação de Medo', title_en: 'Overcoming Fear',
        desc_pt: 'Enfrente um medo pessoal ou profissional.', desc_en: 'Face a personal or professional fear.',
        participants: 0, progress: 0, reward: '🦁', joined: false
    },
    {
        id: 'growth-4', category: 'growth',
        title_pt: 'Criatividade', title_en: 'Creativity',
        desc_pt: 'Faça algo criativo todos os dias (escrever, desenhar, criar).', desc_en: 'Do something creative every day (write, draw, create).',
        participants: 0, progress: 0, reward: '🎨', joined: false
    },
    {
        id: 'growth-5', category: 'growth',
        title_pt: 'Mentoria', title_en: 'Mentorship',
        desc_pt: 'Dedique 1 hora para mentorizar alguém ou pedir mentoria.', desc_en: 'Dedicate 1 hour to mentor someone or ask for mentorship.',
        participants: 0, progress: 0, reward: '🤝', joined: false
    },
    {
        id: 'growth-6', category: 'growth',
        title_pt: 'Trabalho Voluntário', title_en: 'Volunteer Work',
        desc_pt: 'Realize uma ação voluntária por uma semana.', desc_en: 'Perform a voluntary action for a week.',
        participants: 0, progress: 0, reward: '🤲', joined: false
    },
    {
        id: 'growth-7', category: 'growth',
        title_pt: 'Autoavaliação', title_en: 'Self-Assessment',
        desc_pt: 'Faça uma autoavaliação de suas habilidades e pontos fortes.', desc_en: 'Perform a self-assessment of your skills and strengths.',
        participants: 0, progress: 0, reward: '🧐', joined: false
    },
    {
        id: 'growth-8', category: 'growth',
        title_pt: 'Networking', title_en: 'Networking',
        desc_pt: 'Conecte-se com 3 novas pessoas por semana.', desc_en: 'Connect with 3 new people a week.',
        participants: 0, progress: 0, reward: '🌐', joined: false
    },
    {
        id: 'growth-9', category: 'growth',
        title_pt: 'Feedback Construtivo', title_en: 'Constructive Feedback',
        desc_pt: 'Peça feedback a pelo menos 3 pessoas em sua vida.', desc_en: 'Ask for feedback from at least 3 people in your life.',
        participants: 0, progress: 0, reward: '💬', joined: false
    },
    {
        id: 'growth-10', category: 'growth',
        title_pt: 'Organização Pessoal', title_en: 'Personal Organization',
        desc_pt: 'Organize sua casa ou seu espaço de trabalho em 1 hora.', desc_en: 'Organize your home or workspace in 1 hour.',
        participants: 0, progress: 0, reward: '🗂️', joined: false
    },

    // --- TEAMWORK ---
    {
        id: 'team-1', category: 'teamwork',
        title_pt: 'Colaboração', title_en: 'Collaboration',
        desc_pt: 'Trabalhe em um projeto com um colega e entregue-o no prazo.', desc_en: 'Work on a project with a colleague and deliver it on time.',
        participants: 0, progress: 0, reward: '👥', joined: false
    },
    {
        id: 'team-2', category: 'teamwork',
        title_pt: 'Reuniões Eficientes', title_en: 'Efficient Meetings',
        desc_pt: 'Conduza reuniões de 30 minutos sem desviar do assunto.', desc_en: 'Conduct 30-minute meetings without straying from the topic.',
        participants: 0, progress: 0, reward: '⏱️', joined: false
    },
    {
        id: 'team-3', category: 'teamwork',
        title_pt: 'Conexão Virtual', title_en: 'Virtual Connection',
        desc_pt: 'Organize um encontro virtual com sua equipe.', desc_en: 'Organize a virtual meeting with your team.',
        participants: 0, progress: 0, reward: '💻', joined: false
    },
    {
        id: 'team-4', category: 'teamwork',
        title_pt: 'Feedback Coletivo', title_en: 'Collective Feedback',
        desc_pt: 'Dê feedback construtivo para 3 colegas de trabalho.', desc_en: 'Give constructive feedback to 3 coworkers.',
        participants: 0, progress: 0, reward: '🗣️', joined: false
    },
    {
        id: 'team-5', category: 'teamwork',
        title_pt: 'Responsabilidade de Grupo', title_en: 'Group Accountability',
        desc_pt: 'Compartilhe responsabilidades em um projeto.', desc_en: 'Share responsibilities in a project.',
        participants: 0, progress: 0, reward: '🏗️', joined: false
    },
    {
        id: 'team-6', category: 'teamwork',
        title_pt: 'Metas de Equipe', title_en: 'Team Goals',
        desc_pt: 'Alcance uma meta de equipe dentro do prazo.', desc_en: 'Reach a team goal within the deadline.',
        participants: 0, progress: 0, reward: '🥅', joined: false
    },
    {
        id: 'team-7', category: 'teamwork',
        title_pt: 'Reconhecimento', title_en: 'Recognition',
        desc_pt: 'Reconheça o bom trabalho de um colega todos os dias por uma semana.', desc_en: 'Recognize a colleague\'s good work every day for a week.',
        participants: 0, progress: 0, reward: '👏', joined: false
    },
    {
        id: 'team-8', category: 'teamwork',
        title_pt: 'Time de Alta Performance', title_en: 'High Performance Team',
        desc_pt: 'Colabore para construir um time mais eficiente.', desc_en: 'Collaborate to build a more efficient team.',
        participants: 0, progress: 0, reward: '🚀', joined: false
    },
    {
        id: 'team-9', category: 'teamwork',
        title_pt: 'Comunicação Clara', title_en: 'Clear Communication',
        desc_pt: 'Envie mensagens claras e concisas para seus colegas por 7 dias.', desc_en: 'Send clear and concise messages to your colleagues for 7 days.',
        participants: 0, progress: 0, reward: '📧', joined: false
    },
    {
        id: 'team-10', category: 'teamwork',
        title_pt: 'Gestão de Tempo em Equipe', title_en: 'Team Time Management',
        desc_pt: 'Melhore a gestão do tempo dentro de sua equipe.', desc_en: 'Improve time management within your team.',
        participants: 0, progress: 0, reward: '🕰️', joined: false
    },

    // --- RELAXATION ---
    {
        id: 'relax-1', category: 'relaxation',
        title_pt: 'Banho Frio', title_en: 'Cold Shower',
        desc_pt: 'Experimente 1 minuto de banho frio todas as manhãs por 7 dias.', desc_en: 'Try a 1-minute cold shower every morning for 7 days.',
        participants: 0, progress: 0, reward: '🚿', joined: false
    },
    {
        id: 'relax-2', category: 'relaxation',
        title_pt: 'Visualização Positiva', title_en: 'Positive Visualization',
        desc_pt: 'Pratique visualização positiva durante 5 minutos por dia.', desc_en: 'Practice positive visualization for 5 minutes a day.',
        participants: 0, progress: 0, reward: '🌈', joined: false
    },
    {
        id: 'relax-3', category: 'relaxation',
        title_pt: 'Desintoxicação Digital', title_en: 'Digital Detox',
        desc_pt: 'Passe 24 horas sem usar redes sociais.', desc_en: 'Spend 24 hours without using social media.',
        participants: 0, progress: 0, reward: '📴', joined: false
    },
    {
        id: 'relax-4', category: 'relaxation',
        title_pt: 'Respiração Profunda', title_en: 'Deep Breathing',
        desc_pt: 'Pratique 5 minutos de respiração profunda para relaxar.', desc_en: 'Practice 5 minutes of deep breathing to relax.',
        participants: 0, progress: 0, reward: '😮‍💨', joined: false
    },
    {
        id: 'relax-5', category: 'relaxation',
        title_pt: 'Apreciar a Natureza', title_en: 'Appreciate Nature',
        desc_pt: 'Passe 20 minutos ao ar livre observando a natureza.', desc_en: 'Spend 20 minutes outdoors observing nature.',
        participants: 0, progress: 0, reward: '🌳', joined: false
    },
    {
        id: 'relax-6', category: 'relaxation',
        title_pt: 'Silêncio de 24 horas', title_en: '24-Hour Silence',
        desc_pt: 'Fique sem falar por 24 horas (silêncio voluntário).', desc_en: 'Go without speaking for 24 hours (voluntary silence).',
        participants: 0, progress: 0, reward: '😶', joined: false
    },
    {
        id: 'relax-7', category: 'relaxation',
        title_pt: 'Desafio de Sorriso', title_en: 'Smile Challenge',
        desc_pt: 'Sorria para pelo menos 5 pessoas no dia.', desc_en: 'Smile at least 5 people in the day.',
        participants: 0, progress: 0, reward: '😁', joined: false
    },
    {
        id: 'relax-8', category: 'relaxation',
        title_pt: 'Relaxamento Muscular', title_en: 'Muscle Relaxation',
        desc_pt: 'Realize um exercício de relaxamento muscular por 10 minutos.', desc_en: 'Perform a muscle relaxation exercise for 10 minutes.',
        participants: 0, progress: 0, reward: '💪', joined: false
    },
    {
        id: 'relax-9', category: 'relaxation',
        title_pt: 'Banho Relaxante', title_en: 'Relaxing Bath',
        desc_pt: 'Faça um banho relaxante com velas ou óleos essenciais.', desc_en: 'Take a relaxing bath with candles or essential oils.',
        participants: 0, progress: 0, reward: '🛁', joined: false
    },
    {
        id: 'relax-10', category: 'relaxation',
        title_pt: 'Livre de Estresse', title_en: 'Stress Free',
        desc_pt: 'Passe 30 minutos de descanso total.', desc_en: 'Spend 30 minutes of total rest.',
        participants: 0, progress: 0, reward: '💆', joined: false
    },

    // --- PLANNING ---
    {
        id: 'plan-1', category: 'planning',
        title_pt: 'Planejamento Semanal', title_en: 'Weekly Planning',
        desc_pt: 'Planeje suas metas e tarefas para a semana no início de cada semana.', desc_en: 'Plan your goals and tasks for the week at the beginning of each week.',
        participants: 0, progress: 0, reward: '📅', joined: false
    },
    {
        id: 'plan-2', category: 'planning',
        title_pt: 'Metas SMART', title_en: 'SMART Goals',
        desc_pt: 'Defina 5 metas específicas, mensuráveis, atingíveis, relevantes e com prazo.', desc_en: 'Define 5 SMART goals.',
        participants: 0, progress: 0, reward: '🎯', joined: false
    },
    {
        id: 'plan-3', category: 'planning',
        title_pt: 'Listagem de Tarefas', title_en: 'Task Listing',
        desc_pt: 'Organize uma lista de tarefas diárias por 7 dias.', desc_en: 'Organize a daily task list for 7 days.',
        participants: 0, progress: 0, reward: '📋', joined: false
    },
    {
        id: 'plan-4', category: 'planning',
        title_pt: 'Definição de Prioridades', title_en: 'Defining Priorities',
        desc_pt: 'Liste e priorize suas 3 tarefas mais importantes do dia.', desc_en: 'List and prioritize your 3 most important tasks of the day.',
        participants: 0, progress: 0, reward: '🔝', joined: false
    },
    {
        id: 'plan-5', category: 'planning',
        title_pt: 'Revisão de Metas', title_en: 'Goals Review',
        desc_pt: 'Revise suas metas mensais e ajuste conforme necessário.', desc_en: 'Review your monthly goals and adjust as needed.',
        participants: 0, progress: 0, reward: '🔍', joined: false
    },
    {
        id: 'plan-6', category: 'planning',
        title_pt: 'Quebra de Tarefas', title_en: 'Task Breakdown',
        desc_pt: 'Quebre grandes tarefas em pequenas partes e faça uma por dia.', desc_en: 'Break big tasks into small parts and do one a day.',
        participants: 0, progress: 0, reward: '🔨', joined: false
    },
    {
        id: 'plan-7', category: 'planning',
        title_pt: '30 Dias de Planejamento', title_en: '30 Days of Planning',
        desc_pt: 'Planeje sua agenda por 30 dias consecutivos.', desc_en: 'Plan your schedule for 30 consecutive days.',
        participants: 0, progress: 0, reward: '🗓️', joined: false
    },
    {
        id: 'plan-8', category: 'planning',
        title_pt: 'Feito é Melhor que Perfeito', title_en: 'Done is Better than Perfect',
        desc_pt: 'Conclua uma tarefa, mesmo que ela não esteja perfeita.', desc_en: 'Complete a task, even if it is not perfect.',
        participants: 0, progress: 0, reward: '✅', joined: false
    },
    {
        id: 'plan-9', category: 'planning',
        title_pt: 'Planejamento Matinal', title_en: 'Morning Planning',
        desc_pt: 'Planeje seu dia pela manhã antes de começar a trabalhar.', desc_en: 'Plan your day in the morning before you start working.',
        participants: 0, progress: 0, reward: '☕', joined: false
    },
    {
        id: 'plan-10', category: 'planning',
        title_pt: 'Destralhamento (Declutter)', title_en: 'Declutter',
        desc_pt: 'Organize seu espaço de trabalho ou casa por 30 minutos.', desc_en: 'Organize your workspace or home for 30 minutes.',
        participants: 0, progress: 0, reward: '🗑️', joined: false
    },

    // --- INNOVATION ---
    {
        id: 'innov-1', category: 'innovation',
        title_pt: 'Brainstorming', title_en: 'Brainstorming',
        desc_pt: 'Dedique 30 minutos para brainstorm de ideias novas todos os dias.', desc_en: 'Dedicate 30 minutes to brainstorm new ideas every day.',
        participants: 0, progress: 0, reward: '💡', joined: false
    },
    {
        id: 'innov-2', category: 'innovation',
        title_pt: 'Criar Algo Novo', title_en: 'Create Something New',
        desc_pt: 'Crie algo novo e compartilhe com amigos ou colegas.', desc_en: 'Create something new and share with friends or colleagues.',
        participants: 0, progress: 0, reward: '🆕', joined: false
    },
    {
        id: 'innov-3', category: 'innovation',
        title_pt: 'Pensamento Invertido', title_en: 'Inverted Thinking',
        desc_pt: 'Resolva um problema usando uma abordagem completamente diferente.', desc_en: 'Solve a problem using a completely different approach.',
        participants: 0, progress: 0, reward: '🔄', joined: false
    },
    {
        id: 'innov-4', category: 'innovation',
        title_pt: 'Design Criativo', title_en: 'Creative Design',
        desc_pt: 'Crie algo com materiais que você não está acostumado a usar.', desc_en: 'Create something with materials you are not used to using.',
        participants: 0, progress: 0, reward: '🎭', joined: false
    },
    {
        id: 'innov-5', category: 'innovation',
        title_pt: 'Pensamento Lateral', title_en: 'Lateral Thinking',
        desc_pt: 'Resolva um problema de forma criativa sem seguir o caminho tradicional.', desc_en: 'Solve a problem creatively without following the traditional path.',
        participants: 0, progress: 0, reward: '🤔', joined: false
    },
    {
        id: 'innov-6', category: 'innovation',
        title_pt: 'Aprendizado Interativo', title_en: 'Interactive Learning',
        desc_pt: 'Participe de um workshop ou curso fora da sua área.', desc_en: 'Attend a workshop or course outside your area.',
        participants: 0, progress: 0, reward: '🏫', joined: false
    },
    {
        id: 'innov-7', category: 'innovation',
        title_pt: 'Trabalho com Limitações', title_en: 'Work with Limitations',
        desc_pt: 'Crie algo com recursos limitados (ex: só 3 materiais).', desc_en: 'Create something with limited resources (e.g. only 3 materials).',
        participants: 0, progress: 0, reward: '🧱', joined: false
    },
    {
        id: 'innov-8', category: 'innovation',
        title_pt: 'Ideias Sustentáveis', title_en: 'Sustainable Ideas',
        desc_pt: 'Crie uma ideia boa para o meio ambiente.', desc_en: 'Create an idea good for the environment.',
        participants: 0, progress: 0, reward: '🌱', joined: false
    },
    {
        id: 'innov-9', category: 'innovation',
        title_pt: '30 Minutos de Criatividade', title_en: '30 Minutes of Creativity',
        desc_pt: 'Dedique 30 minutos a um projeto criativo sem distrações.', desc_en: 'Dedicate 30 minutes to a creative project without distractions.',
        participants: 0, progress: 0, reward: '⏱️', joined: false
    },
    {
        id: 'innov-10', category: 'innovation',
        title_pt: 'Retoque Criativo', title_en: 'Creative Retouch',
        desc_pt: 'Melhore um projeto ou tarefa anterior de forma criativa.', desc_en: 'Improve a previous project or task creatively.',
        participants: 0, progress: 0, reward: '✨', joined: false
    },

    // --- SELF-CARE ---
    {
        id: 'care-1', category: 'self-care',
        title_pt: 'Cuidado com a Pele', title_en: 'Skincare',
        desc_pt: 'Faça uma rotina de cuidados com a pele todas as noites durante 7 dias.', desc_en: 'Do a skincare routine every night for 7 days.',
        participants: 0, progress: 0, reward: '🧴', joined: false
    },
    {
        id: 'care-2', category: 'self-care',
        title_pt: 'Autoestima', title_en: 'Self-Esteem',
        desc_pt: 'Faça algo que aumente sua autoestima todos os dias por uma semana.', desc_en: 'Do something that boosts your self-esteem every day for a week.',
        participants: 0, progress: 0, reward: '🌟', joined: false
    },
    {
        id: 'care-3', category: 'self-care',
        title_pt: 'Silêncio Noturno', title_en: 'Night Silence',
        desc_pt: 'Passe 30 minutos em silêncio antes de dormir.', desc_en: 'Spend 30 minutes in silence before sleeping.',
        participants: 0, progress: 0, reward: '🌙', joined: false
    },
    {
        id: 'care-4', category: 'self-care',
        title_pt: 'Relacionamentos', title_en: 'Relationships',
        desc_pt: 'Dedique tempo de qualidade com pessoas importantes em sua vida.', desc_en: 'Dedicate quality time with important people in your life.',
        participants: 0, progress: 0, reward: '❤️', joined: false
    },
    {
        id: 'care-5', category: 'self-care',
        title_pt: 'Mente Tranquila', title_en: 'Peaceful Mind',
        desc_pt: 'Evite pensar no trabalho durante o final de semana.', desc_en: 'Avoid thinking about work during the weekend.',
        participants: 0, progress: 0, reward: '🧘', joined: false
    },
    {
        id: 'care-6', category: 'self-care',
        title_pt: 'Conforto Físico', title_en: 'Physical Comfort',
        desc_pt: 'Crie um ambiente confortável para trabalhar.', desc_en: 'Create a comfortable environment to work in.',
        participants: 0, progress: 0, reward: '🛋️', joined: false
    },
    {
        id: 'care-7', category: 'self-care',
        title_pt: 'Empatia', title_en: 'Empathy',
        desc_pt: 'Faça um esforço extra para entender os sentimentos dos outros.', desc_en: 'Make an extra effort to understand the feelings of others.',
        participants: 0, progress: 0, reward: '🤗', joined: false
    },
    {
        id: 'care-8', category: 'self-care',
        title_pt: 'Relaxamento para Mente', title_en: 'Mind Relaxation',
        desc_pt: 'Passe 10 minutos apenas relaxando sua mente sem qualquer tarefa.', desc_en: 'Spend 10 minutes just relaxing your mind without any task.',
        participants: 0, progress: 0, reward: '🧠', joined: false
    },
    {
        id: 'care-9', category: 'self-care',
        title_pt: 'Alimentação Equilibrada', title_en: 'Balanced Diet',
        desc_pt: 'Coma de forma equilibrada por 7 dias.', desc_en: 'Eat a balanced diet for 7 days.',
        participants: 0, progress: 0, reward: '🥗', joined: false
    },
    {
        id: 'care-10', category: 'self-care',
        title_pt: 'Autoamor', title_en: 'Self-Love',
        desc_pt: 'Dedique 15 minutos do seu dia para fazer algo que lhe faça bem.', desc_en: 'Dedicate 15 minutes of your day to do something that makes you feel good.',
        participants: 0, progress: 0, reward: '💌', joined: false
    }
];
