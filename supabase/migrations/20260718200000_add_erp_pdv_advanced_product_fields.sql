alter table public.erp_pdv_produtos
  add column if not exists descricao_complementar text not null default '',
  add column if not exists subcategoria text not null default '',
  add column if not exists fabricante text not null default '',
  add column if not exists estoque_maximo numeric(12,3) not null default 0,
  add column if not exists controla_estoque boolean not null default true,
  add column if not exists preco_promocional numeric(12,2) not null default 0,
  add column if not exists custo_medio numeric(12,2) not null default 0,
  add column if not exists cest text not null default '',
  add column if not exists cfop_padrao text not null default '',
  add column if not exists origem text not null default '',
  add column if not exists codigo_fiscal text not null default '',
  add column if not exists fornecedor_principal_id uuid references public.erp_pdv_fornecedores(id) on delete set null,
  add column if not exists peso numeric(12,3) not null default 0,
  add column if not exists altura numeric(12,3) not null default 0,
  add column if not exists largura numeric(12,3) not null default 0,
  add column if not exists comprimento numeric(12,3) not null default 0;

create index if not exists erp_pdv_produtos_empresa_fornecedor_idx
  on public.erp_pdv_produtos (empresa_id, fornecedor_principal_id);

notify pgrst, 'reload schema';
