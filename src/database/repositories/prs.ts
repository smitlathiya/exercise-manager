import { getDb } from '../db';
import { newId, now } from '@/utils/id';
import { enqueueSync } from '../sync';
import type { PersonalRecord, WorkoutSet } from '@/types';
import { estimate1RM } from '@/utils/calc';

const FIELDS =
  'id, exercise_id, kind, value, reps, weight, achieved_at, workout_set_id, created_at, updated_at, deleted_at';

export const upsertPRIfBetter = async (
  exerciseId: string,
  kind: PersonalRecord['kind'],
  value: number,
  reps: number,
  weight: number,
  workoutSetId: string | null,
  achievedAt: number
): Promise<PersonalRecord | null> => {
  const db = getDb();
  const existing = await db.getFirstAsync<PersonalRecord>(
    `SELECT ${FIELDS} FROM personal_records WHERE exercise_id = ? AND kind = ? AND deleted_at IS NULL ORDER BY value DESC LIMIT 1;`,
    [exerciseId, kind]
  );
  if (existing && existing.value >= value) return null;
  const id = newId();
  const ts = now();
  await db.runAsync(
    `INSERT INTO personal_records (${FIELDS})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, exerciseId, kind, value, reps, weight, achievedAt, workoutSetId, ts, ts]
  );
  const row = (await db.getFirstAsync<PersonalRecord>(
    `SELECT ${FIELDS} FROM personal_records WHERE id = ?;`,
    [id]
  ))!;
  await enqueueSync('personal_records', id, 'upsert', row);
  return row;
};

export const recordPRsForSet = async (
  set: WorkoutSet,
  exerciseId: string,
  achievedAt: number
): Promise<void> => {
  if (!set.completed || set.weight <= 0 || set.reps <= 0) return;
  const e1rm = estimate1RM(set.weight, set.reps);
  const volume = set.weight * set.reps;
  await upsertPRIfBetter(exerciseId, 'max_weight', set.weight, set.reps, set.weight, set.id, achievedAt);
  await upsertPRIfBetter(exerciseId, 'max_reps', set.reps, set.reps, set.weight, set.id, achievedAt);
  await upsertPRIfBetter(exerciseId, 'estimated_1rm', e1rm, set.reps, set.weight, set.id, achievedAt);
  await upsertPRIfBetter(exerciseId, 'max_volume', volume, set.reps, set.weight, set.id, achievedAt);
};

export const listPRsForExercise = async (
  exerciseId: string
): Promise<PersonalRecord[]> => {
  const db = getDb();
  return db.getAllAsync<PersonalRecord>(
    `SELECT ${FIELDS} FROM personal_records WHERE exercise_id = ? AND deleted_at IS NULL ORDER BY achieved_at DESC;`,
    [exerciseId]
  );
};

export const listRecentPRs = async (limit = 10): Promise<PersonalRecord[]> => {
  const db = getDb();
  return db.getAllAsync<PersonalRecord>(
    `SELECT ${FIELDS} FROM personal_records WHERE deleted_at IS NULL ORDER BY achieved_at DESC LIMIT ?;`,
    [limit]
  );
};

export const getBestPR = async (
  exerciseId: string,
  kind: PersonalRecord['kind']
): Promise<PersonalRecord | null> => {
  const db = getDb();
  return (
    (await db.getFirstAsync<PersonalRecord>(
      `SELECT ${FIELDS} FROM personal_records WHERE exercise_id = ? AND kind = ? AND deleted_at IS NULL ORDER BY value DESC LIMIT 1;`,
      [exerciseId, kind]
    )) ?? null
  );
};
