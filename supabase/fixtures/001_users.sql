-- Dev fixture users (password: dev-password-123)
-- These are only loaded in local dev via `make db-fixtures`

-- Note: Supabase local uses the default password hashing.
-- Insert directly into auth.users for dev purposes.

insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) values
  (
    '00000000-0000-0000-0000-000000000001',
    'alice@dev.local',
    crypt('dev-password-123', gen_salt('bf')),
    now(),
    '{"full_name": "Alice", "avatar_url": null}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'bob@dev.local',
    crypt('dev-password-123', gen_salt('bf')),
    now(),
    '{"full_name": "Bob", "avatar_url": null}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'carol@dev.local',
    crypt('dev-password-123', gen_salt('bf')),
    now(),
    '{"full_name": "Carol", "avatar_url": null}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'dave@dev.local',
    crypt('dev-password-123', gen_salt('bf')),
    now(),
    '{"full_name": "Dave", "avatar_url": null}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'eve@dev.local',
    crypt('dev-password-123', gen_salt('bf')),
    now(),
    '{"full_name": "Eve", "avatar_url": null}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  );
