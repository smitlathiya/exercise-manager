import dayjs from 'dayjs';
import { getDb } from '../db';

export interface DailyVolumePoint {
  day: string; // YYYY-MM-DD
  volume: number;
  workouts: number;
}

export const getStreak = async (): Promise<number> => {
  const db = getDb();
  const rows = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT strftime('%Y-%m-%d', completed_at / 1000, 'unixepoch') AS day
     FROM workouts
     WHERE completed_at IS NOT NULL AND deleted_at IS NULL
     ORDER BY day DESC;`
  );
  if (!rows.length) return 0;

  let streak = 0;
  let cursor = dayjs().startOf('day');
  for (const row of rows) {
    const d = dayjs(row.day);
    if (d.isSame(cursor, 'day')) {
      streak += 1;
      cursor = cursor.subtract(1, 'day');
    } else if (d.isSame(cursor.subtract(1, 'day'), 'day') && streak === 0) {
      streak = 1;
      cursor = d.subtract(1, 'day');
    } else if (d.isBefore(cursor, 'day')) {
      break;
    }
  }
  return streak;
};

export const getWeeklyWorkoutCount = async (): Promise<number> => {
  const db = getDb();
  const start = dayjs().startOf('week').valueOf();
  const r = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM workouts WHERE completed_at >= ? AND deleted_at IS NULL;`,
    [start]
  );
  return r?.c ?? 0;
};

export const getWeeklyVolume = async (): Promise<number> => {
  const db = getDb();
  const start = dayjs().startOf('week').valueOf();
  const r = await db.getFirstAsync<{ v: number | null }>(
    `SELECT COALESCE(SUM(ws.weight * ws.reps), 0) AS v
     FROM workout_sets ws
     JOIN workout_exercises we ON we.id = ws.workout_exercise_id
     JOIN workouts w ON w.id = we.workout_id
     WHERE w.completed_at >= ? AND ws.completed = 1
       AND ws.deleted_at IS NULL AND we.deleted_at IS NULL AND w.deleted_at IS NULL;`,
    [start]
  );
  return r?.v ?? 0;
};

export const getDailyVolumeRange = async (
  days: number
): Promise<DailyVolumePoint[]> => {
  const db = getDb();
  const start = dayjs().startOf('day').subtract(days - 1, 'day').valueOf();
  const rows = await db.getAllAsync<{
    day: string;
    volume: number;
    workouts: number;
  }>(
    `SELECT strftime('%Y-%m-%d', w.completed_at / 1000, 'unixepoch') AS day,
            COALESCE(SUM(ws.weight * ws.reps), 0) AS volume,
            COUNT(DISTINCT w.id) AS workouts
     FROM workouts w
     LEFT JOIN workout_exercises we ON we.workout_id = w.id AND we.deleted_at IS NULL
     LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id AND ws.deleted_at IS NULL AND ws.completed = 1
     WHERE w.completed_at >= ? AND w.deleted_at IS NULL
     GROUP BY day
     ORDER BY day ASC;`,
    [start]
  );
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: DailyVolumePoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = dayjs().startOf('day').subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
    const r = map.get(d);
    out.push({ day: d, volume: r?.volume ?? 0, workouts: r?.workouts ?? 0 });
  }
  return out;
};

export const getMuscleFrequency = async (
  days: number = 30
): Promise<{ muscle_group: string; sets: number }[]> => {
  const db = getDb();
  const start = dayjs().startOf('day').subtract(days - 1, 'day').valueOf();
  return db.getAllAsync<{ muscle_group: string; sets: number }>(
    `SELECT e.muscle_group, COUNT(ws.id) AS sets
     FROM workout_sets ws
     JOIN workout_exercises we ON we.id = ws.workout_exercise_id
     JOIN workouts w ON w.id = we.workout_id
     JOIN exercises e ON e.id = we.exercise_id
     WHERE w.completed_at >= ? AND ws.completed = 1
       AND ws.deleted_at IS NULL AND we.deleted_at IS NULL AND w.deleted_at IS NULL
     GROUP BY e.muscle_group
     ORDER BY sets DESC;`,
    [start]
  );
};

export const getCaloriesToday = async (): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
}> => {
  const db = getDb();
  const start = dayjs().startOf('day').valueOf();
  const end = dayjs().endOf('day').valueOf();
  const r = await db.getFirstAsync<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water_ml: number;
  }>(
    `SELECT COALESCE(SUM(calories), 0) AS calories,
            COALESCE(SUM(protein), 0) AS protein,
            COALESCE(SUM(carbs), 0) AS carbs,
            COALESCE(SUM(fat), 0) AS fat,
            COALESCE(SUM(water_ml), 0) AS water_ml
     FROM nutrition_logs
     WHERE logged_at >= ? AND logged_at <= ? AND deleted_at IS NULL;`,
    [start, end]
  );
  return r ?? { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 };
};

export const getMonthlyConsistency = async (): Promise<
  { day: string; count: number }[]
> => {
  const db = getDb();
  const start = dayjs().startOf('day').subtract(29, 'day').valueOf();
  const rows = await db.getAllAsync<{ day: string; count: number }>(
    `SELECT strftime('%Y-%m-%d', completed_at / 1000, 'unixepoch') AS day,
            COUNT(*) AS count
     FROM workouts
     WHERE completed_at >= ? AND deleted_at IS NULL
     GROUP BY day
     ORDER BY day ASC;`,
    [start]
  );
  const map = new Map(rows.map((r) => [r.day, r.count]));
  const out: { day: string; count: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = dayjs().startOf('day').subtract(29 - i, 'day').format('YYYY-MM-DD');
    out.push({ day: d, count: map.get(d) ?? 0 });
  }
  return out;
};
