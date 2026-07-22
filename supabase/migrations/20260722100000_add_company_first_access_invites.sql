-- Sprint 227.5L: convites de primeiro acesso do administrador da empresa.
create table if not exists public.company_first_access_invites (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  claimed_at timestamptz,
  claim_id uuid,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists company_first_access_invites_empresa_idx on public.company_first_access_invites (empresa_id, created_at desc);
create index if not exists company_first_access_invites_active_idx on public.company_first_access_invites (empresa_id, expires_at) where used_at is null and revoked_at is null;
alter table public.company_first_access_invites enable row level security;
revoke all on public.company_first_access_invites from anon, authenticated;

create or replace function public.claim_company_first_access_invite(p_token_hash text)
returns table (invite_id uuid, empresa_id uuid, empresa_slug text, empresa_nome text, claim_id uuid)
language plpgsql security definer set search_path = public
as $$
declare v_claim_id uuid := gen_random_uuid();
begin
  return query
  update public.company_first_access_invites invite
     set claimed_at = now(), claim_id = v_claim_id
    from public.empresas empresa
   where invite.token_hash = p_token_hash and invite.empresa_id = empresa.id
     and invite.expires_at > now() and invite.claimed_at is null
     and invite.used_at is null and invite.revoked_at is null
  returning invite.id, invite.empresa_id, empresa.slug, empresa.nome, invite.claim_id;
end;
$$;

create or replace function public.complete_company_first_access_invite(p_invite_id uuid, p_claim_id uuid)
returns boolean language sql security definer set search_path = public
as $$
  update public.company_first_access_invites set used_at = now()
   where id = p_invite_id and claim_id = p_claim_id and claimed_at is not null and used_at is null
  returning true;
$$;

create or replace function public.release_company_first_access_invite(p_invite_id uuid, p_claim_id uuid)
returns boolean language sql security definer set search_path = public
as $$
  update public.company_first_access_invites set claimed_at = null, claim_id = null
   where id = p_invite_id and claim_id = p_claim_id and used_at is null
  returning true;
$$;

revoke all on function public.claim_company_first_access_invite(text) from public, anon, authenticated;
revoke all on function public.complete_company_first_access_invite(uuid, uuid) from public, anon, authenticated;
revoke all on function public.release_company_first_access_invite(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_company_first_access_invite(text) to service_role;
grant execute on function public.complete_company_first_access_invite(uuid, uuid) to service_role;
grant execute on function public.release_company_first_access_invite(uuid, uuid) to service_role;
notify pgrst, 'reload schema';
