-- Storage bucket and policies
-- Only executes if the storage schema exists (Supabase cloud or storage-api running)
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then

    insert into storage.buckets (id, name)
      values ('workout-photos', 'workout-photos')
      on conflict do nothing;

    if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Users can upload own photos') then
      execute $p$ create policy "Users can upload own photos" on storage.objects for insert
        with check (bucket_id = 'workout-photos' and auth.uid()::text = (storage.foldername(name))[1]) $p$;
    end if;

    if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Users can read own photos') then
      execute $p$ create policy "Users can read own photos" on storage.objects for select
        using (bucket_id = 'workout-photos' and auth.uid()::text = (storage.foldername(name))[1]) $p$;
    end if;

    if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Users can delete own photos') then
      execute $p$ create policy "Users can delete own photos" on storage.objects for delete
        using (bucket_id = 'workout-photos' and auth.uid()::text = (storage.foldername(name))[1]) $p$;
    end if;

  end if;
end $$;
