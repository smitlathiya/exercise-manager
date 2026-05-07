import { getDb } from '../db';
import { newId, now } from '@/utils/id';
import { enqueueSync } from '../sync';
import type { ProgressPhoto } from '@/types';

const FIELDS =
  'id, taken_at, category, local_uri, thumb_uri, drive_file_id, width, height, created_at, updated_at, deleted_at';

export const createProgressPhoto = async (
  input: Omit<ProgressPhoto, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<ProgressPhoto> => {
  const db = getDb();
  const id = newId();
  const ts = now();
  await db.runAsync(
    `INSERT INTO progress_photos (${FIELDS})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
    [id, input.taken_at, input.category, input.local_uri, input.thumb_uri, input.drive_file_id, input.width, input.height, ts, ts]
  );
  const row = (await db.getFirstAsync<ProgressPhoto>(
    `SELECT ${FIELDS} FROM progress_photos WHERE id = ?;`,
    [id]
  ))!;
  await enqueueSync('progress_photos', id, 'upsert', row);
  return row;
};

export const listProgressPhotos = async (
  category?: 'front' | 'side' | 'back'
): Promise<ProgressPhoto[]> => {
  const db = getDb();
  if (category) {
    return db.getAllAsync<ProgressPhoto>(
      `SELECT ${FIELDS} FROM progress_photos WHERE deleted_at IS NULL AND category = ? ORDER BY taken_at DESC;`,
      [category]
    );
  }
  return db.getAllAsync<ProgressPhoto>(
    `SELECT ${FIELDS} FROM progress_photos WHERE deleted_at IS NULL ORDER BY taken_at DESC;`
  );
};

export const setPhotoDriveId = async (id: string, driveId: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync(
    'UPDATE progress_photos SET drive_file_id = ?, updated_at = ? WHERE id = ?;',
    [driveId, ts, id]
  );
};

export const deletePhoto = async (id: string): Promise<void> => {
  const db = getDb();
  const ts = now();
  await db.runAsync(
    'UPDATE progress_photos SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [ts, ts, id]
  );
  await enqueueSync('progress_photos', id, 'delete');
};
