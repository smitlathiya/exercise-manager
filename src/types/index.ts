import { MUSCLE_GROUPS, SET_TYPES, EQUIPMENT, DIFFICULTY, WORKOUT_TEMPLATES } from '@/constants';

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type SetType = (typeof SET_TYPES)[number];
export type Equipment = (typeof EQUIPMENT)[number];
export type Difficulty = (typeof DIFFICULTY)[number];
export type WorkoutTemplateKind = (typeof WORKOUT_TEMPLATES)[number];
export type Unit = 'kg' | 'lbs';

export interface BaseRow {
  id: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface UserRow extends BaseRow {
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

export interface Exercise extends BaseRow {
  name: string;
  muscle_group: MuscleGroup;
  equipment: Equipment;
  instructions: string | null;
  difficulty: Difficulty;
  is_favorite: 0 | 1;
  is_custom: 0 | 1;
  notes: string | null;
}

export interface Workout extends BaseRow {
  name: string;
  template_kind: WorkoutTemplateKind;
  scheduled_for: number | null;
  started_at: number | null;
  completed_at: number | null;
  duration_seconds: number | null;
  notes: string | null;
  is_template: 0 | 1;
}

export interface WorkoutExercise extends BaseRow {
  workout_id: string;
  exercise_id: string;
  position: number;
  rest_seconds: number;
  notes: string | null;
}

export interface WorkoutSet extends BaseRow {
  workout_exercise_id: string;
  set_index: number;
  set_type: SetType;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: 0 | 1;
  notes: string | null;
}

export interface BodyMeasurement extends BaseRow {
  measured_at: number;
  weight: number | null;
  body_fat: number | null;
  chest: number | null;
  waist: number | null;
  arms: number | null;
  neck: number | null;
  thighs: number | null;
  notes: string | null;
}

export interface NutritionLog extends BaseRow {
  logged_at: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
  meal_label: string | null;
  is_favorite: 0 | 1;
  notes: string | null;
}

export interface ProgressPhoto extends BaseRow {
  taken_at: number;
  category: 'front' | 'side' | 'back';
  local_uri: string;
  thumb_uri: string | null;
  drive_file_id: string | null;
  width: number;
  height: number;
}

export interface PersonalRecord extends BaseRow {
  exercise_id: string;
  kind: 'max_weight' | 'max_reps' | 'max_volume' | 'estimated_1rm';
  value: number;
  reps: number;
  weight: number;
  achieved_at: number;
  workout_set_id: string | null;
}


export interface AppSettings {
  unit: Unit;
  themeMode: 'dark' | 'light' | 'system';
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  workoutReminderHour: number | null;
  waterReminderEvery: number | null;
  weightReminderHour: number | null;
  defaultRestSeconds: number;
}

