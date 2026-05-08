import type * as SQLite from 'expo-sqlite';
import { newId, now } from '@/utils/id';
import { MUSCLE_SEPARATOR } from '@/constants';
import type { MuscleGroup, Equipment, Difficulty } from '@/types';

interface SeedExercise {
  name: string;
  muscle_group: MuscleGroup;
  equipment: Equipment;
  difficulty: Difficulty;
  instructions: string;
  target_muscles: string[];
}

const SEED: SeedExercise[] = [
  // Chest
  { name: 'Barbell Bench Press', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Lie flat, lower bar to mid-chest, press up.', target_muscles: ['Mid Chest', 'Triceps', 'Front Delts'] },
  { name: 'Incline Dumbbell Press', muscle_group: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', instructions: 'Set bench to 30-45°, press dumbbells up.', target_muscles: ['Upper Chest', 'Front Delts', 'Triceps'] },
  { name: 'Dumbbell Flyes', muscle_group: 'Chest', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Slight bend in elbows, open and close arms in arc.', target_muscles: ['Mid Chest'] },
  { name: 'Cable Crossover', muscle_group: 'Chest', equipment: 'Cable', difficulty: 'intermediate', instructions: 'Bring cables together in front of chest with slight bend.', target_muscles: ['Mid Chest', 'Lower Chest'] },
  { name: 'Push-Up', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'beginner', instructions: 'Plank position, lower chest, push up.', target_muscles: ['Mid Chest', 'Triceps', 'Front Delts'] },
  { name: 'Dips (Chest)', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate', instructions: 'Lean forward, lower until shoulders below elbows.', target_muscles: ['Lower Chest', 'Triceps'] },

  // Back
  { name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'advanced', instructions: 'Hinge at hips, neutral spine, drive through floor.', target_muscles: ['Lower Back', 'Lats', 'Hamstrings', 'Upper Traps', 'Glutes'] },
  { name: 'Pull-Up', muscle_group: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate', instructions: 'Hang, pull chest to bar.', target_muscles: ['Lats', 'Biceps', 'Mid Traps'] },
  { name: 'Barbell Row', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Hinge, row bar to lower chest.', target_muscles: ['Lats', 'Mid Traps', 'Rhomboids', 'Biceps'] },
  { name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Cable', difficulty: 'beginner', instructions: 'Pull bar to upper chest, control return.', target_muscles: ['Lats', 'Biceps'] },
  { name: 'Seated Cable Row', muscle_group: 'Back', equipment: 'Cable', difficulty: 'beginner', instructions: 'Pull handle to abdomen, squeeze shoulder blades.', target_muscles: ['Mid Traps', 'Rhomboids', 'Lats', 'Biceps'] },
  { name: 'Single-Arm Dumbbell Row', muscle_group: 'Back', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'One knee on bench, row dumbbell to hip.', target_muscles: ['Lats', 'Mid Traps', 'Biceps'] },
  { name: 'Face Pull', muscle_group: 'Back', equipment: 'Cable', difficulty: 'beginner', instructions: 'Pull rope to face, externally rotate shoulders.', target_muscles: ['Rear Delts', 'Mid Traps', 'Rhomboids'] },

  // Legs
  { name: 'Back Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'advanced', instructions: 'Bar on upper traps, squat below parallel.', target_muscles: ['Quads', 'Glutes', 'Hamstrings'] },
  { name: 'Front Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'advanced', instructions: 'Bar in front rack, upright torso.', target_muscles: ['Quads', 'Glutes'] },
  { name: 'Romanian Deadlift', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Hinge at hips, slight knee bend, feel hamstrings.', target_muscles: ['Hamstrings', 'Glutes', 'Lower Back'] },
  { name: 'Leg Press', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Drive through heels, do not lock knees.', target_muscles: ['Quads', 'Glutes'] },
  { name: 'Walking Lunges', muscle_group: 'Legs', equipment: 'Dumbbell', difficulty: 'intermediate', instructions: 'Step forward, drop back knee toward floor.', target_muscles: ['Quads', 'Glutes', 'Hamstrings'] },
  { name: 'Leg Curl', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Curl heels to glutes, control eccentric.', target_muscles: ['Hamstrings'] },
  { name: 'Leg Extension', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Extend knees fully, squeeze quads.', target_muscles: ['Quads'] },
  { name: 'Standing Calf Raise', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'beginner', instructions: 'Full range, pause at top.', target_muscles: ['Calves'] },
  { name: 'Hip Thrust', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Drive hips up, squeeze glutes at top.', target_muscles: ['Glutes', 'Hamstrings'] },

  // Shoulders
  { name: 'Overhead Press', muscle_group: 'Shoulder', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Press bar overhead, lock out.', target_muscles: ['Front Delts', 'Side Delts', 'Triceps'] },
  { name: 'Seated Dumbbell Press', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Press dumbbells overhead from shoulder height.', target_muscles: ['Front Delts', 'Side Delts', 'Triceps'] },
  { name: 'Lateral Raise', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Raise arms to sides until parallel.', target_muscles: ['Side Delts'] },
  { name: 'Rear Delt Fly', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Bend over, raise arms wide.', target_muscles: ['Rear Delts', 'Mid Traps'] },
  { name: 'Upright Row', muscle_group: 'Shoulder', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Pull bar to chest, elbows lead.', target_muscles: ['Side Delts', 'Upper Traps'] },
  { name: 'Arnold Press', muscle_group: 'Shoulder', equipment: 'Dumbbell', difficulty: 'intermediate', instructions: 'Rotate palms while pressing overhead.', target_muscles: ['Front Delts', 'Side Delts'] },

  // Arms
  { name: 'Barbell Curl', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'beginner', instructions: 'Curl bar without swinging.', target_muscles: ['Biceps'] },
  { name: 'Dumbbell Curl', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Curl dumbbells alternating or together.', target_muscles: ['Biceps'] },
  { name: 'Hammer Curl', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Neutral grip, curl up.', target_muscles: ['Biceps', 'Brachialis', 'Forearms'] },
  { name: 'Preacher Curl', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Arms on pad, curl with strict form.', target_muscles: ['Biceps'] },
  { name: 'Tricep Pushdown', muscle_group: 'Arms', equipment: 'Cable', difficulty: 'beginner', instructions: 'Press cable down, lock out elbows.', target_muscles: ['Triceps'] },
  { name: 'Skullcrusher', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Lower bar to forehead, extend.', target_muscles: ['Triceps'] },
  { name: 'Overhead Tricep Extension', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'beginner', instructions: 'Lower dumbbell behind head, extend up.', target_muscles: ['Triceps'] },
  { name: 'Close-Grip Bench Press', muscle_group: 'Arms', equipment: 'Barbell', difficulty: 'intermediate', instructions: 'Hands shoulder-width, elbows tucked.', target_muscles: ['Triceps', 'Mid Chest', 'Front Delts'] },

  // Core
  { name: 'Plank', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', instructions: 'Hold rigid plank, neutral spine.', target_muscles: ['Abs', 'Transverse Abdominis'] },
  { name: 'Hanging Leg Raise', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'intermediate', instructions: 'Hang from bar, raise legs to parallel.', target_muscles: ['Abs', 'Hip Flexors'] },
  { name: 'Cable Crunch', muscle_group: 'Core', equipment: 'Cable', difficulty: 'beginner', instructions: 'Kneel, crunch elbows to thighs.', target_muscles: ['Abs'] },
  { name: 'Russian Twist', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', instructions: 'Sit back, rotate side to side.', target_muscles: ['Obliques', 'Abs'] },
  { name: 'Ab Wheel Rollout', muscle_group: 'Core', equipment: 'Other', difficulty: 'advanced', instructions: 'Roll forward, return without arching.', target_muscles: ['Abs', 'Transverse Abdominis'] },

  // Cardio
  { name: 'Treadmill Run', muscle_group: 'Cardio', equipment: 'Machine', difficulty: 'beginner', instructions: 'Steady pace or intervals.', target_muscles: [] },
  { name: 'Stationary Bike', muscle_group: 'Cardio', equipment: 'Machine', difficulty: 'beginner', instructions: 'Steady or interval cycling.', target_muscles: [] },
  { name: 'Rowing Machine', muscle_group: 'Cardio', equipment: 'Machine', difficulty: 'intermediate', instructions: 'Drive legs, body, arms in sequence.', target_muscles: [] },
  { name: 'Jump Rope', muscle_group: 'Cardio', equipment: 'Other', difficulty: 'beginner', instructions: 'Light bounces, smooth wrists.', target_muscles: [] },
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
        (id, name, muscle_group, equipment, instructions, difficulty, is_favorite, is_custom, notes, target_muscles, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, NULL, ?, ?, ?, NULL);`,
        [
          newId(),
          e.name,
          e.muscle_group,
          e.equipment,
          e.instructions,
          e.difficulty,
          e.target_muscles.join(MUSCLE_SEPARATOR),
          ts,
          ts,
        ]
      );
    }
  });
};

/**
 * Populate `target_muscles` for previously seeded default exercises that
 * existed before this column was introduced. Only touches rows that are
 * (a) marked non-custom, (b) match a known seed name, and (c) currently empty.
 */
export const backfillTargetMuscles = async (
  db: SQLite.SQLiteDatabase
): Promise<void> => {
  await db.withTransactionAsync(async () => {
    for (const e of SEED) {
      if (e.target_muscles.length === 0) continue;
      await db.runAsync(
        `UPDATE exercises
         SET target_muscles = ?
         WHERE name = ?
           AND is_custom = 0
           AND (target_muscles IS NULL OR target_muscles = '');`,
        [e.target_muscles.join(MUSCLE_SEPARATOR), e.name]
      );
    }
  });
};
