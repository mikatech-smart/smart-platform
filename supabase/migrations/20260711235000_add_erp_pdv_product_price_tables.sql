-- Migration: add price formation and multiple price tables to ERP/PDV products.
-- Scope: preserve main sale price and prepare price change history.

alter table public.erp_pdv_produtos
  add column if not exists preco_atacado numeric(12, 2) not null default 0,
  add column if not exists preco_revenda numeric(12, 2) not null default 0,
  add column if not exists preco_personalizado numeric(12, 2) not null default 0,
  add column if not exists formacao_preco_tipo text not null default 'manual'
    check (formacao_preco_tipo in ('manual', 'percentual_custo')),
  add column if not exists percentual_preco numeric(12, 4) not null default 0,
  add column if not exists historico_precos jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
