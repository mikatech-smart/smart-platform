-- Migration: add optional customer identification to ERP/PDV sales.
-- Scope: customer registration/search during POS sale. No credit/crediario.

create table if not exists public.erp_pdv_clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  cpf_cnpj text not null default '',
  telefone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  endereco text not null default '',
  observacoes text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_pdv_vendas
  add column if not exists cliente_id uuid references public.erp_pdv_clientes(id) on delete set null;

create index if not exists erp_pdv_clientes_empresa_nome_idx
  on public.erp_pdv_clientes (empresa_id, nome);

create index if not exists erp_pdv_clientes_empresa_cpf_cnpj_idx
  on public.erp_pdv_clientes (empresa_id, cpf_cnpj)
  where cpf_cnpj <> '';

create index if not exists erp_pdv_clientes_empresa_telefone_idx
  on public.erp_pdv_clientes (empresa_id, telefone)
  where telefone <> '';

create index if not exists erp_pdv_vendas_empresa_cliente_idx
  on public.erp_pdv_vendas (empresa_id, cliente_id, finalizada_em desc);

alter table public.erp_pdv_clientes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'erp_pdv_clientes'
      and policyname = 'Permitir acesso operacional erp_pdv_clientes'
  ) then
    create policy "Permitir acesso operacional erp_pdv_clientes"
      on public.erp_pdv_clientes
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;

notify pgrst, 'reload schema';
