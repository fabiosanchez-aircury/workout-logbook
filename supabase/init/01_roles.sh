#!/bin/bash
set -e

# DB init script — runs as postgres superuser during first-boot initialization.
# Creates all roles needed by GoTrue and PostgREST.
# POSTGRES_PASSWORD is provided by the postgres Docker image.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Auth schema (GoTrue expects it to exist)
  create schema if not exists auth;
  grant all on schema auth to postgres;

  -- supabase_auth_admin: GoTrue connects with this role
  create role supabase_auth_admin noinherit login password '${POSTGRES_PASSWORD}';
  grant all on schema auth to supabase_auth_admin;
  alter role supabase_auth_admin set search_path = auth, public;

  -- authenticator: PostgREST connects with this role, then switches to anon/authenticated
  create role authenticator noinherit login password '${POSTGRES_PASSWORD}';

  -- anon: unauthenticated API requests
  create role anon nologin noinherit;

  -- authenticated: logged-in API requests
  create role authenticated nologin noinherit;

  -- service_role: bypasses RLS
  create role service_role nologin noinherit bypassrls;

  -- authenticator can switch to anon, authenticated, service_role
  grant anon, authenticated, service_role to authenticator;

  -- Public schema access
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
EOSQL
