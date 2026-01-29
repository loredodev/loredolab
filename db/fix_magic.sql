
-- ====================================================================================
-- MAGIC FIX SCRIPT - LOREDOLAB
-- Rode isso no SQL Editor do Supabase para corrigir os erros de "Não salva nada".
-- ====================================================================================

-- 1. DESBLOQUEAR RLS (Permissões de Gravação)
-- Garante que o usuário logado (auth.uid) possa criar, ler, atualizar e deletar seus próprios registros.

-- Tabela: hydration_logs
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage Own Hydration" ON public.hydration_logs;
CREATE POLICY "Manage Own Hydration" ON public.hydration_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela: user_library
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage Own Library" ON public.user_library;
CREATE POLICY "Manage Own Library" ON public.user_library FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela: user_challenges
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage Own Challenges" ON public.user_challenges;
CREATE POLICY "Manage Own Challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. CORRIGIR ERRO DE DESAFIOS (Missing Foreign Keys)
-- Insere os desafios básicos na tabela 'challenges' para que você possa entrar neles sem erro.

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

-- 3. CONFIRMAR CRIAÇÃO DE USUÁRIO
-- Garante que novos usuários sejam criados automaticamente na tabela pública
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'SCIENTIST')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
