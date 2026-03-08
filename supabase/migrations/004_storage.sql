-- Storage bucket for workout photos
insert into storage.buckets (id, name, public) values ('workout-photos', 'workout-photos', false);

-- RLS for storage
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'workout-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own photos"
  on storage.objects for select
  using (
    bucket_id = 'workout-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'workout-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
