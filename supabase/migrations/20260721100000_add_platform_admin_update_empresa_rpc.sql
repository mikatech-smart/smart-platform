-- Sprint 227.5C: atualizacao administrativa segura de empresas.
-- O SUPER_ADMIN usa esta funcao; usuarios ERP continuam sujeitos a RLS tenant.

create or replace function private.platform_admin_update_empresa(
  p_empresa_id uuid,
  p_dados jsonb
)
returns public.empresas
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_empresa public.empresas;
  v_set_clause text;
  v_admin boolean;
  v_allowed constant text[] := array[
    'nome', 'slug', 'categoria', 'tipo', 'descricao', 'telefone', 'whatsapp',
    'email', 'instagram', 'tiktok', 'youtube', 'kwai', 'facebook', 'site',
    'endereco', 'horario_atendimento', 'google_review_url', 'pix', 'pix_nome',
    'pix_chave', 'wifi_nome', 'wifi_senha', 'landing_page_config',
    'cardapio_config', 'catalogo_config', 'agendamento_config',
    'wifi_marketing_config', 'fidelidade_config', 'crm_config', 'erp_pdv_config',
    'logo', 'banner', 'ativo'
  ];
begin
  select exists (
    select 1
    from public.platform_admin_users p
    where p.auth_user_id = auth.uid()
      and p.ativo is true
  ) into v_admin;

  if not v_admin then
    raise exception 'Acesso negado para atualizar empresas.' using errcode = '42501';
  end if;

  if p_empresa_id is null or p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'Dados invalidos para atualizar empresa.' using errcode = '22023';
  end if;

  select string_agg(
    case
      when format_type(a.atttypid, a.atttypmod) = 'jsonb' then
        format('%I = ($1 -> %L)::jsonb', a.attname, a.attname)
      else
        format('%I = ($1 ->> %L)::%s', a.attname, a.attname, format_type(a.atttypid, a.atttypmod))
    end,
    ', '
    order by a.attnum
  )
  into v_set_clause
  from pg_catalog.pg_attribute a
  where a.attrelid = 'public.empresas'::regclass
    and a.attnum > 0
    and not a.attisdropped
    and a.attname = any(v_allowed)
    and p_dados ? a.attname;

  if v_set_clause is null then
    raise exception 'Nenhum campo permitido foi informado para atualizar empresa.' using errcode = '22023';
  end if;

  execute format(
    'update public.empresas set %s, updated_at = now() where id = $2 returning *',
    v_set_clause
  )
  into v_empresa
  using p_dados, p_empresa_id;

  if not found then
    raise exception 'Empresa nao encontrada.' using errcode = 'P0002';
  end if;

  return v_empresa;
end;
$$;

revoke all on function private.platform_admin_update_empresa(uuid, jsonb) from public;
grant execute on function private.platform_admin_update_empresa(uuid, jsonb) to authenticated;

notify pgrst, 'reload schema';
