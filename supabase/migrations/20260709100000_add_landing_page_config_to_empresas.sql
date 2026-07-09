-- Migration: add Landing Page configuration storage to empresas.
-- Stores all editable landing sections in a single JSONB payload.

alter table public.empresas
  add column if not exists landing_page_config jsonb not null default '{}'::jsonb;
