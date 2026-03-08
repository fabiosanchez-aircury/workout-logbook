-- Create auth schema (GoTrue expects it to exist before running its own migrations)
create schema if not exists auth;
grant all on schema auth to postgres;

-- Roles needed by PostgREST and Supabase SDK
-- (pre-exist in supabase/postgres but not in vanilla postgres)
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
end $$;

do $$ begin
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end $$;

do $$ begin
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

-- Grant public schema access to roles
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
