-- Dave has edit access to Carol's profile (coach scenario)
insert into public.profile_shares (owner_id, shared_with_id, token, permission)
values (
  '00000000-0000-0000-0000-000000000003', -- Carol (owner)
  '00000000-0000-0000-0000-000000000004', -- Dave (shared with)
  'dave-coach-token-xyz789',
  'edit'
);

-- Carol has a public read link (anyone with token can view)
insert into public.profile_shares (owner_id, shared_with_id, token, permission)
values (
  '00000000-0000-0000-0000-000000000003', -- Carol
  null, -- anyone with token
  'carol-public-read-token-def456',
  'read'
);
