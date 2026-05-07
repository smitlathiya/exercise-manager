export const APP_NAME = 'Gym Tracker';
export const DB_NAME = 'gymtracker.db';
export const DB_VERSION = 1;

export const SECURE_KEYS = {
  googleAccessToken: 'google_access_token',
  googleRefreshToken: 'google_refresh_token',
  googleAccessExpires: 'google_access_expires',
  googleProfile: 'google_profile',
  appPin: 'app_pin',
} as const;

export const STORAGE_KEYS = {
  settings: 'settings',
  theme: 'theme',
  lastSync: 'last_sync',
  pendingWorkout: 'pending_workout',
} as const;

export const DRIVE = {
  rootFolderName: 'GymTracker',
  backupsFolder: 'backups',
  photosFolder: 'progress_photos',
  exportsFolder: 'exports',
  appDataSpace: 'appDataFolder',
  uploadEndpoint: 'https://www.googleapis.com/upload/drive/v3/files',
  apiEndpoint: 'https://www.googleapis.com/drive/v3/files',
} as const;

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'openid',
  'email',
  'profile',
];

export const SYNC_INTERVAL_MS = 5 * 60 * 1000;
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
