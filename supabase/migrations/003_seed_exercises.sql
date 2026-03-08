-- Seed global exercise library
insert into public.exercises (name, category, muscle_group, equipment, is_global) values
  -- Compound lifts
  ('Squat', 'compound', 'legs', 'barbell', true),
  ('Deadlift', 'compound', 'back', 'barbell', true),
  ('Bench Press', 'compound', 'chest', 'barbell', true),
  ('Overhead Press', 'compound', 'shoulders', 'barbell', true),
  ('Barbell Row', 'compound', 'back', 'barbell', true),
  ('Romanian Deadlift', 'compound', 'legs', 'barbell', true),
  ('Front Squat', 'compound', 'legs', 'barbell', true),
  ('Sumo Deadlift', 'compound', 'legs', 'barbell', true),
  ('Incline Bench Press', 'compound', 'chest', 'barbell', true),
  ('Close Grip Bench Press', 'compound', 'chest', 'barbell', true),

  -- Dumbbell compound
  ('Dumbbell Bench Press', 'compound', 'chest', 'dumbbell', true),
  ('Dumbbell Row', 'compound', 'back', 'dumbbell', true),
  ('Dumbbell Shoulder Press', 'compound', 'shoulders', 'dumbbell', true),
  ('Dumbbell Romanian Deadlift', 'compound', 'legs', 'dumbbell', true),
  ('Dumbbell Lunges', 'compound', 'legs', 'dumbbell', true),

  -- Bodyweight
  ('Pull-ups', 'bodyweight', 'back', 'bodyweight', true),
  ('Chin-ups', 'bodyweight', 'back', 'bodyweight', true),
  ('Push-ups', 'bodyweight', 'chest', 'bodyweight', true),
  ('Dips', 'bodyweight', 'chest', 'bodyweight', true),
  ('Inverted Row', 'bodyweight', 'back', 'bodyweight', true),
  ('Plank', 'bodyweight', 'core', 'bodyweight', true),
  ('Ab Wheel', 'bodyweight', 'core', 'bodyweight', true),
  ('Hanging Leg Raise', 'bodyweight', 'core', 'bodyweight', true),

  -- Isolation — chest
  ('Cable Fly', 'isolation', 'chest', 'cable', true),
  ('Pec Deck', 'isolation', 'chest', 'machine', true),
  ('Dumbbell Fly', 'isolation', 'chest', 'dumbbell', true),

  -- Isolation — back
  ('Lat Pulldown', 'isolation', 'back', 'cable', true),
  ('Seated Cable Row', 'isolation', 'back', 'cable', true),
  ('Straight Arm Pulldown', 'isolation', 'back', 'cable', true),
  ('Face Pull', 'isolation', 'back', 'cable', true),

  -- Isolation — shoulders
  ('Lateral Raise', 'isolation', 'shoulders', 'dumbbell', true),
  ('Front Raise', 'isolation', 'shoulders', 'dumbbell', true),
  ('Reverse Fly', 'isolation', 'shoulders', 'dumbbell', true),
  ('Cable Lateral Raise', 'isolation', 'shoulders', 'cable', true),

  -- Isolation — biceps
  ('Barbell Curl', 'isolation', 'biceps', 'barbell', true),
  ('Dumbbell Curl', 'isolation', 'biceps', 'dumbbell', true),
  ('Hammer Curl', 'isolation', 'biceps', 'dumbbell', true),
  ('Preacher Curl', 'isolation', 'biceps', 'machine', true),
  ('Cable Curl', 'isolation', 'biceps', 'cable', true),
  ('Incline Dumbbell Curl', 'isolation', 'biceps', 'dumbbell', true),

  -- Isolation — triceps
  ('Tricep Pushdown', 'isolation', 'triceps', 'cable', true),
  ('Overhead Tricep Extension', 'isolation', 'triceps', 'cable', true),
  ('Skull Crushers', 'isolation', 'triceps', 'barbell', true),
  ('Tricep Kickback', 'isolation', 'triceps', 'dumbbell', true),
  ('Close Grip Push-up', 'isolation', 'triceps', 'bodyweight', true),

  -- Isolation — legs
  ('Leg Press', 'isolation', 'legs', 'machine', true),
  ('Leg Extension', 'isolation', 'legs', 'machine', true),
  ('Leg Curl', 'isolation', 'legs', 'machine', true),
  ('Hip Thrust', 'isolation', 'glutes', 'barbell', true),
  ('Glute Bridge', 'isolation', 'glutes', 'bodyweight', true),
  ('Calf Raise', 'isolation', 'calves', 'machine', true),
  ('Standing Calf Raise', 'isolation', 'calves', 'dumbbell', true),
  ('Adductor Machine', 'isolation', 'legs', 'machine', true),
  ('Abductor Machine', 'isolation', 'legs', 'machine', true),

  -- Core
  ('Crunches', 'isolation', 'core', 'bodyweight', true),
  ('Bicycle Crunches', 'isolation', 'core', 'bodyweight', true),
  ('Russian Twist', 'isolation', 'core', 'bodyweight', true),
  ('Cable Crunch', 'isolation', 'core', 'cable', true),
  ('Dead Bug', 'isolation', 'core', 'bodyweight', true),

  -- Cardio / conditioning
  ('Treadmill Run', 'cardio', 'full_body', 'machine', true),
  ('Stationary Bike', 'cardio', 'legs', 'machine', true),
  ('Rowing Machine', 'cardio', 'full_body', 'machine', true),
  ('Jump Rope', 'cardio', 'full_body', 'bodyweight', true),
  ('Burpees', 'cardio', 'full_body', 'bodyweight', true),
  ('Battle Ropes', 'cardio', 'full_body', 'other', true),

  -- Olympic
  ('Power Clean', 'olympic', 'full_body', 'barbell', true),
  ('Hang Clean', 'olympic', 'full_body', 'barbell', true),
  ('Snatch', 'olympic', 'full_body', 'barbell', true),
  ('Clean and Jerk', 'olympic', 'full_body', 'barbell', true);
