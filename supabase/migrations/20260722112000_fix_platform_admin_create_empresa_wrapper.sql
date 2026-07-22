-- O wrapper publico delega ao schema privado sem expor esse schema ao cliente.

create or replace function public.platform_admin_create_empresa(p_dados jsonb)
returns public.empresas
language sql
security definer
set search_path = pg_catalog, public
as $$
  select private.platform_admin_create_empresa(p_dados);
$$;

revoke execute on function public.platform_admin_create_empresa(jsonb) from public, anon, authenticated;
grant execute on function public.platform_admin_create_empresa(jsonb) to authenticated;

notify pgrst, 'reload schema';
