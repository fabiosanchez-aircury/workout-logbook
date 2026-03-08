-- Dave has edit access to Carol's profile (coach scenario)
insert into public.profile_shares (owner_id, shared_with_id, token, permission)
select
  (select id from auth.users where email = 'carol@dev.local'),
  (select id from auth.users where email = 'dave@dev.local'),
  'dave-coach-token-xyz789',
  'edit'
on conflict (token) do nothing;

-- Carol has a public read link (anyone with token can view)
insert into public.profile_shares (owner_id, shared_with_id, token, permission)
select
  (select id from auth.users where email = 'carol@dev.local'),
  null,
  'carol-public-read-token-def456',
  'read'
on conflict (token) do nothing;
