-- Bob's PPL routine
insert into public.routines (id, user_id, name, description, is_active) values
  ('r-bob-ppl', '00000000-0000-0000-0000-000000000002', 'Push Pull Legs', '3-day split, 2x per week', true);

insert into public.routine_days (id, routine_id, name, position) values
  ('rd-bob-push', 'r-bob-ppl', 'Push', 1),
  ('rd-bob-pull', 'r-bob-ppl', 'Pull', 2),
  ('rd-bob-legs', 'r-bob-ppl', 'Legs', 3);

-- Link exercises to days (using exercise IDs from seed — select by name)
insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-push', id, 1, 4, '5', 180 from public.exercises where name = 'Bench Press' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-push', id, 2, 3, '8-12', 120 from public.exercises where name = 'Overhead Press' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-push', id, 3, 3, '12-15', 90 from public.exercises where name = 'Lateral Raise' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-pull', id, 1, 4, '5', 180 from public.exercises where name = 'Barbell Row' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-pull', id, 2, 3, '8-12', 120 from public.exercises where name = 'Pull-ups' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-pull', id, 3, 3, '12-15', 90 from public.exercises where name = 'Barbell Curl' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-legs', id, 1, 4, '5', 240 from public.exercises where name = 'Squat' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-legs', id, 2, 3, '8', 180 from public.exercises where name = 'Romanian Deadlift' limit 1;

insert into public.routine_day_exercises (routine_day_id, exercise_id, position, target_sets, target_reps, rest_seconds)
select 'rd-bob-legs', id, 3, 3, '15', 90 from public.exercises where name = 'Leg Extension' limit 1;

-- Carol's powerlifting routine
insert into public.routines (id, user_id, name, description, is_active) values
  ('r-carol-pl', '00000000-0000-0000-0000-000000000003', 'Powerlifting 3-Day', 'SBD focus', true);

insert into public.routine_days (id, routine_id, name, position) values
  ('rd-carol-sq', 'r-carol-pl', 'Squat + Accessories', 1),
  ('rd-carol-bp', 'r-carol-pl', 'Bench + Accessories', 2),
  ('rd-carol-dl', 'r-carol-pl', 'Deadlift + Accessories', 3);
