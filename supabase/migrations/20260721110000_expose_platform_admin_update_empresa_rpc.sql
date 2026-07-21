-- Sprint 227.5C.2: wrapper RPC exposto pela API.
-- A autorizacao permanece na funcao privada existente.

create or replace function public.platform_admin_update_empresa(
  p_empresa_id uuid,
  p_dados jsonb
)
returns public.empresas
language sql
security definer
set search_path = pg_catalog, public
as $$
  select private.platform_admin_update_empresa(p_empresa_id, p_dados);
$$;

revoke all on function public.platform_admin_update_empresa(uuid, jsonb) from public;
grant execute on function public.platform_admin_update_empresa(uuid, jsonb) to authenticated;

notify pgrst, 'reload schema';
