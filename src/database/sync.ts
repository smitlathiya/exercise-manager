import { getDb } from './db';
import { now } from '@/utils/id';
import type { SyncEntity, SyncOp } from '@/types';

export const enqueueSync = async (
  entity: SyncEntity,
  entityId: string,
  op: SyncOp,
  payload?: unknown
): Promise<void> => {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO sync_queue (entity, entity_id, op, payload, attempts, last_error, created_at)
     VALUES (?, ?, ?, ?, 0, NULL, ?);`,
    [entity, entityId, op, payload ? JSON.stringify(payload) : null, now()]
  );
};

export const getQueueLength = async (): Promise<number> => {
  const db = getDb();
  const r = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM sync_queue;'
  );
  return r?.c ?? 0;
};

export const getFailedCount = async (): Promise<number> => {
  const db = getDb();
  const r = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM sync_queue WHERE attempts >= 3;'
  );
  return r?.c ?? 0;
};

export const peekQueue = async (limit: number = 50) => {
  const db = getDb();
  return db.getAllAsync<{
    id: number;
    entity: string;
    entity_id: string;
    op: string;
    payload: string | null;
    attempts: number;
    last_error: string | null;
    created_at: number;
  }>('SELECT * FROM sync_queue ORDER BY id ASC LIMIT ?;', [limit]);
};

export const removeQueueItem = async (id: number): Promise<void> => {
  const db = getDb();
  await db.runAsync('DELETE FROM sync_queue WHERE id = ?;', [id]);
};

export const markQueueFailure = async (id: number, error: string): Promise<void> => {
  const db = getDb();
  await db.runAsync(
    'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?;',
    [error, id]
  );
};

export const clearQueue = async (): Promise<void> => {
  const db = getDb();
  await db.runAsync('DELETE FROM sync_queue;');
};
