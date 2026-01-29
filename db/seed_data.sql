
-- =============================================================================
-- SEED DATA COMPLETO (ALL PROTOCOLS + CHALLENGES)
-- =============================================================================

-- 1. DESAFIOS (CHALLENGES)
INSERT INTO public.challenges (id, category, title_pt, title_en, desc_pt, desc_en, reward, xp_points) VALUES
('prod-1', 'productivity', 'Desafio Pomodoro', 'Pomodoro Challenge', 'Complete 5 ciclos de Pomodoro.', 'Complete 5 Pomodoro cycles.', '⏱️', 50),
('prod-2', 'productivity', 'Foco de 60 Minutos', '60-Minute Focus', 'Trabalhe em uma tarefa por 60 minutos sem interrupções.', 'Work on one task for 60 minutes without interruptions.', '🔥', 100),
('prod-3', 'productivity', 'Trabalho Profundo', 'Deep Work Challenge', 'Complete 4 blocos de 90 minutos de trabalho profundo.', 'Complete 4 blocks of 90 minutes of deep work.', '🧠', 150),
('prod-4', 'productivity', 'Regra dos 2 Minutos', '2-Minute Rule', 'Conclua 10 tarefas que podem ser feitas em menos de 2 minutos.', 'Complete 10 tasks that take less than 2 minutes.', '⚡', 30),
('health-1', 'health', 'Desafio de Hidratação', 'Hydration Challenge', 'Beba 2L de água por dia durante uma semana.', 'Drink 2L of water daily for a week.', '💧', 100),
('health-2', 'health', 'Desafio da Postura', 'Posture Challenge', 'Mantenha uma postura correta durante o trabalho por 4 horas.', 'Maintain correct posture while working for 4 hours.', '🪑', 50),
('mental-1', 'mental-health', 'Desafio de Gratidão', 'Gratitude Challenge', 'Escreva 3 coisas pelas quais você é grato todos os dias por 7 dias.', 'Write 3 things you are grateful for every day for 7 days.', '🙏', 100),
('focus-1', 'focus', '100% de Foco', '100% Focus', 'Trabalhe 2 horas seguidas sem distrações.', 'Work 2 hours straight without distractions.', '💯', 120),
('relax-1', 'relaxation', 'Banho Frio', 'Cold Shower', 'Experimente 1 minuto de banho frio todas as manhãs por 7 dias.', 'Try a 1-minute cold shower every morning for 7 days.', '🚿', 150)
ON CONFLICT (id) DO NOTHING;

-- 2. PROTOCOLOS (FULL LIST FROM JSON)

-- Pomodoro
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-pomodoro', 'Técnica Pomodoro', 'Ciclos de 25 minutos de foco intenso seguidos por 5 minutos de descanso.', 'Previne a fadiga cognitiva impondo pausas regulares.', 'SILVER', 7, ARRAY['Foco', 'Gestão de Tempo'], ARRAY['Ciclos Completos', 'Fadiga (1-10)']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-pomodoro', 1, 'Defina a Tarefa', 'Escolha UMA única tarefa.'),
('p-pomodoro', 2, 'Timer 25m', 'Configure o timer para 25 minutos.'),
('p-pomodoro', 3, 'Trabalhe', 'Trabalhe até o alarme tocar.'),
('p-pomodoro', 4, 'Pausa Curta', 'Pausa de 5 min (sem telas).');

-- Deep Work
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-deep-work', 'Blocos de Deep Work', 'Sessões de 90 minutos de trabalho cognitivo ininterrupto.', 'Alinha o esforço cognitivo com os ciclos ultradianos naturais.', 'SILVER', 14, ARRAY['Foco', 'Avançado'], ARRAY['Minutos Focados', 'Clareza']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-deep-work', 1, 'Elimine Distrações', 'Celular em outro cômodo.'),
('p-deep-work', 2, 'Timer 90m', 'Foque em uma tarefa complexa.'),
('p-deep-work', 3, 'Descanso Ativo', '20 minutos de descompressão.');

-- NSDR
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-nsdr', 'NSDR / Yoga Nidra', 'Descanso Profundo Sem Sono. Protocolo de 20 minutos.', 'Facilita a neuroplasticidade e repõe dopamina.', 'GOLD', 14, ARRAY['Sono', 'Stress'], ARRAY['Energia Pós-Prática', 'Qualidade do Sono']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-nsdr', 1, 'Deite-se', 'Encontre um local silencioso.'),
('p-nsdr', 2, 'Áudio Guia', 'Ouça um script de NSDR ou Yoga Nidra.'),
('p-nsdr', 3, 'Body Scan', 'Siga as instruções de relaxamento.');

-- Morning Sun
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-morning-sun', 'Exposição Solar Matinal', 'Visualizar luz solar direta ao ar livre ao acordar.', 'Dispara o núcleo supraquiasmático para liberar cortisol e agendar sono.', 'GOLD', 14, ARRAY['Sono', 'Energia'], ARRAY['Latência do Sono', 'Humor']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-morning-sun', 1, 'Sair de Casa', 'Vá para fora (janelas filtram UV).'),
('p-morning-sun', 2, 'Exposição', '5-10 min (dia claro) ou 20 min (nublado).');

-- Physio Sigh
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-physio-sigh', 'Suspiro Fisiológico', 'Padrão de respiração: duas inspirações e uma expiração longa.', 'Reabre os alvéolos pulmonares e remove CO2 rapidamente.', 'GOLD', 7, ARRAY['Stress', 'Ansiedade'], ARRAY['Ansiedade (1-10)']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-physio-sigh', 1, 'Inale Duas Vezes', 'Uma profunda, uma curta.'),
('p-physio-sigh', 2, 'Exale Longamente', 'Solte o ar pela boca devagar.');

-- Cold Shower
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-cold-shower', 'Banho Gelado Matinal', '1 a 3 minutos de água fria ao final do banho.', 'Aumenta norepinefrina e dopamina (até 250%) por horas.', 'GOLD', 14, ARRAY['Foco', 'Dopamina'], ARRAY['Energia', 'Humor']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-cold-shower', 1, 'Banho Normal', 'Tome seu banho higiênico morno.'),
('p-cold-shower', 2, 'Choque Frio', 'Vire tudo para o frio. Entre de uma vez.'),
('p-cold-shower', 3, 'Controle', 'Respire devagar. Fique 60 segundos.');

-- Caffeine Cutoff
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-caffeine-cutoff', 'Cutoff de Cafeína (10h)', 'Parar a ingestão de cafeína 10 horas antes de dormir.', 'Evita bloqueio de receptores de adenosina à noite.', 'GOLD', 10, ARRAY['Sono', 'Hábitos'], ARRAY['Qualidade do Sono']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-caffeine-cutoff', 1, 'Defina o Horário', 'Se dorme às 23h, pare às 13h.'),
('p-caffeine-cutoff', 2, 'Substituição', 'Troque por descafeinado ou chá.');

-- Box Breathing
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-box-breathing', 'Respiração Quadrada', 'Inspira 4s, Segura 4s, Exala 4s, Segura 4s.', 'Regula o CO2 e ativa o parassimpático.', 'SILVER', 7, ARRAY['Stress', 'Foco'], ARRAY['Calma (1-10)']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-box-breathing', 1, 'Inspire', '4 segundos pelo nariz.'),
('p-box-breathing', 2, 'Segure', '4 segundos pulmão cheio.'),
('p-box-breathing', 3, 'Exale', '4 segundos.'),
('p-box-breathing', 4, 'Segure', '4 segundos pulmão vazio.');

-- Dopamine Detox
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-dopamine-detox', 'Jejum de Dopamina', 'Remoção de estímulos super-normais por 24h.', 'Ressensibiliza os receptores de dopamina.', 'BRONZE', 3, ARRAY['Hábitos', 'Avançado'], ARRAY['Tédio', 'Motivação']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-dopamine-detox', 1, 'Defina as Regras', 'Sem redes sociais, jogos, junk food.'),
('p-dopamine-detox', 2, 'Substitua', 'Caminhar, escrever, limpar.');

-- Gratitude
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-gratitude', 'Diário de Gratidão', 'Escrever 3 coisas pelas quais é grato.', 'Altera o viés atencional do cérebro para positivo.', 'GOLD', 21, ARRAY['Stress', 'Bem-estar'], ARRAY['Humor Diário']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-gratitude', 1, 'Escreva', '3 itens específicos.'),
('p-gratitude', 2, 'Sinta', 'Reviva a emoção por 10s.');

-- Binaural 40hz
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-binaural-40hz', 'Batidas Binaurais 40Hz', 'Frequências auditivas para induzir ondas gama.', 'Arrastamento de ondas cerebrais para foco.', 'BRONZE', 5, ARRAY['Foco', 'Áudio'], ARRAY['Foco (1-10)']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-binaural-40hz', 1, 'Fones de Ouvido', 'Use fones estéreo.'),
('p-binaural-40hz', 2, 'Play', 'Ouça durante trabalho focado.');

-- Sleep Temp
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-sleep-temp', 'Ambiente Frio para Sono', 'Manter o quarto entre 18°C e 20°C.', 'Reduz temperatura central para iniciar sono profundo.', 'GOLD', 7, ARRAY['Sono'], ARRAY['Qualidade do Sono']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-sleep-temp', 1, 'Ajuste AC/Ventilador', 'Configure para ~19°C.'),
('p-sleep-temp', 2, 'Cobertores', 'Use cobertores, mas mantenha o ar frio.');

-- Creatine
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-creatine', 'Creatina Cognitiva', '5g de Creatina Monohidratada diariamente.', 'Aumenta fosfocreatina no cérebro (reciclagem de ATP).', 'GOLD', 21, ARRAY['Hábitos', 'Suplementação'], ARRAY['Fadiga Mental']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-creatine', 1, 'Dose Diária', 'Tome 5g de creatina.'),
('p-creatine', 2, 'Hidratação', 'Aumente ingestão de água.');

-- Phone Gray
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-phone-gray', 'Celular em Escala de Cinza', 'Tela do smartphone em preto e branco.', 'Remove recompensas visuais que estimulam dopamina.', 'SILVER', 7, ARRAY['Foco', 'Digital'], ARRAY['Tempo de Tela']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-phone-gray', 1, 'Configurar', 'Acessibilidade > Filtros de Cor.'),
('p-phone-gray', 2, 'Manter', 'Ativo 90% do dia.');

-- 4-7-8 Breath
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-478-breath', 'Respiração 4-7-8', 'Técnica rítmica para induzir sono.', 'Modulação vagal potente através da expiração prolongada.', 'SILVER', 7, ARRAY['Sono', 'Ansiedade'], ARRAY['Latência do Sono']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-478-breath', 1, 'Ciclo', 'Inspire 4s, Segure 7s, Exale 8s.'),
('p-478-breath', 2, 'Repita', '4 ciclos.');

-- Zone 2
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-zone2', 'Cardio Zona 2', 'Exercício aeróbico de baixa intensidade.', 'Melhora função mitocondrial e flexibilidade metabólica.', 'GOLD', 21, ARRAY['Hábitos', 'Saúde'], ARRAY['Energia Diária']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-zone2', 1, 'Atividade', 'Caminhada rápida ou bike.'),
('p-zone2', 2, 'Intensidade', 'Ritmo de conversa, mas ofegante.');

-- Worry Dump
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-write-worry', 'Download de Preocupações', 'Escrever tarefas abertas num papel.', 'Descarrega a Memória de Trabalho (Loop Aberto).', 'SILVER', 5, ARRAY['Stress', 'Foco'], ARRAY['Clareza Mental']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-write-worry', 1, 'Liste Tudo', 'Tudo que está pendente na cabeça.'),
('p-write-worry', 2, 'Ação', 'Defina o próximo passo.');

-- Eat Frog
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-eat-frog', 'Eat the Frog', 'Fazer a tarefa mais difícil logo no início.', 'Aproveita pico de cortisol matinal e evita efeito Zeigarnik.', 'BRONZE', 5, ARRAY['Foco', 'Gestão de Tempo'], ARRAY['Satisfação']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-eat-frog', 1, 'Identifique', 'A tarefa que você está evitando.'),
('p-eat-frog', 2, 'Execute', 'Antes de checar email.');

-- Forest Bathing
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-forest-bath', 'Banho de Floresta', 'Imersão em natureza por 20min.', 'Reduz cortisol e pressão arterial.', 'GOLD', 7, ARRAY['Stress', 'Recuperação'], ARRAY['Relaxamento']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-forest-bath', 1, 'Natureza', 'Vá a um parque ou área verde.'),
('p-forest-bath', 2, 'Desconecte', 'Sem celular.');

-- Visualization
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-visualize', 'Visualização de Processo', 'Imaginar a EXECUÇÃO de uma tarefa.', 'Ativa áreas motoras e de planejamento.', 'SILVER', 7, ARRAY['Foco', 'Performance'], ARRAY['Ansiedade Pré-tarefa']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-visualize', 1, 'Imagine o Agir', 'Imagine-se lidando com problemas e persistindo.');

-- Intermittent Fasting
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-intermittent-fasting', 'Jejum 16:8', 'Janela de alimentação de 8 horas.', 'Aumenta orexina e alerta matinal.', 'SILVER', 14, ARRAY['Saúde', 'Foco'], ARRAY['Foco Manhã']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-intermittent-fasting', 1, 'Pule o Café', 'Apenas água ou café preto de manhã.'),
('p-intermittent-fasting', 2, 'Janela', '12h às 20h.');

-- Blue Block
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-blue-block', 'Bloqueio de Luz Azul', 'Óculos ou software após o pôr do sol.', 'Permite a liberação natural de melatonina.', 'SILVER', 7, ARRAY['Sono'], ARRAY['Sonolência 22h']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-blue-block', 1, 'Software', 'Ative Night Shift/f.lux.'),
('p-blue-block', 2, 'Luzes', 'Apague luzes brancas de teto.');

-- Power Nap
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-power-nap', 'Power Nap (Sesta)', 'Cochilo de 20 min à tarde.', 'Limpa adenosina sem inércia do sono.', 'GOLD', 7, ARRAY['Foco', 'Recuperação'], ARRAY['Alerta Tarde']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-power-nap', 1, 'Alarme', 'Max 20 minutos.'),
('p-power-nap', 2, 'Horário', 'Entre 13h e 15h.');

-- Cold Work Env
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-cold-environment-work', 'Ambiente de Trabalho Fresco', 'Trabalhar a 19-21°C.', 'O calor induz relaxamento; o frio leve mantém alerta.', 'BRONZE', 5, ARRAY['Foco', 'Ambiente'], ARRAY['Nível de Alerta']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-cold-environment-work', 1, 'Ajuste', 'Reduza o termostato.');

-- Magnesium
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-magnesium', 'Magnésio (Glicinato)', 'Suplementação antes de dormir.', 'Cofator para GABA (relaxamento).', 'SILVER', 14, ARRAY['Sono', 'Suplementação'], ARRAY['Relaxamento Físico']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-magnesium', 1, 'Dose', '200-400mg, 30 min antes de dormir.');

-- Time Blocking
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-time-blocking', 'Time Blocking', 'Agendar cada minuto do dia.', 'Lei de Parkinson: cria escassez de tempo artificial.', 'SILVER', 7, ARRAY['Foco', 'Gestão de Tempo'], ARRAY['Tarefas Cumpridas']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-time-blocking', 1, 'Planeje', 'Defina os blocos na noite anterior.');

-- Social Media Fast
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-social-media-fast', 'Jejum de Redes (Manhã)', 'Sem redes nas primeiras 2h do dia.', 'Preserva dopamina para objetivos próprios.', 'BRONZE', 7, ARRAY['Foco', 'Hábitos'], ARRAY['Humor Matinal']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-social-media-fast', 1, 'Modo Avião', 'Ao acordar.'),
('p-social-media-fast', 2, 'Primeiro Check', 'Só após a tarefa principal.');

-- Sauna
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-sauna', 'Sauna (Heat Stress)', '20 minutos de calor intenso.', 'Libera proteínas de choque térmico e dinorfina.', 'GOLD', 14, ARRAY['Recuperação', 'Saúde'], ARRAY['Relaxamento']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-sauna', 1, 'Hidratação', 'Beba água antes.'),
('p-sauna', 2, 'Sessão', '15-20 minutos.');

-- 5 Min Journal
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-five-minute-journal', 'Diário de 5 Minutos', 'Formato estruturado: Gratidão + Intenção.', 'Priming cognitivo para positividade.', 'BRONZE', 14, ARRAY['Hábitos', 'Bem-estar'], ARRAY['Positividade']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-five-minute-journal', 1, 'Manhã', '3 Gratidões + O que faria hoje ótimo.'),
('p-five-minute-journal', 2, 'Noite', 'Coisas boas que aconteceram.');

-- Habit Stacking
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags, metrics) VALUES 
('p-habit-stacking', 'Empilhamento de Hábitos', 'Novo hábito após um existente.', 'Usa conexões neurais existentes como gatilho.', 'SILVER', 14, ARRAY['Hábitos'], ARRAY['Consistência']);
INSERT INTO public.protocol_steps (protocol_id, step_order, title, description) VALUES
('p-habit-stacking', 1, 'Identifique', 'O hábito "gancho" (ex: escovar dentes).'),
('p-habit-stacking', 2, 'Execute', 'O novo hábito imediatamente após.');

