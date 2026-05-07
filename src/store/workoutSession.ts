import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import {
  getWorkout,
  listWorkoutExercises,
  listSetsForWorkoutExercise,
  updateWorkout,
  updateSet,
  createSet,
  deleteSet,
  getWorkoutVolume,
} from '@/database/repositories/workouts';
import { recordPRsForSet } from '@/database/repositories/prs';
import { now } from '@/utils/id';
import type { Workout, WorkoutExercise, WorkoutSet, SetType } from '@/types';

interface SessionExercise {
  workoutExercise: WorkoutExercise;
  sets: WorkoutSet[];
}

interface SessionState {
  workoutId: string | null;
  workout: Workout | null;
  exercises: SessionExercise[];
  startedAt: number | null;
  pausedDuration: number;
  pausedAt: number | null;
  restEndsAt: number | null;
  volume: number;

  loadOrStart: (workoutId: string) => Promise<void>;
  refresh: () => Promise<void>;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  startRest: (seconds: number) => void;
  cancelRest: () => void;
  addSet: (
    weId: string,
    template?: { weight?: number; reps?: number; set_type?: SetType }
  ) => Promise<void>;
  toggleSetComplete: (setId: string) => Promise<void>;
  patchSet: (setId: string, patch: Partial<WorkoutSet>) => Promise<void>;
  removeSet: (setId: string) => Promise<void>;
  finish: () => Promise<void>;
  abandon: () => Promise<void>;
  persistSnapshot: () => Promise<void>;
  recoverFromSnapshot: () => Promise<boolean>;
}

export const useWorkoutSession = create<SessionState>((set, get) => ({
  workoutId: null,
  workout: null,
  exercises: [],
  startedAt: null,
  pausedDuration: 0,
  pausedAt: null,
  restEndsAt: null,
  volume: 0,

  loadOrStart: async (workoutId) => {
    const w = await getWorkout(workoutId);
    if (!w) return;
    const wes = await listWorkoutExercises(workoutId);
    const exs: SessionExercise[] = [];
    for (const we of wes) {
      const sets = await listSetsForWorkoutExercise(we.id);
      exs.push({ workoutExercise: we, sets });
    }
    const volume = await getWorkoutVolume(workoutId);
    set({
      workoutId,
      workout: w,
      exercises: exs,
      startedAt: w.started_at,
      pausedDuration: 0,
      pausedAt: null,
      volume,
    });
    await get().persistSnapshot();
  },

  refresh: async () => {
    const id = get().workoutId;
    if (!id) return;
    await get().loadOrStart(id);
  },

  start: async () => {
    const id = get().workoutId;
    if (!id) return;
    const t = now();
    await updateWorkout(id, { started_at: t });
    set({ startedAt: t });
    await get().persistSnapshot();
  },

  pause: () => set({ pausedAt: now() }),
  resume: () => {
    const { pausedAt, pausedDuration } = get();
    if (!pausedAt) return;
    set({
      pausedAt: null,
      pausedDuration: pausedDuration + (now() - pausedAt),
    });
  },

  startRest: (seconds) => set({ restEndsAt: now() + seconds * 1000 }),
  cancelRest: () => set({ restEndsAt: null }),

  addSet: async (weId, template) => {
    const exs = get().exercises;
    const target = exs.find((e) => e.workoutExercise.id === weId);
    if (!target) return;
    const idx = target.sets.length;
    const last = target.sets[target.sets.length - 1];
    await createSet({
      workout_exercise_id: weId,
      set_index: idx,
      set_type: template?.set_type ?? 'normal',
      weight: template?.weight ?? last?.weight ?? 0,
      reps: template?.reps ?? last?.reps ?? 0,
      rpe: null,
      completed: 0,
      notes: null,
    });
    await get().refresh();
  },

  toggleSetComplete: async (setId) => {
    const exs = get().exercises;
    let foundSet: WorkoutSet | null = null;
    let exerciseId = '';
    for (const e of exs) {
      const s = e.sets.find((x) => x.id === setId);
      if (s) {
        foundSet = s;
        exerciseId = e.workoutExercise.exercise_id;
        break;
      }
    }
    if (!foundSet) return;
    const newCompleted: 0 | 1 = foundSet.completed ? 0 : 1;
    await updateSet(setId, { completed: newCompleted });
    if (newCompleted) {
      await recordPRsForSet({ ...foundSet, completed: 1 }, exerciseId, now());
    }
    await get().refresh();
  },

  patchSet: async (setId, patch) => {
    await updateSet(setId, patch);
    await get().refresh();
  },

  removeSet: async (setId) => {
    await deleteSet(setId);
    await get().refresh();
  },

  finish: async () => {
    const id = get().workoutId;
    const startedAt = get().startedAt;
    if (!id) return;
    const finishedAt = now();
    const duration = startedAt
      ? Math.max(0, Math.floor((finishedAt - startedAt - get().pausedDuration) / 1000))
      : null;
    await updateWorkout(id, {
      completed_at: finishedAt,
      duration_seconds: duration,
    });
    await AsyncStorage.removeItem(STORAGE_KEYS.pendingWorkout);
    set({
      workoutId: null,
      workout: null,
      exercises: [],
      startedAt: null,
      pausedDuration: 0,
      pausedAt: null,
      restEndsAt: null,
      volume: 0,
    });
  },

  abandon: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.pendingWorkout);
    set({
      workoutId: null,
      workout: null,
      exercises: [],
      startedAt: null,
      pausedDuration: 0,
      pausedAt: null,
      restEndsAt: null,
      volume: 0,
    });
  },

  persistSnapshot: async () => {
    const s = get();
    if (!s.workoutId) {
      await AsyncStorage.removeItem(STORAGE_KEYS.pendingWorkout);
      return;
    }
    await AsyncStorage.setItem(
      STORAGE_KEYS.pendingWorkout,
      JSON.stringify({
        workoutId: s.workoutId,
        startedAt: s.startedAt,
        pausedDuration: s.pausedDuration,
      })
    );
  },

  recoverFromSnapshot: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.pendingWorkout);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) as { workoutId: string };
      if (parsed.workoutId) {
        await get().loadOrStart(parsed.workoutId);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  },
}));
