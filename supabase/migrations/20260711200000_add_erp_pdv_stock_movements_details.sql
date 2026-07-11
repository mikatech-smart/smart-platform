-- Sprint 149 - ERP/PDV: detalhes operacionais de movimentacao de estoque

alter table public.erp_pdv_movimentacoes
  add column if not exists motivo text not null default '',
  add column if not exists usuario_responsavel text not null default '';

alter table public.erp_pdv_estoques
  add column if not exists ultima_movimentacao_em timestamptz;

create index if not exists erp_pdv_movimentacoes_empresa_tipo_created_idx
  on public.erp_pdv_movimentacoes (empresa_id, tipo, created_at desc);

notify pgrst, 'reload schema';
