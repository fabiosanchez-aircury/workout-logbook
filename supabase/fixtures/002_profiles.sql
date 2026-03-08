-- Update fixture profiles (the insert trigger creates them, we just update details)
update public.profiles set username = 'alice', display_name = 'Alice', bio = 'Just getting started!', is_public = false
where id = (select id from auth.users where email = 'alice@dev.local');

update public.profiles set username = 'bob', display_name = 'Bob', bio = 'Training for 3 months. PPL split.', is_public = false
where id = (select id from auth.users where email = 'bob@dev.local');

update public.profiles set username = 'carol', display_name = 'Carol', bio = 'Powerlifter. Sharing my progress publicly.', is_public = true, share_token = 'carol-share-token-abc123'
where id = (select id from auth.users where email = 'carol@dev.local');

update public.profiles set username = 'dave', display_name = 'Dave', bio = 'Strength coach.', is_public = false
where id = (select id from auth.users where email = 'dave@dev.local');

update public.profiles set username = 'eve', display_name = 'Eve', bio = '5 years of training. Lots of data.', is_public = false
where id = (select id from auth.users where email = 'eve@dev.local');
