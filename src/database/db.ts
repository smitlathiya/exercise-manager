import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '@/constants';
import { SCHEMA_STATEMENTS } from './schema';
import { seedExercisesIfEmpty } from './seed';

let _db: SQLite.SQLiteDatabase | null = null;

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!_db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return _db;
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);

  for (const stmt of SCHEMA_STATEMENTS) {
    await _db.execAsync(stmt);
  }

  await seedExercisesIfEmpty(_db);
  return _db;
};

export const resetDatabase = async (): Promise<void> => {
  const db = getDb();
  const tables = [
    'sync_queue',
    'personal_records',
    'workout_sets',
    'workout_exercises',
    'workouts',
    'progress_photos',
    'nutrition_logs',
    'body_measurements',
    'exercises',
    'users',
    'meta',
  ];
  for (const t of tables) {
    await db.execAsync(`DELETE FROM ${t};`);
  }
  await seedExercisesIfEmpty(db);
};

export const closeDatabase = async (): Promise<void> => {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
};
