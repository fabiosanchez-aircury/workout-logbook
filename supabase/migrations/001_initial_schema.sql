-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  is_public boolean not null default false,
  share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Routines
create table public.routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Routine days
create table public.routine_days (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  name text not null,
  position integer not null default 1,
  created_at timestamptz not null default now()
);

-- Exercise library
create table public.exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'compound',
  muscle_group text,
  equipment text,
  is_global boolean not null default false,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint exercises_check_owner check (is_global = true or user_id is not null)
);

-- Exercises per routine day
create table public.routine_day_exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null default 1,
  target_sets integer,
  target_reps text,
  target_rpe numeric(3,1),
  rest_seconds integer,
  notes text,
  created_at timestamptz not null default now()
);

-- Workout sessions
create table public.workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  routine_id uuid references public.routines(id) on delete set null,
  routine_day_id uuid references public.routine_days(id) on delete set null,
  name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Individual sets within a session
create table public.workout_sets (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  set_number integer not null,
  weight_kg numeric(6,2),
  reps integer,
  rpe numeric(3,1),
  rest_sec integer,
  is_warmup boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- Workout photos
create table public.workout_photos (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- Profile shares
create table public.profile_shares (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  shared_with_id uuid references public.profiles(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  permission text not null check (permission in ('read', 'edit')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_routines_user_id on public.routines(user_id);
create index idx_routine_days_routine_id on public.routine_days(routine_id);
create index idx_routine_day_exercises_day_id on public.routine_day_exercises(routine_day_id);
create index idx_workout_sessions_user_id on public.workout_sessions(user_id);
create index idx_workout_sessions_started_at on public.workout_sessions(started_at desc);
create index idx_workout_sets_session_id on public.workout_sets(session_id);
create index idx_workout_sets_exercise_id on public.workout_sets(exercise_id);
create index idx_profile_shares_owner_id on public.profile_shares(owner_id);
create index idx_profile_shares_token on public.profile_shares(token);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_routines_updated_at before update on public.routines
  for each row execute procedure public.set_updated_at();
