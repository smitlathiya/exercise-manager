import { getDb } from '../db';
import { newId, now } from '@/utils/id';
import { enqueueSync } from '../sync';
import type { BodyMeasurement } from '@/types';

const FIELDS =
  'id, measured_at, weight, body_fat, chest, waist, arms, neck, thighs, notes, created_at, updated_at, deleted_at';

export const createBodyMeasurement = async (
  input: Omit<BodyMeasurement, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<BodyMeasurement> => {
  const db = getDb();
  const id = newId();
  const ts = now();
  await db.runAsync(
    `INSERT INTO body_measurements (${FIELDS})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, input.measured_at, input.weight, input.body_fat, input.chest, input.waist, input.arms, input.neck, input.thighs, input.notes, ts, ts]
  );
  const row = (await db.getFirstAsync<BodyMeasurement>(
    `SELECT ${FIELDS} FROM body_measurements WHERE id = ?;`,
    [id]
  ))!;
  await enqueueSync('body_measurements', id, 'upsert', row);
  return row;
};

export const listBodyMeasurements = async (limit = 365): Promise<BodyMeasurement[]> => {
  const db = getDb();
  return db.getAllAsync<BodyMeasurement>(
    `SELECT ${FIELDS} FROM body_measurements WHERE deleted_at IS NULL ORDER BY measured_at DESC LIMIT ?;`,
    [limit]
  );
};

export const getLatestBodyMeasurement = async (): Promise<BodyMeasurement | null> => {
  const db = getDb();
  return (
    (await db.getFirstAsync<BodyMeasurement>(
      `SELECT ${FIELDS} FROM body_measurements WHERE deleted_at IS NULL ORDER BY measured_at DESC LIMIT 1;`
    )) ?? null
  );
};

export const deleteBodyMeasurement = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync(
    'UPDATE body_measurements SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [ts, ts, id]
  );
  await enqueueSync('body_measurements', id, 'delete');
};
