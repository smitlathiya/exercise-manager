export const APP_NAME = 'Gym Tracker';
export const DB_NAME = 'gymtracker.db';
export const DB_VERSION = 1;

export const SECURE_KEYS = {
  appPin: 'app_pin',
} as const;

export const STORAGE_KEYS = {
  settings: 'settings',
  theme: 'theme',
  pendingWorkout: 'pending_workout',
} as const;


export const REST_TIMER_DEFAULT_SECONDS = 90;
export const ACTIVE_WORKOUT_AUTOSAVE_MS = 5_000;

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulder',
  'Arms',
  'Core',
  'Cardio',
] as const;

export const WORKOUT_TEMPLATES = [
  'Push Pull Legs',
  'Full Body',
  'Upper Lower',
  'Arnold Split',
  'Custom Split',
] as const;

export const SET_TYPES = [
  'normal',
  'warmup',
  'failure',
  'dropset',
  'superset',
] as const;

export const EQUIPMENT = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Bands',
  'Other',
] as const;

export const DIFFICULTY = ['beginner', 'intermediate', 'advanced'] as const;

export const MUSCLES_BY_GROUP = {
  Chest: ['Upper Chest', 'Mid Chest', 'Lower Chest'],
  Back: ['Lats', 'Upper Traps', 'Mid Traps', 'Rhomboids', 'Lower Back', 'Teres Major'],
  Shoulder: ['Front Delts', 'Side Delts', 'Rear Delts'],
  Arms: ['Biceps', 'Triceps', 'Forearms', 'Brachialis'],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Hip Flexors'],
  Core: ['Abs', 'Obliques', 'Transverse Abdominis'],
  Cardio: [],
} as const;

export const ALL_MUSCLES: readonly string[] = Object.values(MUSCLES_BY_GROUP).flat();

export const MUSCLE_SEPARATOR = '|';
