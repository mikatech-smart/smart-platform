-- Migration: add optional commercial fields to empresas.
-- Review before running in Supabase.

begin;

alter table public.empresas
  add column if not exists horario_atendimento text,
  add column if not exists google_review_url text;

commit;

-- Rollback, if needed:
-- begin;
-- alter table public.empresas
--   drop column if exists google_review_url,
--   drop column if exists horario_atendimento;
-- commit;
