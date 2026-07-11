-- Migration: allow physical deletion of files from the empresas storage bucket.
-- Required by upload flows that remove or replace files through the public app.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Permitir excluir arquivos do bucket empresas'
  ) then
    create policy "Permitir excluir arquivos do bucket empresas"
      on storage.objects
      for delete
      to anon, authenticated
      using (bucket_id = 'empresas');
  end if;
end $$;
