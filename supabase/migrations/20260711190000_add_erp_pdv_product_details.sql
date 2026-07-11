-- Migration: extend ERP/PDV products for daily product registration.
-- Scope: product details and image used by the Mikatech pilot.

alter table public.erp_pdv_produtos
  add column if not exists marca text not null default '',
  add column if not exists localizacao text not null default '',
  add column if not exists ncm text not null default '',
  add column if not exists observacoes text not null default '',
  add column if not exists imagem_url text not null default '';

notify pgrst, 'reload schema';
