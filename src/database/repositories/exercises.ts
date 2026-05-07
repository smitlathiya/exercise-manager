import { getDb } from '../db';
import { newId, now } from '@/utils/id';
import { enqueueSync } from '../sync';
import type { Exercise, MuscleGroup } from '@/types';

const SELECT_FIELDS =
  'id, name, muscle_group, equipment, instructions, difficulty, is_favorite, is_custom, notes, created_at, updated_at, deleted_at';

export const listExercises = async (filters?: {
  muscle?: MuscleGroup | 'All';
  query?: string;
  favoritesOnly?: boolean;
}): Promise<Exercise[]> => {
  const db = getDb();
  const where: string[] = ['deleted_at IS NULL'];
  const params: (string | number)[] = [];
  if (filters?.muscle && filters.muscle !== 'All') {
    where.push('muscle_group = ?');
    params.push(filters.muscle);
  }
  if (filters?.query) {
    where.push('LOWER(name) LIKE ?');
    params.push(`%${filters.query.toLowerCase()}%`);
  }
  if (filters?.favoritesOnly) {
    where.push('is_favorite = 1');
  }
  const sql = `SELECT ${SELECT_FIELDS} FROM exercises WHERE ${where.join(
    ' AND '
  )} ORDER BY name ASC;`;
  return db.getAllAsync<Exercise>(sql, params);
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  const db = getDb();
  const row = await db.getFirstAsync<Exercise>(
    `SELECT ${SELECT_FIELDS} FROM exercises WHERE id = ? AND deleted_at IS NULL;`,
    [id]
  );
  return row ?? null;
};

export const createExercise = async (
  e: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<Exercise> => {
  const db = getDb();
  const ts = now();
  const id = newId();
  await db.runAsync(
    `INSERT INTO exercises (id, name, muscle_group, equipment, instructions, difficulty, is_favorite, is_custom, notes, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, e.name, e.muscle_group, e.equipment, e.instructions ?? null, e.difficulty, e.is_favorite, e.is_custom, e.notes ?? null, ts, ts]
  );
  const row = (await getExercise(id))!;
  await enqueueSync('exercises', id, 'upsert', row);
  return row;
};

export const updateExercise = async (
  id: string,
  patch: Partial<Exercise>
): Promise<void> => {
  const db = getDb();
  const fields = Object.keys(patch).filter((k) => k !== 'id' && k !== 'created_at');
  if (!fields.length) return;
  const ts = now();
  fields.push('updated_at');
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (f === 'updated_at' ? ts : (patch as any)[f]));
  await db.runAsync(`UPDATE exercises SET ${setClause} WHERE id = ?;`, [...values, id]);
  const row = await getExercise(id);
  if (row) await enqueueSync('exercises', id, 'upsert', row);
};

export const toggleFavoriteExercise = async (id: string): Promise<void> => {
  const ex = await getExercise(id);
  if (!ex) return;
  await updateExercise(id, { is_favorite: ex.is_favorite ? 0 : 1 });
};

export const softDeleteExercise = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync(
    'UPDATE exercises SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [ts, ts, id]
  );
  await enqueueSync('exercises', id, 'delete');
};
