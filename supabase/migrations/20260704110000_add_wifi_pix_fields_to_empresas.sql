-- Migration: add optional Wi-Fi and PIX fields to empresas.
-- Review before running in Supabase.

begin;

alter table public.empresas
  add column if not exists wifi_nome text,
  add column if not exists wifi_senha text,
  add column if not exists pix_nome text,
  add column if not exists pix_chave text;

commit;

-- Rollback, if needed:
-- begin;
-- alter table public.empresas
--   drop column if exists pix_chave,
--   drop column if exists pix_nome,
--   drop column if exists wifi_senha,
--   drop column if exists wifi_nome;
-- commit;
