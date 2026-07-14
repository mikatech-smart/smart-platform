-- Sprint 190 - cadastro administrativo de colaboradores com funcoes acumulaveis.

alter table public.erp_pdv_usuarios
  add column if not exists nome_exibicao text not null default '',
  add column if not exists funcoes text[] not null default '{}'::text[];

create index if not exists erp_pdv_usuarios_empresa_funcoes_idx
  on public.erp_pdv_usuarios using gin (funcoes);

notify pgrst, 'reload schema';
