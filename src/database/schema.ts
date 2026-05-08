export const SCHEMA_STATEMENTS: string[] = [
  `PRAGMA journal_mode = WAL;`,
  `PRAGMA foreign_keys = ON;`,

  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT NOT NULL,
    instructions TEXT,
    difficulty TEXT NOT NULL DEFAULT 'beginner',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_custom INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    target_muscles TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);`,
  `CREATE INDEX IF NOT EXISTS idx_exercises_favorite ON exercises(is_favorite);`,
  `CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);`,

  `CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    template_kind TEXT NOT NULL DEFAULT 'Custom Split',
    scheduled_for INTEGER,
    started_at INTEGER,
    completed_at INTEGER,
    duration_seconds INTEGER,
    notes TEXT,
    is_template INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed_at);`,
  `CREATE INDEX IF NOT EXISTS idx_workouts_template ON workouts(is_template);`,

  `CREATE TABLE IF NOT EXISTS workout_exercises (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    rest_seconds INTEGER NOT NULL DEFAULT 90,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_we_workout ON workout_exercises(workout_id);`,
  `CREATE INDEX IF NOT EXISTS idx_we_exercise ON workout_exercises(exercise_id);`,

  `CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY,
    workout_exercise_id TEXT NOT NULL,
    set_index INTEGER NOT NULL,
    set_type TEXT NOT NULL DEFAULT 'normal',
    weight REAL NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    rpe REAL,
    completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_sets_we ON workout_sets(workout_exercise_id);`,

  `CREATE TABLE IF NOT EXISTS body_measurements (
    id TEXT PRIMARY KEY,
    measured_at INTEGER NOT NULL,
    weight REAL,
    body_fat REAL,
    chest REAL,
    waist REAL,
    arms REAL,
    neck REAL,
    thighs REAL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_body_date ON body_measurements(measured_at);`,

  `CREATE TABLE IF NOT EXISTS nutrition_logs (
    id TEXT PRIMARY KEY,
    logged_at INTEGER NOT NULL,
    calories REAL NOT NULL DEFAULT 0,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    water_ml REAL NOT NULL DEFAULT 0,
    meal_label TEXT,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_nutrition_date ON nutrition_logs(logged_at);`,

  `CREATE TABLE IF NOT EXISTS progress_photos (
    id TEXT PRIMARY KEY,
    taken_at INTEGER NOT NULL,
    category TEXT NOT NULL,
    local_uri TEXT NOT NULL,
    thumb_uri TEXT,
    drive_file_id TEXT,
    width INTEGER NOT NULL DEFAULT 0,
    height INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_photos_date ON progress_photos(taken_at);`,

  `CREATE TABLE IF NOT EXISTS personal_records (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    value REAL NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL NOT NULL,
    achieved_at INTEGER NOT NULL,
    workout_set_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_pr_exercise ON personal_records(exercise_id);`,
  `CREATE INDEX IF NOT EXISTS idx_pr_kind ON personal_records(kind);`,

  `CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    op TEXT NOT NULL,
    payload TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at INTEGER NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_sync_created ON sync_queue(created_at);`,

  `CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );`,
];
