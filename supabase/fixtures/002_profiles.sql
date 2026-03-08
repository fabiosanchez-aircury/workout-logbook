-- Update fixture profiles (trigger creates them, we update details)
update public.profiles set
  username = 'alice',
  display_name = 'Alice',
  bio = 'Just getting started!',
  is_public = false
where id = '00000000-0000-0000-0000-000000000001';

update public.profiles set
  username = 'bob',
  display_name = 'Bob',
  bio = 'Training for 3 months. PPL split.',
  is_public = false
where id = '00000000-0000-0000-0000-000000000002';

update public.profiles set
  username = 'carol',
  display_name = 'Carol',
  bio = 'Powerlifter. Sharing my progress publicly.',
  is_public = true,
  share_token = 'carol-share-token-abc123'
where id = '00000000-0000-0000-0000-000000000003';

update public.profiles set
  username = 'dave',
  display_name = 'Dave',
  bio = 'Strength coach.',
  is_public = false
where id = '00000000-0000-0000-0000-000000000004';

update public.profiles set
  username = 'eve',
  display_name = 'Eve',
  bio = '5 years of training. Lots of data.',
  is_public = false
where id = '00000000-0000-0000-0000-000000000005';
