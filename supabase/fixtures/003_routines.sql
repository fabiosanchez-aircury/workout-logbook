-- Routines fixture — uses subqueries by email so UUIDs don't need to be hardcoded
do $$
declare
  bob_id   uuid;
  carol_id uuid;
  eve_id   uuid;
  r_bob_ppl    uuid;
  rd_push      uuid;
  rd_pull      uuid;
  rd_legs      uuid;
  r_carol_pl   uuid;
  rd_sq        uuid;
  rd_bp        uuid;
  rd_dl        uuid;
  r_eve_ub     uuid;
  rd_upper     uuid;
  rd_lower     uuid;
begin
  select id into bob_id   from auth.users where email = 'bob@dev.local';
  select id into carol_id from auth.users where email = 'carol@dev.local';
  select id into eve_id   from auth.users where email = 'eve@dev.local';

  -- Skip if already loaded
  if exists (select 1 from public.routines where user_id = bob_id) then
    raise notice 'Routines already loaded, skipping.';
    return;
  end if;

  -- ── Bob: PPL ──────────────────────────────────────────────────────────────
  r_bob_ppl := gen_random_uuid();
  rd_push   := gen_random_uuid();
  rd_pull   := gen_random_uuid();
  rd_legs   := gen_random_uuid();

  insert into public.routines (id, user_id, name, description, is_active)
  values (r_bob_ppl, bob_id, 'Push Pull Legs', '3-day split, 2x per week', true);

  insert into public.routine_days (id, routine_id, name, position) values
    (rd_push, r_bob_ppl, 'Push', 1),
    (rd_pull, r_bob_ppl, 'Pull', 2),
    (rd_legs, r_bob_ppl, 'Legs', 3);

  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_push, id, 1, 4, '5', 180   from public.exercises where name = 'Bench Press' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_push, id, 2, 3, '8-12', 120 from public.exercises where name = 'Overhead Press' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_push, id, 3, 3, '12-15', 90 from public.exercises where name = 'Lateral Raise' limit 1;

  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_pull, id, 1, 4, '5', 180   from public.exercises where name = 'Barbell Row' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_pull, id, 2, 3, '8-12', 120 from public.exercises where name = 'Pull-ups' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_pull, id, 3, 3, '12-15', 90 from public.exercises where name = 'Barbell Curl' limit 1;

  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_legs, id, 1, 4, '5', 240   from public.exercises where name = 'Squat' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_legs, id, 2, 3, '8', 180   from public.exercises where name = 'Romanian Deadlift' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_legs, id, 3, 3, '15', 90   from public.exercises where name = 'Leg Extension' limit 1;

  -- ── Carol: Powerlifting ───────────────────────────────────────────────────
  r_carol_pl := gen_random_uuid();
  rd_sq      := gen_random_uuid();
  rd_bp      := gen_random_uuid();
  rd_dl      := gen_random_uuid();

  insert into public.routines (id, user_id, name, description, is_active)
  values (r_carol_pl, carol_id, 'Powerlifting 3-Day', 'SBD focus', true);

  insert into public.routine_days (id, routine_id, name, position) values
    (rd_sq, r_carol_pl, 'Squat + Accessories', 1),
    (rd_bp, r_carol_pl, 'Bench + Accessories', 2),
    (rd_dl, r_carol_pl, 'Deadlift + Accessories', 3);

  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_sq, id, 1, 5, '5', 300 from public.exercises where name = 'Squat' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_bp, id, 1, 5, '5', 240 from public.exercises where name = 'Bench Press' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_dl, id, 1, 3, '3', 360 from public.exercises where name = 'Deadlift' limit 1;

  -- ── Eve: Upper/Lower ──────────────────────────────────────────────────────
  r_eve_ub  := gen_random_uuid();
  rd_upper  := gen_random_uuid();
  rd_lower  := gen_random_uuid();

  insert into public.routines (id, user_id, name, description, is_active)
  values (r_eve_ub, eve_id, 'Upper / Lower', '4-day split', true);

  insert into public.routine_days (id, routine_id, name, position) values
    (rd_upper, r_eve_ub, 'Upper', 1),
    (rd_lower, r_eve_ub, 'Lower', 2);

  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_upper, id, 1, 4, '8-10', 120 from public.exercises where name = 'Bench Press' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_upper, id, 2, 4, '8-10', 120 from public.exercises where name = 'Barbell Row' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_lower, id, 1, 4, '6-8', 180  from public.exercises where name = 'Squat' limit 1;
  insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
  select rd_lower, id, 2, 3, '8', 180    from public.exercises where name = 'Romanian Deadlift' limit 1;

end $$;
