import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  WorkoutEditor: { workoutId?: string };
  WorkoutLive: { workoutId: string };
  ExerciseDetail: { exerciseId: string };
  ExerciseEditor: { exerciseId?: string };
  PRHistory: { exerciseId: string };
  AppLock: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Exercises: undefined;
  Body: undefined;
  Settings: undefined;
};
