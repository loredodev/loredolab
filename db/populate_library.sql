
-- =============================================================================
-- POPULATE LIBRARY SCRIPT
-- Rode este script no SQL Editor para encher a tabela de protocolos.
-- =============================================================================

-- 1. Limpar protocolos do sistema para evitar duplicatas (mantém os criados por usuários)
DELETE FROM public.protocol_steps WHERE protocol_id IN (SELECT id FROM public.protocols WHERE created_by IS NULL);
DELETE FROM public.protocols WHERE created_by IS NULL;

-- 2. Inserir Protocolos (Baseado no seu protocols_seed.json)

-- Pomodoro
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-pomodoro', 'Técnica Pomodoro', 'Ciclos de 25 minutos de foco intenso seguidos por 5 minutos de descanso. Ideal para tarefas repetitivas ou longas.', 'Previne a fadiga cognitiva impondo pausas regulares e reduz a resistência límbica ao iniciar tarefas.', 'SILVER', 7, ARRAY['Foco', 'Gestão de Tempo', 'Iniciante']);

-- Deep Work
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-deep-work', 'Blocos de Deep Work', 'Sessões de 90 minutos de trabalho cognitivo ininterrupto, alinhadas aos ritmos ultradianos.', 'Alinha o esforço cognitivo com os ciclos ultradianos naturais do cérebro (aprox. 90 min).', 'SILVER', 14, ARRAY['Foco', 'Avançado', 'Cognição']);

-- NSDR
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-nsdr', 'NSDR / Yoga Nidra', 'Descanso Profundo Sem Sono. Protocolo de 20 minutos para resetar o sistema nervoso.', 'Facilita a neuroplasticidade e repõe dopamina engajando o sistema nervoso parassimpático.', 'GOLD', 14, ARRAY['Sono', 'Stress', 'Recuperação']);

-- Morning Sun
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-morning-sun', 'Exposição Solar Matinal', 'Visualizar luz solar direta (ao ar livre) nos primeiros 30-60 minutos após acordar.', 'O pulso de luz na retina dispara o núcleo supraquiasmático para liberar cortisol e agendar sono.', 'GOLD', 14, ARRAY['Sono', 'Hábitos', 'Energia']);

-- Physiological Sigh
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-physio-sigh', 'Suspiro Fisiológico', 'Padrão de respiração: duas inspirações pelo nariz e uma expiração longa pela boca.', 'Reabre os alvéolos pulmonares colapsados e remove CO2 rapidamente, ativando o nervo vago.', 'GOLD', 7, ARRAY['Stress', 'Quick', 'Ansiedade']);

-- Cold Shower
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-cold-shower', 'Banho Gelado Matinal', '1 a 3 minutos de água fria ao final do banho.', 'Aumenta norepinefrina e dopamina (até 250%) por horas. Gera resiliência mental.', 'GOLD', 14, ARRAY['Foco', 'Hábitos', 'Dopamina']);

-- Caffeine Cutoff
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-caffeine-cutoff', 'Cutoff de Cafeína (10h)', 'Parar a ingestão de cafeína 10 horas antes do horário de dormir.', 'Ingestão tardia bloqueia receptores de adenosina, prejudicando o sono profundo.', 'GOLD', 10, ARRAY['Sono', 'Hábitos']);

-- Box Breathing
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-box-breathing', 'Respiração Quadrada', 'Inspira 4s, Segura 4s, Exala 4s, Segura 4s. Usado por militares.', 'Regula o CO2 e ativa o parassimpático através do ritmo lento e retenção.', 'SILVER', 7, ARRAY['Stress', 'Foco']);

-- Dopamine Detox
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-dopamine-detox', 'Jejum de Dopamina (Lite)', 'Remoção de estímulos super-normais (redes sociais, jogos, junk food) por 24h.', 'Ressensibiliza os receptores de dopamina, tornando atividades difíceis mais prazerosas.', 'BRONZE', 3, ARRAY['Hábitos', 'Avançado']);

-- Gratitude
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-gratitude', 'Diário de Gratidão', 'Escrever 3 coisas pelas quais é grato toda manhã ou noite.', 'Altera o viés atencional do cérebro para positivo, reduzindo ruminação e cortisol.', 'GOLD', 21, ARRAY['Stress', 'Hábitos', 'Bem-estar']);

-- Binaural 40hz
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-binaural-40hz', 'Batidas Binaurais 40Hz', 'Ouvir frequências auditivas específicas para induzir ondas gama.', 'Arrastamento de ondas cerebrais (brainwave entrainment) para frequências de foco.', 'BRONZE', 5, ARRAY['Foco', 'Áudio']);

-- Sleep Temp
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-sleep-temp', 'Ambiente Frio para Sono', 'Manter o quarto entre 18°C e 20°C.', 'O corpo precisa reduzir a temperatura central para iniciar e manter o sono profundo.', 'GOLD', 7, ARRAY['Sono']);

-- Creatine
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-creatine', 'Creatina (Uso Cognitivo)', 'Suplementação de 5g de Creatina Monohidratada diariamente.', 'Aumenta estoques de fosfocreatina no cérebro, melhorando reciclagem de ATP.', 'GOLD', 21, ARRAY['Hábitos', 'Suplementação', 'Cérebro']);

-- Phone Gray
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-phone-gray', 'Celular em Escala de Cinza', 'Configurar a tela do smartphone para preto e branco.', 'Remove as recompensas visuais (cores vibrantes) que estimulam o sistema de dopamina.', 'SILVER', 7, ARRAY['Foco', 'Hábitos', 'Digital']);

-- 4-7-8 Breath
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-478-breath', 'Respiração 4-7-8', 'Técnica rítmica para induzir sono.', 'Modulação vagal potente através da expiração prolongada (8s).', 'SILVER', 7, ARRAY['Sono', 'Ansiedade']);

-- Zone 2
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-zone2', 'Cardio Zona 2', 'Exercício aeróbico de baixa intensidade por 30-45 min.', 'Melhora função mitocondrial e flexibilidade metabólica.', 'GOLD', 21, ARRAY['Hábitos', 'Saúde', 'Energia']);

-- Worry Dump
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-write-worry', 'Download de Preocupações', 'Escrever todas as tarefas e preocupações abertas em um papel.', 'Descarrega a Memória de Trabalho, reduzindo a ansiedade de fundo.', 'SILVER', 5, ARRAY['Stress', 'Foco']);

-- Eat Frog
INSERT INTO public.protocols (id, title, description, mechanism, evidence_level, duration_days, tags)
VALUES ('p-eat-frog', 'Eat the Frog', 'Fazer a tarefa mais difícil logo no início do dia.', 'Aproveita o pico de cortisol matinal e evita o efeito Zeigarnik.', 'BRONZE', 5, ARRAY['Foco', 'Gestão de Tempo']);


-- 3. Inserir Passos (Steps)

-- Pomodoro Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-pomodoro', 1, 'Defina a Tarefa: Escolha UMA única tarefa.', false),
('p-pomodoro', 2, 'Timer 25m: Configure o timer para 25 minutos.', false),
('p-pomodoro', 3, 'Trabalhe: Trabalhe até o alarme tocar.', false),
('p-pomodoro', 4, 'Pausa Curta: Pausa de 5 min (sem telas).', false);

-- NSDR Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-nsdr', 1, 'Deite-se: Encontre um local silencioso e deite-se de costas.', false),
('p-nsdr', 2, 'Áudio Guia: Ouça um script de NSDR ou Yoga Nidra.', false),
('p-nsdr', 3, 'Body Scan: Siga as instruções de relaxamento progressivo.', false);

-- Cold Shower Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-cold-shower', 1, 'Banho Normal: Tome seu banho higiênico morno.', true),
('p-cold-shower', 2, 'Choque Frio: Vire tudo para o frio. Entre de uma vez.', false),
('p-cold-shower', 3, 'Controle: Respire devagar. Fique 60 segundos.', false);

-- Morning Sun Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-morning-sun', 1, 'Sair de Casa: Vá para fora. Janelas filtram o espectro necessário.', false),
('p-morning-sun', 2, 'Exposição: 5-10 min (dia claro) ou 20 min (nublado).', false);

-- Deep Work Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-deep-work', 1, 'Elimine Distrações: Celular em outro cômodo.', false),
('p-deep-work', 2, 'Timer 90m: Foque em uma tarefa complexa.', false),
('p-deep-work', 3, 'Descanso Ativo: 20 minutos de descompressão.', false);

-- Physio Sigh Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-physio-sigh', 1, 'Inale Duas Vezes: Uma profunda, uma curta.', false),
('p-physio-sigh', 2, 'Exale Longamente: Solte o ar pela boca devagar.', false),
('p-physio-sigh', 3, 'Repita: Faça 1 a 3 ciclos.', false);

-- Phone Gray Steps
INSERT INTO public.protocol_steps (protocol_id, step_order, instruction, is_optional) VALUES
('p-phone-gray', 1, 'Configurar: Acessibilidade > Filtros de Cor > Escala de Cinza.', false),
('p-phone-gray', 2, 'Manter: Mantenha ativo 90% do dia.', false);

