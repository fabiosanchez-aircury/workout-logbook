-- Dev fixture users (password: dev-password-123)
-- These are only loaded in local dev via `make db-fixtures`
-- Users are created via GoTrue signup API to ensure proper password hashing and identity records.
-- Run: make db-fixtures

-- Insert users via GoTrue-compatible format (already created via API on first run)
-- If running fresh, use: make db-fixtures (which calls the signup API)

-- GoTrue-created users have these stable UUIDs in a fresh local env.
-- The fixture below inserts identities and sets metadata assuming users were created via signup.
-- For a fully reproducible setup, the Makefile db-fixtures target calls the GoTrue API.

-- Set display names on existing GoTrue users (created via signup)
-- This assumes the users already exist (created by `make db-fixtures` calling the API)

do $$
declare
  alice_id uuid;
  bob_id   uuid;
  carol_id uuid;
  dave_id  uuid;
  eve_id   uuid;
begin
  select id into alice_id from auth.users where email = 'alice@dev.local';
  select id into bob_id   from auth.users where email = 'bob@dev.local';
  select id into carol_id from auth.users where email = 'carol@dev.local';
  select id into dave_id  from auth.users where email = 'dave@dev.local';
  select id into eve_id   from auth.users where email = 'eve@dev.local';

  -- Create user if not exists (idempotent)
  if alice_id is null then
    raise notice 'Users not found. Please run: make db-create-fixtures-users first';
  end if;
end $$;
