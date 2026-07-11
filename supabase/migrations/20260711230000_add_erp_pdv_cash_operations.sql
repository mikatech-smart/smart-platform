-- Sprint 154 - ERP/PDV: caixa operacional, suprimento e sangria

alter table public.erp_pdv_caixas
  add column if not exists operador text not null default '',
  add column if not exists valor_informado numeric(12, 2) not null default 0,
  add column if not exists diferenca numeric(12, 2) not null default 0;

create table if not exists public.erp_pdv_caixa_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  caixa_id uuid not null references public.erp_pdv_caixas(id) on delete cascade,
  tipo text not null check (tipo in ('suprimento', 'sangria')),
  valor numeric(12, 2) not null default 0,
  operador text not null default '',
  observacao text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists erp_pdv_caixa_movimentacoes_caixa_idx
  on public.erp_pdv_caixa_movimentacoes (empresa_id, caixa_id, created_at desc);

alter table public.erp_pdv_caixa_movimentacoes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'erp_pdv_caixa_movimentacoes'
      and policyname = 'Permitir acesso operacional erp_pdv_caixa_movimentacoes'
  ) then
    create policy "Permitir acesso operacional erp_pdv_caixa_movimentacoes"
      on public.erp_pdv_caixa_movimentacoes
      for all to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;

notify pgrst, 'reload schema';
