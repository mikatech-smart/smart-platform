-- Primeiro acesso: dependencias minimas para vincular Auth ao usuario ERP.
-- Nao reaplica nem altera migrations historicas.

alter table public.erp_pdv_usuarios
  add column if not exists auth_user_id uuid,
  add column if not exists login text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'erp_pdv_usuarios_auth_user_id_fk'
      and conrelid = 'public.erp_pdv_usuarios'::regclass
  ) then
    alter table public.erp_pdv_usuarios
      add constraint erp_pdv_usuarios_auth_user_id_fk
      foreign key (auth_user_id)
      references auth.users (id)
      on delete set null;
  end if;
end $$;

create unique index if not exists erp_pdv_usuarios_auth_user_id_unique_idx
  on public.erp_pdv_usuarios (auth_user_id)
  where auth_user_id is not null;

notify pgrst, 'reload schema';
