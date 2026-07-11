-- Sprint 153 - ERP/PDV: configuracao de impressao por empresa

alter table public.empresas
  add column if not exists erp_pdv_config jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
