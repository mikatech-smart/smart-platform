-- Sprint 160 - ERP/PDV: importacao de XML da NF-e para compras.
-- Escopo: armazenar XML importado, dados fiscais lidos e vinculos de itens.

alter table public.erp_pdv_entradas
  add column if not exists chave_acesso text not null default '',
  add column if not exists origem text not null default 'manual',
  add column if not exists xml_url text not null default '',
  add column if not exists xml_storage_path text not null default '',
  add column if not exists xml_resumo jsonb not null default '{}'::jsonb;

alter table public.erp_pdv_entrada_itens
  add column if not exists codigo_fornecedor text not null default '',
  add column if not exists gtin text not null default '',
  add column if not exists ncm text not null default '',
  add column if not exists cfop text not null default '',
  add column if not exists unidade text not null default '',
  add column if not exists tributos jsonb not null default '{}'::jsonb;

create index if not exists erp_pdv_entradas_empresa_chave_acesso_idx
  on public.erp_pdv_entradas (empresa_id, chave_acesso)
  where chave_acesso <> '';

create index if not exists erp_pdv_entrada_itens_empresa_gtin_idx
  on public.erp_pdv_entrada_itens (empresa_id, gtin)
  where gtin <> '';

notify pgrst, 'reload schema';
