-- Remove o EXECUTE padrao concedido ao anon pelo PostgREST.

revoke execute on function public.platform_admin_create_empresa(jsonb) from public, anon, authenticated;
grant execute on function public.platform_admin_create_empresa(jsonb) to authenticated;

notify pgrst, 'reload schema';
