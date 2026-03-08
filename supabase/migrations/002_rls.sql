-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.exercises enable row level security;
alter table public.routine_day_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.workout_photos enable row level security;
alter table public.profile_shares enable row level security;

-- PROFILES
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can read public profiles"
  on public.profiles for select
  using (is_public = true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ROUTINES
create policy "Users can CRUD own routines"
  on public.routines for all
  using (auth.uid() = user_id);

-- ROUTINE DAYS
create policy "Users can CRUD own routine days"
  on public.routine_days for all
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = auth.uid()
    )
  );

-- EXERCISES (global readable, own custom writable)
create policy "Anyone can read global exercises"
  on public.exercises for select
  using (is_global = true);

create policy "Users can read own custom exercises"
  on public.exercises for select
  using (user_id = auth.uid());

create policy "Users can create own exercises"
  on public.exercises for insert
  with check (user_id = auth.uid() and is_global = false);

create policy "Users can update own exercises"
  on public.exercises for update
  using (user_id = auth.uid());

create policy "Users can delete own exercises"
  on public.exercises for delete
  using (user_id = auth.uid());

-- ROUTINE DAY EXERCISES
create policy "Users can CRUD own routine day exercises"
  on public.routine_day_exercises for all
  using (
    exists (
      select 1 from public.routine_days rd
      join public.routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  );

-- WORKOUT SESSIONS
create policy "Users can CRUD own sessions"
  on public.workout_sessions for all
  using (auth.uid() = user_id);

create policy "Users can read shared sessions"
  on public.workout_sessions for select
  using (
    exists (
      select 1 from public.profile_shares ps
      where ps.owner_id = user_id
        and (ps.shared_with_id = auth.uid() or ps.shared_with_id is null)
        and (ps.expires_at is null or ps.expires_at > now())
    )
  );

-- WORKOUT SETS
create policy "Users can CRUD own sets"
  on public.workout_sets for all
  using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = session_id and ws.user_id = auth.uid()
    )
  );

-- WORKOUT PHOTOS
create policy "Users can CRUD own photos"
  on public.workout_photos for all
  using (auth.uid() = user_id);

-- PROFILE SHARES
create policy "Owners can manage their shares"
  on public.profile_shares for all
  using (auth.uid() = owner_id);

create policy "Shared users can view shares"
  on public.profile_shares for select
  using (shared_with_id = auth.uid());
