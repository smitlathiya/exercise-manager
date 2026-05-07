import { getDb } from '../db';
import { newId, now } from '@/utils/id';
import { enqueueSync } from '../sync';
import type {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutTemplateKind,
  SetType,
} from '@/types';

const W_FIELDS =
  'id, name, template_kind, scheduled_for, started_at, completed_at, duration_seconds, notes, is_template, created_at, updated_at, deleted_at';
const WE_FIELDS =
  'id, workout_id, exercise_id, position, rest_seconds, notes, created_at, updated_at, deleted_at';
const WS_FIELDS =
  'id, workout_exercise_id, set_index, set_type, weight, reps, rpe, completed, notes, created_at, updated_at, deleted_at';

// ─── Workouts ───────────────────────────────────────────────

export const createWorkout = async (input: {
  name: string;
  template_kind: WorkoutTemplateKind;
  is_template?: boolean;
  notes?: string | null;
}): Promise<Workout> => {
  const db = getDb();
  const id = newId();
  const ts = now();
  await db.runAsync(
    `INSERT INTO workouts (id, name, template_kind, scheduled_for, started_at, completed_at, duration_seconds, notes, is_template, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, NULL, NULL, NULL, NULL, ?, ?, ?, ?, NULL);`,
    [id, input.name, input.template_kind, input.notes ?? null, input.is_template ? 1 : 0, ts, ts]
  );
  const row = (await getWorkout(id))!;
  await enqueueSync('workouts', id, 'upsert', row);
  return row;
};

export const getWorkout = async (id: string): Promise<Workout | null> => {
  const db = getDb();
  return (await db.getFirstAsync<Workout>(
    `SELECT ${W_FIELDS} FROM workouts WHERE id = ? AND deleted_at IS NULL;`,
    [id]
  )) ?? null;
};

export const listTemplates = async (): Promise<Workout[]> => {
  const db = getDb();
  return db.getAllAsync<Workout>(
    `SELECT ${W_FIELDS} FROM workouts WHERE is_template = 1 AND deleted_at IS NULL ORDER BY updated_at DESC;`
  );
};

export const listCompletedWorkouts = async (limit = 50, offset = 0): Promise<Workout[]> => {
  const db = getDb();
  return db.getAllAsync<Workout>(
    `SELECT ${W_FIELDS} FROM workouts WHERE completed_at IS NOT NULL AND deleted_at IS NULL ORDER BY completed_at DESC LIMIT ? OFFSET ?;`,
    [limit, offset]
  );
};

export const listInProgressWorkout = async (): Promise<Workout | null> => {
  const db = getDb();
  return (await db.getFirstAsync<Workout>(
    `SELECT ${W_FIELDS} FROM workouts WHERE started_at IS NOT NULL AND completed_at IS NULL AND is_template = 0 AND deleted_at IS NULL ORDER BY started_at DESC LIMIT 1;`
  )) ?? null;
};

export const updateWorkout = async (id: string, patch: Partial<Workout>): Promise<void> => {
  const db = getDb();
  const fields = Object.keys(patch).filter((k) => k !== 'id' && k !== 'created_at');
  if (!fields.length) return;
  const ts = now();
  fields.push('updated_at');
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (f === 'updated_at' ? ts : (patch as any)[f]));
  await db.runAsync(`UPDATE workouts SET ${setClause} WHERE id = ?;`, [...values, id]);
  const row = await getWorkout(id);
  if (row) await enqueueSync('workouts', id, 'upsert', row);
};

export const softDeleteWorkout = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync('UPDATE workouts SET deleted_at = ?, updated_at = ? WHERE id = ?;', [ts, ts, id]);
  await enqueueSync('workouts', id, 'delete');
};

export const duplicateWorkout = async (sourceId: string): Promise<Workout | null> => {
  const src = await getWorkout(sourceId);
  if (!src) return null;
  const dup = await createWorkout({
    name: `${src.name} (Copy)`,
    template_kind: src.template_kind,
    is_template: !!src.is_template,
    notes: src.notes,
  });
  const exes = await listWorkoutExercises(sourceId);
  for (const we of exes) {
    const newWe = await addExerciseToWorkout(dup.id, we.exercise_id, {
      position: we.position,
      rest_seconds: we.rest_seconds,
      notes: we.notes,
    });
    const sets = await listSetsForWorkoutExercise(we.id);
    for (const s of sets) {
      await createSet({
        workout_exercise_id: newWe.id,
        set_index: s.set_index,
        set_type: s.set_type,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        completed: 0,
        notes: s.notes,
      });
    }
  }
  return dup;
};

// ─── Workout Exercises ──────────────────────────────────────

export const listWorkoutExercises = async (workoutId: string): Promise<WorkoutExercise[]> => {
  const db = getDb();
  return db.getAllAsync<WorkoutExercise>(
    `SELECT ${WE_FIELDS} FROM workout_exercises WHERE workout_id = ? AND deleted_at IS NULL ORDER BY position ASC;`,
    [workoutId]
  );
};

export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
  options?: { position?: number; rest_seconds?: number; notes?: string | null }
): Promise<WorkoutExercise> => {
  const db = getDb();
  const id = newId();
  const ts = now();
  let position = options?.position;
  if (position === undefined) {
    const r = await db.getFirstAsync<{ p: number | null }>(
      'SELECT MAX(position) as p FROM workout_exercises WHERE workout_id = ? AND deleted_at IS NULL;',
      [workoutId]
    );
    position = (r?.p ?? -1) + 1;
  }
  await db.runAsync(
    `INSERT INTO workout_exercises (id, workout_id, exercise_id, position, rest_seconds, notes, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, workoutId, exerciseId, position, options?.rest_seconds ?? 90, options?.notes ?? null, ts, ts]
  );
  const row = (await db.getFirstAsync<WorkoutExercise>(
    `SELECT ${WE_FIELDS} FROM workout_exercises WHERE id = ?;`,
    [id]
  ))!;
  await enqueueSync('workout_exercises', id, 'upsert', row);
  return row;
};

export const removeWorkoutExercise = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync(
    'UPDATE workout_exercises SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [ts, ts, id]
  );
  await enqueueSync('workout_exercises', id, 'delete');
};

// ─── Sets ───────────────────────────────────────────────────

export const listSetsForWorkoutExercise = async (
  weId: string
): Promise<WorkoutSet[]> => {
  const db = getDb();
  return db.getAllAsync<WorkoutSet>(
    `SELECT ${WS_FIELDS} FROM workout_sets WHERE workout_exercise_id = ? AND deleted_at IS NULL ORDER BY set_index ASC;`,
    [weId]
  );
};

export const createSet = async (input: {
  workout_exercise_id: string;
  set_index: number;
  set_type: SetType;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: 0 | 1;
  notes: string | null;
}): Promise<WorkoutSet> => {
  const db = getDb();
  const id = newId();
  const ts = now();
  await db.runAsync(
    `INSERT INTO workout_sets (id, workout_exercise_id, set_index, set_type, weight, reps, rpe, completed, notes, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, input.workout_exercise_id, input.set_index, input.set_type, input.weight, input.reps, input.rpe, input.completed, input.notes, ts, ts]
  );
  const row = (await db.getFirstAsync<WorkoutSet>(
    `SELECT ${WS_FIELDS} FROM workout_sets WHERE id = ?;`,
    [id]
  ))!;
  await enqueueSync('workout_sets', id, 'upsert', row);
  return row;
};

export const updateSet = async (id: string, patch: Partial<WorkoutSet>): Promise<void> => {
  const db = getDb();
  const fields = Object.keys(patch).filter((k) => k !== 'id' && k !== 'created_at');
  if (!fields.length) return;
  const ts = now();
  fields.push('updated_at');
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (f === 'updated_at' ? ts : (patch as any)[f]));
  await db.runAsync(`UPDATE workout_sets SET ${setClause} WHERE id = ?;`, [...values, id]);
  const row = await db.getFirstAsync<WorkoutSet>(
    `SELECT ${WS_FIELDS} FROM workout_sets WHERE id = ?;`,
    [id]
  );
  if (row) await enqueueSync('workout_sets', id, 'upsert', row);
};

export const deleteSet = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync('UPDATE workout_sets SET deleted_at = ?, updated_at = ? WHERE id = ?;', [ts, ts, id]);
  await enqueueSync('workout_sets', id, 'delete');
};

// ─── Aggregates ─────────────────────────────────────────────

export const getWorkoutVolume = async (workoutId: string): Promise<number> => {
  const db = getDb();
  const r = await db.getFirstAsync<{ v: number | null }>(
    `SELECT COALESCE(SUM(ws.weight * ws.reps), 0) AS v
     FROM workout_sets ws
     JOIN workout_exercises we ON we.id = ws.workout_exercise_id
     WHERE we.workout_id = ? AND ws.completed = 1 AND ws.deleted_at IS NULL AND we.deleted_at IS NULL;`,
    [workoutId]
  );
  return r?.v ?? 0;
};

export const getPreviousSetsForExercise = async (
  exerciseId: string,
  excludeWorkoutId?: string,
  limit: number = 1
): Promise<WorkoutSet[]> => {
  const db = getDb();
  return db.getAllAsync<WorkoutSet>(
    `SELECT ${WS_FIELDS.replace(/^/, 'ws.').replace(/, /g, ', ws.')}
     FROM workout_sets ws
     JOIN workout_exercises we ON we.id = ws.workout_exercise_id
     JOIN workouts w ON w.id = we.workout_id
     WHERE we.exercise_id = ?
       AND w.completed_at IS NOT NULL
       ${excludeWorkoutId ? 'AND w.id != ?' : ''}
       AND ws.completed = 1
       AND ws.deleted_at IS NULL
       AND we.deleted_at IS NULL
     ORDER BY w.completed_at DESC, ws.set_index ASC
     LIMIT ?;`,
    excludeWorkoutId ? [exerciseId, excludeWorkoutId, limit] : [exerciseId, limit]
  );
};
