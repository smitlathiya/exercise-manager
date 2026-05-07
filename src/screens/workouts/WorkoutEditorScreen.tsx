import React, { useCallback, useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Card,
  Text,
  Button,
  Input,
  Pill,
  EmptyState,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  getWorkout,
  updateWorkout,
  listWorkoutExercises,
  addExerciseToWorkout,
  removeWorkoutExercise,
  listSetsForWorkoutExercise,
  createSet,
  createWorkout,
} from '@/database/repositories/workouts';
import { getExercise } from '@/database/repositories/exercises';
import { ExercisePicker } from './ExercisePicker';
import { WORKOUT_TEMPLATES } from '@/constants';
import type { Workout, WorkoutExercise, WorkoutSet, WorkoutTemplateKind, Exercise } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

interface ExerciseRow {
  we: WorkoutExercise;
  exercise: Exercise | null;
  setCount: number;
}

export const WorkoutEditorScreen: React.FC = () => {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'WorkoutEditor'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const passedId = route.params?.workoutId;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [picker, setPicker] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<WorkoutTemplateKind>('Custom Split');
  const [notes, setNotes] = useState('');

  const ensureWorkout = useCallback(async (): Promise<string> => {
    if (passedId) return passedId;
    const w = await createWorkout({ name: 'New Workout', template_kind: 'Custom Split' });
    nav.setParams({ workoutId: w.id });
    return w.id;
  }, [passedId, nav]);

  const load = useCallback(async () => {
    const id = await ensureWorkout();
    const w = await getWorkout(id);
    if (!w) return;
    setWorkout(w);
    setName(w.name);
    setKind(w.template_kind);
    setNotes(w.notes ?? '');
    const wes = await listWorkoutExercises(id);
    const next: ExerciseRow[] = [];
    for (const we of wes) {
      const ex = await getExercise(we.exercise_id);
      const sets = await listSetsForWorkoutExercise(we.id);
      next.push({ we, exercise: ex, setCount: sets.length });
    }
    setRows(next);
  }, [ensureWorkout]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onSave = async () => {
    if (!workout) return;
    await updateWorkout(workout.id, { name, template_kind: kind, notes: notes || null });
  };

  const onSaveTemplate = async () => {
    if (!workout) return;
    await updateWorkout(workout.id, { name, template_kind: kind, notes: notes || null, is_template: 1 });
    Alert.alert('Saved as template');
  };

  const onPick = async (ex: Exercise) => {
    if (!workout) return;
    const we = await addExerciseToWorkout(workout.id, ex.id);
    await createSet({
      workout_exercise_id: we.id,
      set_index: 0,
      set_type: 'normal',
      weight: 0,
      reps: 0,
      rpe: null,
      completed: 0,
      notes: null,
    });
    await load();
  };

  const startWorkout = async () => {
    if (!workout) return;
    if (rows.length === 0) {
      Alert.alert('Add at least one exercise.');
      return;
    }
    await onSave();
    nav.navigate('WorkoutLive', { workoutId: workout.id });
  };

  if (!workout) {
    return (
      <Screen scroll>
        <ScreenHeader title="Workout" onBack={() => nav.goBack()} />
        <Text color="muted">Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={workout.is_template ? 'Edit Template' : 'Workout'}
        onBack={() => nav.goBack()}
        rightAction={{ label: 'Save', onPress: onSave }}
      />

      <Card>
        <Input label="Name" value={name} onChangeText={setName} onEndEditing={onSave} />
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.xs }}>
          SPLIT
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          {WORKOUT_TEMPLATES.map((k) => (
            <Pill key={k} label={k} active={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>
        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          onEndEditing={onSave}
          multiline
        />
      </Card>

      <View style={{ height: t.spacing.lg }} />

      {rows.length === 0 ? (
        <EmptyState
          title="No exercises yet"
          description="Add exercises to build your workout."
          actionLabel="Add exercise"
          onAction={() => setPicker(true)}
        />
      ) : (
        rows.map((row) => (
          <Card key={row.we.id} style={{ marginBottom: t.spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="h3">{row.exercise?.name ?? 'Unknown'}</Text>
                <Text variant="caption" color="muted">
                  {row.exercise?.muscle_group} · {row.setCount} sets · rest {row.we.rest_seconds}s
                </Text>
              </View>
              <Button
                title="Remove"
                variant="ghost"
                size="sm"
                onPress={async () => {
                  await removeWorkoutExercise(row.we.id);
                  await load();
                }}
              />
            </View>
          </Card>
        ))
      )}

      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
        <Button title="Add exercise" variant="secondary" onPress={() => setPicker(true)} style={{ flex: 1 }} />
        <Button title={workout.is_template ? 'Save template' : 'Start'} onPress={workout.is_template ? onSaveTemplate : startWorkout} style={{ flex: 1 }} />
      </View>

      {!workout.is_template ? (
        <Button
          title="Save as template"
          variant="ghost"
          onPress={onSaveTemplate}
          style={{ marginTop: t.spacing.md }}
        />
      ) : null}

      <ExercisePicker visible={picker} onClose={() => setPicker(false)} onPick={onPick} />
    </Screen>
  );
};
