-- Sprint 151 - ERP/PDV: operador responsavel pela venda

alter table public.erp_pdv_vendas
  add column if not exists operador text not null default '';

create index if not exists erp_pdv_vendas_empresa_finalizada_idx
  on public.erp_pdv_vendas (empresa_id, finalizada_em desc);

notify pgrst, 'reload schema';
