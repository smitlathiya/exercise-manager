import { getDb } from '../db';

const TABLES = [
  'users',
  'exercises',
  'workouts',
  'workout_exercises',
  'workout_sets',
  'body_measurements',
  'nutrition_logs',
  'progress_photos',
  'personal_records',
] as const;

export interface DatabaseSnapshot {
  version: number;
  exported_at: number;
  tables: Record<string, unknown[]>;
}

export const exportSnapshot = async (): Promise<DatabaseSnapshot> => {
  const db = getDb();
  const tables: Record<string, unknown[]> = {};
  for (const t of TABLES) {
    tables[t] = await db.getAllAsync(`SELECT * FROM ${t};`);
  }
  return {
    version: 1,
    exported_at: Date.now(),
    tables,
  };
};

export const importSnapshot = async (snap: DatabaseSnapshot): Promise<void> => {
  const db = getDb();
  await db.withTransactionAsync(async () => {
    for (const t of TABLES) {
      await db.execAsync(`DELETE FROM ${t};`);
    }
    for (const t of TABLES) {
      const rows = snap.tables[t] ?? [];
      for (const row of rows as Record<string, unknown>[]) {
        const cols = Object.keys(row);
        if (!cols.length) continue;
        const placeholders = cols.map(() => '?').join(', ');
        const values = cols.map((c) => row[c] as never);
        await db.runAsync(
          `INSERT OR REPLACE INTO ${t} (${cols.join(', ')}) VALUES (${placeholders});`,
          values
        );
      }
    }
  });
};
