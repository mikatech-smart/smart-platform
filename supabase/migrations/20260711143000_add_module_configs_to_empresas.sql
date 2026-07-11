-- Migration: add module configuration storage to empresas.
-- Stores editable module payloads as JSONB without changing existing records.

begin;

alter table public.empresas
  add column if not exists cardapio_config jsonb not null default '{}'::jsonb,
  add column if not exists catalogo_config jsonb not null default '{}'::jsonb,
  add column if not exists agendamento_config jsonb not null default '{}'::jsonb,
  add column if not exists wifi_marketing_config jsonb not null default '{}'::jsonb,
  add column if not exists fidelidade_config jsonb not null default '{}'::jsonb,
  add column if not exists crm_config jsonb not null default '{}'::jsonb,
  add column if not exists ia_config jsonb not null default '{}'::jsonb;

commit;
