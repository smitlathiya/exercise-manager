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

export const DRIVE = {
  space: 'drive',
  rootFolderName: 'GymTracker',
  backupsFolder: 'Backups',
  photosFolder: 'Photos',
  exportsFolder: 'Exports',
  apiEndpoint: 'https://www.googleapis.com/drive/v3/files',
  uploadEndpoint: 'https://www.googleapis.com/upload/drive/v3/files',
} as const;

// Replace these with your credentials from Google Cloud Console.
// Enable the Google Drive API, then create OAuth 2.0 client IDs
// for iOS and Android under APIs & Services → Credentials.
export const GOOGLE = {
  iosClientId: '1051090830776-b54sveq8o2f25d209h7390l92tm89v72.apps.googleusercontent.com',
  androidClientId: '964837800094-jl5rj5lehn71g15tlu9evu0r4b0t79vb.apps.googleusercontent.com',
  webClientId: '964837800094-5m1h1g9svd1h2gh605rpt6a1ds9phbqp.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'email',
    'profile',
  ],
} as const;
