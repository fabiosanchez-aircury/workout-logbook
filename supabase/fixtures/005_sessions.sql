-- 90 days of sessions for Bob and Eve — realistic chart data
do $$
declare
  bob_id      uuid;
  eve_id      uuid;
  v_session   uuid;
  v_squat_id  uuid;
  v_bench_id  uuid;
  v_row_id    uuid;
  v_dead_id   uuid;
  v_ohp_id    uuid;
  v_day       date;
  v_i         int;
begin
  select id into bob_id  from auth.users where email = 'bob@dev.local';
  select id into eve_id  from auth.users where email = 'eve@dev.local';

  -- Skip if already loaded
  if exists (select 1 from public.workout_sessions where user_id = bob_id) then
    raise notice 'Sessions already loaded, skipping.';
    return;
  end if;

  select id into v_squat_id from public.exercises where name = 'Squat'            limit 1;
  select id into v_bench_id from public.exercises where name = 'Bench Press'      limit 1;
  select id into v_row_id   from public.exercises where name = 'Barbell Row'      limit 1;
  select id into v_dead_id  from public.exercises where name = 'Deadlift'         limit 1;
  select id into v_ohp_id   from public.exercises where name = 'Overhead Press'   limit 1;

  -- ── Bob: 39 sessions (PPL, ~3/week for 13 weeks) ─────────────────────────
  for v_i in 0..38 loop
    v_day := current_date - ((38 - v_i) * 2 + floor(v_i / 3)::int)::int;
    v_session := gen_random_uuid();

    case v_i % 3
    when 0 then
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, bob_id, 'Legs', v_day::timestamptz + '7h', v_day::timestamptz + '8h30m');
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_squat_id, s, 80 + (v_i * 1.5), 5, least(9.5, 7 + s * 0.5));
      end loop;
    when 1 then
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, bob_id, 'Push', v_day::timestamptz + '7h', v_day::timestamptz + '8h15m');
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_bench_id, s, 70 + (v_i * 1.0), 5, least(9.5, 7 + s * 0.5));
      end loop;
    else
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, bob_id, 'Pull', v_day::timestamptz + '7h', v_day::timestamptz + '8h');
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_row_id, s, 75 + (v_i * 1.2), 5, least(9.5, 7 + s * 0.5));
      end loop;
    end case;
  end loop;

  -- ── Eve: 52 sessions (Upper/Lower, ~4/week for 13 weeks) ─────────────────
  for v_i in 0..51 loop
    v_day := current_date - ((51 - v_i) * 2 + floor(v_i / 4)::int)::int;
    v_session := gen_random_uuid();

    case v_i % 4
    when 0 then
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, eve_id, 'Upper A', v_day::timestamptz + '6h', v_day::timestamptz + '7h30m');
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_bench_id, s, 60 + (v_i * 0.5), 8, least(9.5, 7 + s * 0.3));
      end loop;
    when 1 then
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, eve_id, 'Lower A', v_day::timestamptz + '6h', v_day::timestamptz + '7h45m');
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_squat_id, s, 90 + (v_i * 0.8), 6, least(9.5, 7 + s * 0.3));
      end loop;
    when 2 then
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, eve_id, 'Upper B', v_day::timestamptz + '6h', v_day::timestamptz + '7h30m');
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_ohp_id, s, 40 + (v_i * 0.4), 8, least(9.5, 7 + s * 0.3));
      end loop;
    else
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (v_session, eve_id, 'Lower B', v_day::timestamptz + '6h', v_day::timestamptz + '7h45m');
      for s in 1..3 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session, v_dead_id, s, 110 + (v_i * 0.6), 5, least(9.5, 8 + s * 0.3));
      end loop;
    end case;
  end loop;
end $$;
