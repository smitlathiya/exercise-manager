import type * as SQLite from 'expo-sqlite';
import { newId, now } from '@/utils/id';
import type { MuscleGroup, Equipment, Difficulty } from '@/types';

interface SeedExercise {
  name: string;
  muscle_group: MuscleGroup;
  equipment: Equipment;
  difficulty: Difficulty;
  instructions: string;
}

const SEED: SeedExercise[] = [
  // Chest
  { name: 'Barbell Bench Press', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Lie flat, lower bar to mid-chest, press up.' },
  { name: 'Incline Dumbbell Press', muscle_group: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', instructions: 'Set bench to 30-45°, press dumbbells up.' },
  { name: 'Dumbbell Flyes', muscle_group: 'Chest', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Slight bend in elbows, open and close arms in arc.' },
  { name: 'Cable Crossover', muscle_group: 'Chest', equipment: 'Cable', difficulty: 'intermediate', instructions: 'Bring cables together in front of chest with slight bend.' },
  { name: 'Push-Up', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'beginner', instructions: 'Plank position, lower chest, push up.' },
  { name: 'Dips (Chest)', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate', instructions: 'Lean forward, lower until shoulders below elbows.' },

  // Back
  { name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'advanced', instructions: 'Hinge at hips, neutral spine, drive through floor.' },
  { name: 'Pull-Up', muscle_group: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate', instructions: 'Hang, pull chest to bar.' },
  { name: 'Barbell Row', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Hinge, row bar to lower chest.' },
  { name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Cable', difficulty: 'beginner', instructions: 'Pull bar to upper chest, control return.' },
  { name: 'Seated Cable Row', muscle_group: 'Back', equipment: 'Cable', difficulty: 'beginner', instructions: 'Pull handle to abdomen, squeeze shoulder blades.' },
  { name: 'Single-Arm Dumbbell Row', muscle_group: 'Back', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'One knee on bench, row dumbbell to hip.' },
  { name: 'Face Pull', muscle_group: 'Back', equipment: 'Cable', difficulty: 'beginner', instructions: 'Pull rope to face, externally rotate shoulders.' },

  // Legs
  { name: 'Back Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'advanced', instructions: 'Bar on upper traps, squat below parallel.' },
  { name: 'Front Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'advanced', instructions: 'Bar in front rack, upright torso.' },
  { name: 'Romanian Deadlift', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Hinge at hips, slight knee bend, feel hamstrings.' },
  { name: 'Leg Press', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Drive through heels, do not lock knees.' },
  { name: 'Walking Lunges', muscle_group: 'Legs', equipment: 'Dumbbell', difficulty: 'intermediate', instructions: 'Step forward, drop back knee toward floor.' },
  { name: 'Leg Curl', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Curl heels to glutes, control eccentric.' },
  { name: 'Leg Extension', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Extend knees fully, squeeze quads.' },
  { name: 'Standing Calf Raise', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Full range, pause at top.' },
  { name: 'Hip Thrust', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Drive hips up, squeeze glutes at top.' },

  // Shoulders
  { name: 'Overhead Press', muscle_group: 'Shoulder', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Press bar overhead, lock out.' },
  { name: 'Seated Dumbbell Press', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Press dumbbells overhead from shoulder height.' },
  { name: 'Lateral Raise', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Raise arms to sides until parallel.' },
  { name: 'Rear Delt Fly', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Bend over, raise arms wide.' },
  { name: 'Upright Row', muscle_group: 'Shoulder', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Pull bar to chest, elbows lead.' },
  { name: 'Arnold Press', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'intermediate', instructions: 'Rotate palms while pressing overhead.' },

  // Arms
  { name: 'Barbell Curl', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'beginner', instructions: 'Curl bar without swinging.' },
  { name: 'Dumbbell Curl', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Curl dumbbells alternating or together.' },
  { name: 'Hammer Curl', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Neutral grip, curl up.' },
  { name: 'Preacher Curl', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Arms on pad, curl with strict form.' },
  { name: 'Tricep Pushdown', muscle_group: 'Arms', equipment: 'Cable', difficulty: 'beginner', instructions: 'Press cable down, lock out elbows.' },
  { name: 'Skullcrusher', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Lower bar to forehead, extend.' },
  { name: 'Overhead Tricep Extension', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Lower dumbbell behind head, extend up.' },
  { name: 'Close-Grip Bench Press', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Hands shoulder-width, elbows tucked.' },

  // Core
  { name: 'Plank', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', instructions: 'Hold rigid plank, neutral spine.' },
  { name: 'Hanging Leg Raise', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'intermediate', instructions: 'Hang from bar, raise legs to parallel.' },
  { name: 'Cable Crunch', muscle_group: 'Core', equipment: 'Cable', difficulty: 'beginner', instructions: 'Kneel, crunch elbows to thighs.' },
  { name: 'Russian Twist', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', instructions: 'Sit back, rotate side to side.' },
  { name: 'Ab Wheel Rollout', muscle_group: 'Core', equipment: 'Other', difficulty: 'advanced', instructions: 'Roll forward, return without arching.' },

  // Cardio
  { name: 'Treadmill Run', muscle_group: 'Cardio', equipment: 'Machine', difficulty: 'beginner', instructions: 'Steady pace or intervals.' },
  { name: 'Stationary Bike', muscle_group: 'Cardio', equipment: 'Machine', difficulty: 'beginner', instructions: 'Steady or interval cycling.' },
  { name: 'Rowing Machine', muscle_group: 'Cardio', equipment: 'Machine', difficulty: 'intermediate', instructions: 'Drive legs, body, arms in sequence.' },
  { name: 'Jump Rope', muscle_group: 'Cardio', equipment: 'Other', difficulty: 'beginner', instructions: 'Light bounces, smooth wrists.' },
];

export const seedExercisesIfEmpty = async (
  db: SQLite.SQLiteDatabase
): Promise<void> => {
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM exercises;'
  );
  if (row && row.c > 0) return;

  const ts = now();
  await db.withTransactionAsync(async () => {
    for (const e of SEED) {
      await db.runAsync(
        `INSERT INTO exercises
        (id, name, muscle_group, equipment, instructions, difficulty, is_favorite, is_custom, notes, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, NULL, ?, ?, NULL);`,
        [newId(), e.name, e.muscle_group, e.equipment, e.instructions, e.difficulty, ts, ts]
      );
    }
  });
};
