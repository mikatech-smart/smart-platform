-- Sprint 163 - ERP/PDV: usuarios, perfis e permissoes operacionais.
-- Mantem o login geral aberto durante desenvolvimento e vincula operadores quando informados.

create table if not exists public.erp_pdv_usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null default '',
  email text not null default '',
  telefone text not null default '',
  perfil text not null default 'caixa'
    check (perfil in ('administrador', 'gerente', 'caixa', 'vendedor', 'estoque')),
  modulo_inicial text not null default 'pdv'
    check (modulo_inicial in ('pdv', 'caixa', 'trocas', 'estoque', 'relatorios')),
  permissoes jsonb not null default '{}'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_pdv_vendas
  add column if not exists operador_usuario_id uuid references public.erp_pdv_usuarios(id) on delete set null;

alter table public.erp_pdv_caixas
  add column if not exists operador_usuario_id uuid references public.erp_pdv_usuarios(id) on delete set null;

alter table public.erp_pdv_caixa_movimentacoes
  add column if not exists operador_usuario_id uuid references public.erp_pdv_usuarios(id) on delete set null;

alter table public.erp_pdv_devolucoes
  add column if not exists operador_usuario_id uuid references public.erp_pdv_usuarios(id) on delete set null;

alter table public.erp_pdv_movimentacoes
  add column if not exists erp_pdv_usuario_id uuid references public.erp_pdv_usuarios(id) on delete set null;

create index if not exists erp_pdv_usuarios_empresa_nome_idx
  on public.erp_pdv_usuarios (empresa_id, ativo, nome);

create index if not exists erp_pdv_usuarios_empresa_perfil_idx
  on public.erp_pdv_usuarios (empresa_id, perfil);

create index if not exists erp_pdv_vendas_operador_usuario_idx
  on public.erp_pdv_vendas (empresa_id, operador_usuario_id, finalizada_em desc);

create index if not exists erp_pdv_movimentacoes_usuario_idx
  on public.erp_pdv_movimentacoes (empresa_id, erp_pdv_usuario_id, created_at desc);

alter table public.erp_pdv_usuarios enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'erp_pdv_usuarios'
      and policyname = 'Permitir acesso operacional erp_pdv_usuarios'
  ) then
    create policy "Permitir acesso operacional erp_pdv_usuarios"
      on public.erp_pdv_usuarios
      for all
      using (true)
      with check (true);
  end if;
end $$;

notify pgrst, 'reload schema';
