-- Sprint 226.1.3: identidades globais da plataforma, sem empresa_id.
-- Esta migration nao cria o primeiro usuario Auth e nao deve conter senhas.

create table if not exists public.platform_admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete restrict,
  email text not null,
  nome text not null,
  role text not null check (role in ('super_admin', 'platform_admin')),
  ativo boolean not null default true,
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now()),
  ultimo_acesso_em timestamptz
);

create unique index if not exists platform_admin_users_auth_user_id_uidx
  on public.platform_admin_users (auth_user_id);

create unique index if not exists platform_admin_users_email_uidx
  on public.platform_admin_users (lower(btrim(email)));

alter table public.platform_admin_users enable row level security;
grant select on table public.platform_admin_users to authenticated;

drop policy if exists platform_admin_users_select_self on public.platform_admin_users;
create policy platform_admin_users_select_self
  on public.platform_admin_users
  for select to authenticated
  using (auth.uid() = auth_user_id and ativo is true);

create schema if not exists private;

create or replace function private.current_platform_admin_context()
returns table (admin_id uuid, email text, nome text, role text)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p.id, p.email, p.nome, p.role
  from public.platform_admin_users p
  where p.auth_user_id = auth.uid()
    and p.ativo is true
  limit 1
$$;

revoke all on function private.current_platform_admin_context() from public;
grant execute on function private.current_platform_admin_context() to authenticated;

notify pgrst, 'reload schema';
