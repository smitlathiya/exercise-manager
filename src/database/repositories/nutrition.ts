import { getDb } from '../db';
import { newId, now } from '@/utils/id';
import { enqueueSync } from '../sync';
import type { NutritionLog } from '@/types';

const FIELDS =
  'id, logged_at, calories, protein, carbs, fat, water_ml, meal_label, is_favorite, notes, created_at, updated_at, deleted_at';

export const createNutritionLog = async (
  input: Omit<NutritionLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<NutritionLog> => {
  const db = getDb();
  const id = newId();
  const ts = now();
  await db.runAsync(
    `INSERT INTO nutrition_logs (${FIELDS})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, input.logged_at, input.calories, input.protein, input.carbs, input.fat, input.water_ml, input.meal_label, input.is_favorite, input.notes, ts, ts]
  );
  const row = (await db.getFirstAsync<NutritionLog>(
    `SELECT ${FIELDS} FROM nutrition_logs WHERE id = ?;`,
    [id]
  ))!;
  await enqueueSync('nutrition_logs', id, 'upsert', row);
  return row;
};

export const listNutritionByDay = async (
  startMs: number,
  endMs: number
): Promise<NutritionLog[]> => {
  const db = getDb();
  return db.getAllAsync<NutritionLog>(
    `SELECT ${FIELDS} FROM nutrition_logs WHERE logged_at >= ? AND logged_at < ? AND deleted_at IS NULL ORDER BY logged_at ASC;`,
    [startMs, endMs]
  );
};

export const listFavoriteMeals = async (): Promise<NutritionLog[]> => {
  const db = getDb();
  return db.getAllAsync<NutritionLog>(
    `SELECT ${FIELDS} FROM nutrition_logs WHERE is_favorite = 1 AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 50;`
  );
};

export const deleteNutritionLog = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync(
    'UPDATE nutrition_logs SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [ts, ts, id]
  );
  await enqueueSync('nutrition_logs', id, 'delete');
};
