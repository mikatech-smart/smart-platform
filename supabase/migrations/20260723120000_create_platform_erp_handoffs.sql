create table if not exists public.platform_erp_handoffs (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_by uuid not null references auth.users (id) on delete restrict,
  empresa_id uuid not null references public.empresas (id) on delete restrict,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '5 minutes'),
  consumed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists platform_erp_handoffs_expires_idx
  on public.platform_erp_handoffs (expires_at)
  where consumed_at is null;

alter table public.platform_erp_handoffs enable row level security;
revoke all on table public.platform_erp_handoffs from anon, authenticated;
