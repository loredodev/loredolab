
-- =============================================================================
-- LOREDOLAB - FULL SUPABASE SETUP SCRIPT
-- Rode este script no SQL Editor do Supabase para configurar todo o banco.
-- =============================================================================

-- 1. Habilitar UUIDs (Identificadores únicos)
create extension if not exists "uuid-ossp";

-- 2. Limpeza (Opcional - remove tabelas antigas se existirem para recomeçar do zero)
-- Descomente as linhas abaixo se quiser resetar o banco (CUIDADO: APAGA DADOS)
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop table if exists public.metric_events;
-- drop table if exists public.experiments;
-- drop table if exists public.protocols;
-- drop table if exists public.users;

-- =============================================================================
-- 3. TABELAS PRINCIPAIS
-- =============================================================================

-- Tabela de Usuários (Espelho público do auth.users)
create table public.users (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text default 'SCIENTIST', -- 'SCIENTIST', 'MANAGER'
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de Protocolos (Biblioteca)
create table public.protocols (
  id text primary key, -- IDs manuais como 'pomodoro-classic'
  title text not null,
  description text,
  tags text[],
  evidence_level text, -- 'GOLD', 'SILVER', 'BRONZE'
  is_custom boolean default false,
  created_by uuid references public.users(id), -- Null se for protocolo do sistema
  created_at timestamptz default now()
);

-- Tabela de Experimentos (Onde a mágica acontece)
create table public.experiments (
  id text primary key, -- IDs gerados pelo front como 'exp-172...'
  user_id uuid not null references public.users(id) on delete cascade,
  protocol_id text not null, -- Referência flexível para permitir protocolos do sistema
  status text not null, -- 'BASELINE', 'INTERVENTION', 'COMPLETED'
  start_date timestamptz not null,
  end_date timestamptz,
  baseline_logs jsonb default '[]', -- Armazenamos os logs como JSONB para flexibilidade no MVP
  intervention_logs jsonb default '[]',
  ai_analysis jsonb, -- Resultado da IA
  created_at timestamptz default now()
);

-- =============================================================================
-- 4. AUTOMAÇÃO DE AUTH (CRUCIAL PARA O LOGIN FUNCIONAR)
-- =============================================================================

-- Função que roda sempre que um usuário é criado no Auth do Supabase
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'SCIENTIST')
  );
  return new;
end;
$$ language plpgsql security definer;

-- O Gatilho que dispara a função acima
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- 5. SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
alter table public.users enable row level security;
alter table public.protocols enable row level security;
alter table public.experiments enable row level security;

-- Políticas de Acesso

-- USERS: Cada um vê e edita apenas o seu perfil
create policy "Users can view own profile" 
  on public.users for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.users for update 
  using (auth.uid() = id);

-- PROTOCOLS: Todos veem protocolos do sistema (created_by is null) ou seus próprios
create policy "View system and own protocols" 
  on public.protocols for select 
  using (created_by is null or created_by = auth.uid());

create policy "Create custom protocols" 
  on public.protocols for insert 
  with check (auth.uid() = created_by);

-- EXPERIMENTS: Totalmente privado para o dono
create policy "Users manage own experiments" 
  on public.experiments for all 
  using (auth.uid() = user_id);

-- =============================================================================
-- 6. DADOS INICIAIS (SEED - OPCIONAL)
-- =============================================================================

-- Inserir alguns protocolos do sistema para garantir que não comece vazio
-- (Apenas se não estiver usando o arquivo JSON do front-end como fonte única)
insert into public.protocols (id, title, description, evidence_level, is_custom)
values 
('pomodoro-classic', 'Técnica Pomodoro', '25min foco, 5min pausa.', 'SILVER', false),
('nsdr', 'NSDR (Non-Sleep Deep Rest)', 'Recuperação profunda em 20min.', 'GOLD', false)
on conflict (id) do nothing;

