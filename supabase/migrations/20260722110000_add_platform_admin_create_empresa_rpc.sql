-- Sprint 227.5N: criação administrativa de empresas sem bypass da RLS.

create or replace function private.platform_admin_create_empresa(p_dados jsonb)
returns public.empresas
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_empresa public.empresas;
  v_admin boolean;
  v_nome text := nullif(trim(p_dados ->> 'nome'), '');
  v_slug text := nullif(trim(p_dados ->> 'slug'), '');
  v_tipo text := coalesce(nullif(trim(p_dados ->> 'tipo'), ''), 'mikatech');
begin
  select exists (
    select 1
    from public.platform_admin_users p
    where p.auth_user_id = auth.uid()
      and p.ativo is true
  ) into v_admin;

  if not v_admin then
    raise exception 'Acesso negado para criar empresas.' using errcode = '42501';
  end if;

  if p_dados is null or jsonb_typeof(p_dados) <> 'object'
     or v_nome is null or v_slug is null then
    raise exception 'Nome e slug sao obrigatorios.' using errcode = '22023';
  end if;

  insert into public.empresas (
    nome, slug, tipo, categoria, descricao, telefone, whatsapp, email,
    instagram, facebook, site, endereco, pix, pix_nome, pix_chave,
    wifi_nome, wifi_senha, logo, banner, plano, recursos_contratados, ativo
  ) values (
    v_nome, v_slug, v_tipo,
    coalesce(p_dados ->> 'categoria', ''),
    coalesce(p_dados ->> 'descricao', ''),
    coalesce(p_dados ->> 'telefone', ''),
    coalesce(p_dados ->> 'whatsapp', ''),
    coalesce(p_dados ->> 'email', ''),
    coalesce(p_dados ->> 'instagram', ''),
    coalesce(p_dados ->> 'facebook', ''),
    coalesce(p_dados ->> 'site', ''),
    coalesce(p_dados ->> 'endereco', ''),
    coalesce(p_dados ->> 'pix', ''),
    coalesce(p_dados ->> 'pix_nome', ''),
    coalesce(p_dados ->> 'pix_chave', ''),
    coalesce(p_dados ->> 'wifi_nome', ''),
    coalesce(p_dados ->> 'wifi_senha', ''),
    coalesce(p_dados ->> 'logo', ''),
    coalesce(p_dados ->> 'banner', ''),
    coalesce(p_dados ->> 'plano', 'starter'),
    coalesce(p_dados -> 'recursos_contratados', '{}'::jsonb),
    coalesce((p_dados ->> 'ativo')::boolean, true)
  ) returning * into v_empresa;

  return v_empresa;
exception
  when unique_violation then
    raise exception 'Slug de empresa ja cadastrado.' using errcode = '23505';
end;
$$;

create or replace function public.platform_admin_create_empresa(p_dados jsonb)
returns public.empresas
language sql
security invoker
set search_path = pg_catalog, public
as $$
  select private.platform_admin_create_empresa(p_dados);
$$;

revoke all on function private.platform_admin_create_empresa(jsonb) from public;
revoke all on function public.platform_admin_create_empresa(jsonb) from public;
grant execute on function public.platform_admin_create_empresa(jsonb) to authenticated;

notify pgrst, 'reload schema';
