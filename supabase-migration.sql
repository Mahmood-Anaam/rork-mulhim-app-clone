-- ============================================================
-- Mulhim App – Complete Supabase Database Schema
-- Generated: 2026-02-22
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. USER PROFILES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  age         INTEGER,
  weight      NUMERIC(5,2),
  height      NUMERIC(5,2),
  gender      TEXT CHECK (gender IN ('male', 'female')),
  target_weight    NUMERIC(5,2),
  fitness_level    TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  goal             TEXT CHECK (goal IN ('fat_loss', 'muscle_gain', 'general_fitness')),
  training_location TEXT CHECK (training_location IN ('gym', 'home', 'minimal_equipment')),
  activity_level   TEXT CHECK (activity_level IN ('none', 'light', 'moderate', 'high')),
  available_days   INTEGER,
  session_duration INTEGER,
  injuries         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 2. PROGRESS ENTRIES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight      NUMERIC(5,2) NOT NULL,
  notes       TEXT,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 3. WORKOUT LOGS & EXERCISE LOGS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id       UUID,
  completed_at     TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id   UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_name    TEXT NOT NULL,
  sets_completed   INTEGER DEFAULT 0,
  reps_completed   JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 4. WORKOUT PLANS, SESSIONS & EXERCISES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  duration_weeks  INTEGER DEFAULT 1,
  generated_by    TEXT DEFAULT 'ai',
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  started_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id             UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_number          INTEGER NOT NULL,
  day_name            TEXT,
  session_name        TEXT,
  estimated_duration  INTEGER DEFAULT 60,
  rest_note           TEXT,
  is_completed        BOOLEAN DEFAULT FALSE,
  completed_at        TIMESTAMPTZ,
  completed_exercises JSONB DEFAULT '[]',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sets            INTEGER,
  reps            TEXT,
  rest_seconds    INTEGER,
  muscle_group    TEXT,
  equipment       JSONB DEFAULT '[]',
  assigned_weight TEXT,
  video_url       TEXT,
  description     TEXT,
  order_index     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 5. NUTRITION PLANS, MEAL PLANS & MEALS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL,
  description            TEXT,
  daily_calories_target  INTEGER,
  protein_g              INTEGER,
  carbs_g                INTEGER,
  fats_g                 INTEGER,
  meal_count_per_day     INTEGER DEFAULT 3,
  diet_pattern           TEXT,
  generated_by           TEXT DEFAULT 'ai',
  status                 TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_plan_id   UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  day_number          INTEGER NOT NULL,
  day_name            TEXT,
  date                DATE,
  total_calories      INTEGER DEFAULT 0,
  total_protein       INTEGER DEFAULT 0,
  total_carbs         INTEGER DEFAULT 0,
  total_fats          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id    UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_type       TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name            TEXT NOT NULL,
  name_ar         TEXT,
  calories        INTEGER DEFAULT 0,
  protein         INTEGER DEFAULT 0,
  carbs           INTEGER DEFAULT 0,
  fats            INTEGER DEFAULT 0,
  ingredients     JSONB DEFAULT '[]',
  ingredients_ar  JSONB DEFAULT '[]',
  order_index     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 6. FAVORITES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorite_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sets            INTEGER,
  reps            TEXT,
  rest_seconds    INTEGER,
  muscle_group    TEXT,
  equipment       JSONB DEFAULT '[]',
  assigned_weight TEXT,
  video_url       TEXT,
  description     TEXT,
  added_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorite_meals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  meal_type       TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories        INTEGER DEFAULT 0,
  protein         INTEGER DEFAULT 0,
  carbs           INTEGER DEFAULT 0,
  fats            INTEGER DEFAULT 0,
  ingredients     JSONB DEFAULT '[]',
  ingredients_ar  JSONB DEFAULT '[]',
  added_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 7. INDEXES
-- ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx       ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS progress_entries_user_id_idx    ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS progress_entries_measured_at_idx ON progress_entries(measured_at);
CREATE INDEX IF NOT EXISTS workout_logs_user_id_idx        ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS workout_logs_completed_at_idx   ON workout_logs(completed_at);
CREATE INDEX IF NOT EXISTS workout_plans_user_id_idx       ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS workout_plans_status_idx        ON workout_plans(status);
CREATE INDEX IF NOT EXISTS workout_sessions_plan_id_idx    ON workout_sessions(plan_id);
CREATE INDEX IF NOT EXISTS exercises_session_id_idx        ON exercises(session_id);
CREATE INDEX IF NOT EXISTS nutrition_plans_user_id_idx     ON nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS nutrition_plans_status_idx      ON nutrition_plans(status);
CREATE INDEX IF NOT EXISTS meal_plans_nutrition_plan_id_idx ON meal_plans(nutrition_plan_id);
CREATE INDEX IF NOT EXISTS meals_meal_plan_id_idx          ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS favorite_exercises_user_id_idx  ON favorite_exercises(user_id);
CREATE INDEX IF NOT EXISTS favorite_meals_user_id_idx      ON favorite_meals(user_id);

-- ──────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────
ALTER TABLE user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_meals    ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- progress_entries policies
DROP POLICY IF EXISTS "progress_entries_select" ON progress_entries;
DROP POLICY IF EXISTS "progress_entries_insert" ON progress_entries;
DROP POLICY IF EXISTS "progress_entries_update" ON progress_entries;
DROP POLICY IF EXISTS "progress_entries_delete" ON progress_entries;
CREATE POLICY "progress_entries_select" ON progress_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_entries_insert" ON progress_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_entries_update" ON progress_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_entries_delete" ON progress_entries FOR DELETE USING (auth.uid() = user_id);

-- workout_logs policies
DROP POLICY IF EXISTS "workout_logs_select" ON workout_logs;
DROP POLICY IF EXISTS "workout_logs_insert" ON workout_logs;
DROP POLICY IF EXISTS "workout_logs_update" ON workout_logs;
DROP POLICY IF EXISTS "workout_logs_delete" ON workout_logs;
CREATE POLICY "workout_logs_select" ON workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_logs_insert" ON workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_logs_update" ON workout_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_logs_delete" ON workout_logs FOR DELETE USING (auth.uid() = user_id);

-- exercise_logs policies (via workout_logs join)
DROP POLICY IF EXISTS "exercise_logs_select" ON exercise_logs;
DROP POLICY IF EXISTS "exercise_logs_insert" ON exercise_logs;
CREATE POLICY "exercise_logs_select" ON exercise_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM workout_logs wl WHERE wl.id = exercise_logs.workout_log_id AND wl.user_id = auth.uid()));
CREATE POLICY "exercise_logs_insert" ON exercise_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_logs wl WHERE wl.id = exercise_logs.workout_log_id AND wl.user_id = auth.uid()));

-- workout_plans policies
DROP POLICY IF EXISTS "workout_plans_select" ON workout_plans;
DROP POLICY IF EXISTS "workout_plans_insert" ON workout_plans;
DROP POLICY IF EXISTS "workout_plans_update" ON workout_plans;
DROP POLICY IF EXISTS "workout_plans_delete" ON workout_plans;
CREATE POLICY "workout_plans_select" ON workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_plans_insert" ON workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_plans_update" ON workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_plans_delete" ON workout_plans FOR DELETE USING (auth.uid() = user_id);

-- workout_sessions policies (via workout_plans join)
DROP POLICY IF EXISTS "workout_sessions_select" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_insert" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_update" ON workout_sessions;
CREATE POLICY "workout_sessions_select" ON workout_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM workout_plans wp WHERE wp.id = workout_sessions.plan_id AND wp.user_id = auth.uid()));
CREATE POLICY "workout_sessions_insert" ON workout_sessions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_plans wp WHERE wp.id = workout_sessions.plan_id AND wp.user_id = auth.uid()));
CREATE POLICY "workout_sessions_update" ON workout_sessions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workout_plans wp WHERE wp.id = workout_sessions.plan_id AND wp.user_id = auth.uid()));

-- exercises policies (via workout_sessions → workout_plans join)
DROP POLICY IF EXISTS "exercises_select" ON exercises;
DROP POLICY IF EXISTS "exercises_insert" ON exercises;
CREATE POLICY "exercises_select" ON exercises FOR SELECT
  USING (EXISTS (SELECT 1 FROM workout_sessions ws JOIN workout_plans wp ON wp.id = ws.plan_id WHERE ws.id = exercises.session_id AND wp.user_id = auth.uid()));
CREATE POLICY "exercises_insert" ON exercises FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_sessions ws JOIN workout_plans wp ON wp.id = ws.plan_id WHERE ws.id = exercises.session_id AND wp.user_id = auth.uid()));

-- nutrition_plans policies
DROP POLICY IF EXISTS "nutrition_plans_select" ON nutrition_plans;
DROP POLICY IF EXISTS "nutrition_plans_insert" ON nutrition_plans;
DROP POLICY IF EXISTS "nutrition_plans_update" ON nutrition_plans;
CREATE POLICY "nutrition_plans_select" ON nutrition_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "nutrition_plans_insert" ON nutrition_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "nutrition_plans_update" ON nutrition_plans FOR UPDATE USING (auth.uid() = user_id);

-- meal_plans policies (via nutrition_plans join)
DROP POLICY IF EXISTS "meal_plans_select" ON meal_plans;
DROP POLICY IF EXISTS "meal_plans_insert" ON meal_plans;
CREATE POLICY "meal_plans_select" ON meal_plans FOR SELECT
  USING (EXISTS (SELECT 1 FROM nutrition_plans np WHERE np.id = meal_plans.nutrition_plan_id AND np.user_id = auth.uid()));
CREATE POLICY "meal_plans_insert" ON meal_plans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM nutrition_plans np WHERE np.id = meal_plans.nutrition_plan_id AND np.user_id = auth.uid()));

-- meals policies (via meal_plans → nutrition_plans join)
DROP POLICY IF EXISTS "meals_select" ON meals;
DROP POLICY IF EXISTS "meals_insert" ON meals;
CREATE POLICY "meals_select" ON meals FOR SELECT
  USING (EXISTS (SELECT 1 FROM meal_plans mp JOIN nutrition_plans np ON np.id = mp.nutrition_plan_id WHERE mp.id = meals.meal_plan_id AND np.user_id = auth.uid()));
CREATE POLICY "meals_insert" ON meals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM meal_plans mp JOIN nutrition_plans np ON np.id = mp.nutrition_plan_id WHERE mp.id = meals.meal_plan_id AND np.user_id = auth.uid()));

-- favorite_exercises policies
DROP POLICY IF EXISTS "favorite_exercises_select" ON favorite_exercises;
DROP POLICY IF EXISTS "favorite_exercises_insert" ON favorite_exercises;
DROP POLICY IF EXISTS "favorite_exercises_delete" ON favorite_exercises;
CREATE POLICY "favorite_exercises_select" ON favorite_exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorite_exercises_insert" ON favorite_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorite_exercises_delete" ON favorite_exercises FOR DELETE USING (auth.uid() = user_id);

-- favorite_meals policies
DROP POLICY IF EXISTS "favorite_meals_select" ON favorite_meals;
DROP POLICY IF EXISTS "favorite_meals_insert" ON favorite_meals;
DROP POLICY IF EXISTS "favorite_meals_delete" ON favorite_meals;
CREATE POLICY "favorite_meals_select" ON favorite_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorite_meals_insert" ON favorite_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorite_meals_delete" ON favorite_meals FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- 9. AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['user_profiles','progress_entries','workout_logs','workout_plans','workout_sessions','nutrition_plans'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', tbl, tbl);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END;
$$;

