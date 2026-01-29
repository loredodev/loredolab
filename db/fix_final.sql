
-- ====================================================================================
-- FINAL FIX SCRIPT - LOREDOLAB
-- Resolve erro "Foreign Key Violation (User missing)" e "Permission Denied".
-- ====================================================================================

-- 1. BACKFILL USERS (Crucial: Cria usuários que existem no Auth mas não na Public)
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Scientist'), 
    'SCIENTIST'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. REINICIAR RLS (Permissões Totais para Dono)
-- Derruba políticas antigas e cria novas ultra-permissivas para o dono do dado.

-- Tabela: hydration_logs
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.hydration_logs;
DROP POLICY IF EXISTS "Manage Own Hydration" ON public.hydration_logs;
CREATE POLICY "Enable all for users based on user_id" ON public.hydration_logs
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela: user_library
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.user_library;
DROP POLICY IF EXISTS "Manage Own Library" ON public.user_library;
CREATE POLICY "Enable all for users based on user_id" ON public.user_library
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela: user_challenges
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.user_challenges;
DROP POLICY IF EXISTS "Manage Own Challenges" ON public.user_challenges;
CREATE POLICY "Enable all for users based on user_id" ON public.user_challenges
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela: challenges (Leitura Pública)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read Challenges" ON public.challenges;
CREATE POLICY "Read Challenges" ON public.challenges FOR SELECT USING (true);

-- 3. GARANTIR DESAFIOS BÁSICOS
INSERT INTO public.challenges (id, category, title_pt, title_en, desc_pt, desc_en, reward, xp_points) VALUES
('prod-1', 'productivity', 'Desafio Pomodoro', 'Pomodoro Challenge', 'Complete 5 ciclos de Pomodoro.', 'Complete 5 Pomodoro cycles.', '⏱️', 50),
('prod-2', 'productivity', 'Foco de 60 Minutos', '60-Minute Focus', 'Trabalhe 60 min sem parar.', 'Work 60 min non-stop.', '🔥', 100),
('prod-3', 'productivity', 'Trabalho Profundo', 'Deep Work Challenge', '4 blocos de 90 min.', '4 blocks of 90 min.', '🧠', 150),
('health-1', 'health', 'Desafio de Hidratação', 'Hydration Challenge', 'Beba 2L de água por dia.', 'Drink 2L of water daily.', '💧', 100),
('health-2', 'health', 'Desafio da Postura', 'Posture Challenge', 'Postura correta por 4h.', 'Correct posture for 4h.', '🪑', 50),
('mental-1', 'mental-health', 'Gratidão', 'Gratitude Challenge', 'Escreva 3 gratidões por dia.', 'Write 3 gratitudes daily.', '🙏', 100),
('focus-1', 'focus', '100% Foco', '100% Focus', '2h seguidas focado.', '2h straight focus.', '💯', 120),
('relax-1', 'relaxation', 'Banho Frio', 'Cold Shower', '1 min banho frio.', '1 min cold shower.', '🚿', 50)
ON CONFLICT (id) DO NOTHING;
