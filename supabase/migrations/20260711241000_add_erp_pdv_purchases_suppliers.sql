-- Migration: add suppliers and purchase entries to ERP/PDV.
-- Scope: manual goods receipt. No XML import and no financial module.

create table if not exists public.erp_pdv_fornecedores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  razao_social text not null,
  nome_fantasia text not null default '',
  cpf_cnpj text not null default '',
  inscricao_estadual text not null default '',
  contato text not null default '',
  telefone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  endereco text not null default '',
  observacoes text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_pdv_entradas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  fornecedor_id uuid references public.erp_pdv_fornecedores(id) on delete set null,
  fornecedor_nome text not null default '',
  numero_nota text not null default '',
  chave_acesso text not null default '',
  data_compra date not null default current_date,
  observacoes text not null default '',
  total_produtos numeric(12, 2) not null default 0,
  total_descontos numeric(12, 2) not null default 0,
  total_frete numeric(12, 2) not null default 0,
  total_outras_despesas numeric(12, 2) not null default 0,
  total_entrada numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_pdv_entrada_itens (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  entrada_id uuid not null references public.erp_pdv_entradas(id) on delete cascade,
  produto_id uuid not null references public.erp_pdv_produtos(id) on delete cascade,
  descricao text not null,
  quantidade numeric(12, 3) not null default 0,
  custo_unitario numeric(12, 2) not null default 0,
  desconto numeric(12, 2) not null default 0,
  frete numeric(12, 2) not null default 0,
  outras_despesas numeric(12, 2) not null default 0,
  custo_total numeric(12, 2) not null default 0,
  estoque_anterior numeric(12, 3) not null default 0,
  estoque_posterior numeric(12, 3) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.erp_pdv_estoques
  add column if not exists ultimo_custo numeric(12, 2) not null default 0,
  add column if not exists custo_medio numeric(12, 2) not null default 0;

create index if not exists erp_pdv_fornecedores_empresa_nome_idx
  on public.erp_pdv_fornecedores (empresa_id, razao_social);

create index if not exists erp_pdv_fornecedores_empresa_cpf_cnpj_idx
  on public.erp_pdv_fornecedores (empresa_id, cpf_cnpj)
  where cpf_cnpj <> '';

create index if not exists erp_pdv_entradas_empresa_data_idx
  on public.erp_pdv_entradas (empresa_id, data_compra desc, created_at desc);

create index if not exists erp_pdv_entrada_itens_empresa_entrada_idx
  on public.erp_pdv_entrada_itens (empresa_id, entrada_id);

alter table public.erp_pdv_fornecedores enable row level security;
alter table public.erp_pdv_entradas enable row level security;
alter table public.erp_pdv_entrada_itens enable row level security;

do $$
declare
  tabela text;
  politica text;
begin
  foreach tabela in array array[
    'erp_pdv_fornecedores',
    'erp_pdv_entradas',
    'erp_pdv_entrada_itens'
  ]
  loop
    politica := 'Permitir acesso operacional ' || tabela;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = tabela
        and policyname = politica
    ) then
      execute format(
        'create policy %I on public.%I for all to anon, authenticated using (true) with check (true)',
        politica,
        tabela
      );
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
