-- Generate 90 days of sessions for Bob (simplified — 3 sessions/week)
-- This script inserts sessions with sets for realistic chart data

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000002';
  v_session_id uuid;
  v_squat_id uuid;
  v_bench_id uuid;
  v_row_id uuid;
  v_day date;
  v_weight_squat numeric;
  v_weight_bench numeric;
  v_weight_row numeric;
  v_i int;
begin
  select id into v_squat_id from public.exercises where name = 'Squat' limit 1;
  select id into v_bench_id from public.exercises where name = 'Bench Press' limit 1;
  select id into v_row_id from public.exercises where name = 'Barbell Row' limit 1;

  -- 13 weeks of data, 3 sessions/week = ~39 sessions
  for v_i in 0..38 loop
    v_day := current_date - ((38 - v_i) * 2 + floor(v_i / 3)::int)::int;
    v_weight_squat := 80 + (v_i * 1.5); -- progressive overload
    v_weight_bench := 70 + (v_i * 1.0);
    v_weight_row := 75 + (v_i * 1.2);

    -- Alternating push/pull/legs
    case v_i % 3
    when 0 then -- Legs day
      v_session_id := uuid_generate_v4();
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (
        v_session_id, v_user_id, 'Legs',
        v_day::timestamptz + interval '7 hours',
        v_day::timestamptz + interval '8 hours 30 minutes'
      );
      -- 4 sets of squats
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session_id, v_squat_id, s, v_weight_squat, 5, 7 + (s * 0.5));
      end loop;

    when 1 then -- Push day
      v_session_id := uuid_generate_v4();
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (
        v_session_id, v_user_id, 'Push',
        v_day::timestamptz + interval '7 hours',
        v_day::timestamptz + interval '8 hours 15 minutes'
      );
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session_id, v_bench_id, s, v_weight_bench, 5, 7 + (s * 0.5));
      end loop;

    else -- Pull day
      v_session_id := uuid_generate_v4();
      insert into public.workout_sessions (id, user_id, name, started_at, finished_at)
      values (
        v_session_id, v_user_id, 'Pull',
        v_day::timestamptz + interval '7 hours',
        v_day::timestamptz + interval '8 hours'
      );
      for s in 1..4 loop
        insert into public.workout_sets (session_id, exercise_id, set_number, weight_kg, reps, rpe)
        values (v_session_id, v_row_id, s, v_weight_row, 5, 7 + (s * 0.5));
      end loop;
    end case;
  end loop;
end;
$$;
