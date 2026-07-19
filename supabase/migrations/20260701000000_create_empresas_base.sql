-- Base estrutural local para public.empresas.
-- Nao aplicar sem comparar com o schema real do projeto Supabase.
-- As colunas de configuracoes adicionadas por migrations posteriores ficam fora daqui.

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  slug text not null,
  tipo text not null default 'mikatech',
  categoria text not null default '',
  descricao text not null default '',
  telefone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  site text not null default '',
  endereco text not null default '',
  pix text not null default '',
  logo text not null default '',
  banner text not null default '',
  plano text not null default 'starter',
  recursos_contratados jsonb not null default '{}'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint empresas_slug_unique unique (slug)
);

create index if not exists empresas_ativo_idx
  on public.empresas (ativo);

-- A base nao concede acesso anonimo nem policies globais.
