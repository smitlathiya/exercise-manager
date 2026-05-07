import React, { useEffect, useMemo } from 'react';
import { View, Pressable, Alert, TextInput } from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Screen, Text, Button, Card, Pill } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useWorkoutSession } from '@/store/workoutSession';
import { useSettingsStore } from '@/store/settings';
import { useTicker } from '@/hooks/useTicker';
import { formatDuration, formatVolume, formatWeight, sumBy } from '@/utils/calc';
import { ACTIVE_WORKOUT_AUTOSAVE_MS, SET_TYPES } from '@/constants';
import type { WorkoutSet, SetType } from '@/types';
import { getPreviousSetsForExercise } from '@/database/repositories/workouts';
import { useState, useCallback } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

const setTypeLabel: Record<SetType, string> = {
  normal: 'N',
  warmup: 'W',
  failure: 'F',
  dropset: 'D',
  superset: 'S',
};

const setTypeColor: Record<SetType, string> = {
  normal: '#9AA8BD',
  warmup: '#22D3EE',
  failure: '#EF4444',
  dropset: '#A78BFA',
  superset: '#F59E0B',
};

export const WorkoutLiveScreen: React.FC = () => {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'WorkoutLive'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unit = useSettingsStore((s) => s.unit);
  const defaultRest = useSettingsStore((s) => s.defaultRestSeconds);

  const session = useWorkoutSession();
  const tick = useTicker(1000);
  const [previousByEx, setPreviousByEx] = useState<Record<string, WorkoutSet[]>>({});

  useEffect(() => {
    void (async () => {
      await session.loadOrStart(route.params.workoutId);
      if (!session.startedAt) await session.start();
    })();
  }, [route.params.workoutId]);

  useEffect(() => {
    const id = setInterval(() => {
      void session.persistSnapshot();
    }, ACTIVE_WORKOUT_AUTOSAVE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void (async () => {
      const next: Record<string, WorkoutSet[]> = {};
      for (const e of session.exercises) {
        next[e.workoutExercise.exercise_id] = await getPreviousSetsForExercise(
          e.workoutExercise.exercise_id,
          session.workoutId ?? undefined,
          5
        );
      }
      setPreviousByEx(next);
    })();
  }, [session.exercises.length, session.workoutId]);

  const elapsed = useMemo(() => {
    if (!session.startedAt) return 0;
    const pause = session.pausedAt ? Date.now() - session.pausedAt : 0;
    return Math.max(
      0,
      Math.floor(
        (Date.now() - session.startedAt - session.pausedDuration - pause) / 1000
      )
    );
  }, [session.startedAt, session.pausedAt, session.pausedDuration, tick]);

  const restSecondsLeft = session.restEndsAt
    ? Math.max(0, Math.ceil((session.restEndsAt - Date.now()) / 1000))
    : 0;

  const totalVolume = useMemo(() => {
    return session.exercises.reduce(
      (acc, e) =>
        acc +
        sumBy(
          e.sets.filter((s) => s.completed),
          (s) => s.weight * s.reps
        ),
      0
    );
  }, [session.exercises]);

  const finishWorkout = () => {
    Alert.alert('Finish workout?', 'This saves and ends the session.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        style: 'default',
        onPress: async () => {
          await session.finish();
          nav.goBack();
        },
      },
    ]);
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel workout?',
      'The session will be marked incomplete. Logged sets stay saved.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Cancel workout',
          style: 'destructive',
          onPress: async () => {
            await session.abandon();
            nav.goBack();
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      {/* Timer header */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="caption" color="muted">
          {session.workout?.name ?? 'Workout'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.xs }}>
          <View>
            <Text variant="caption" color="dim">
              ELAPSED
            </Text>
            <Text variant="display">{formatDuration(elapsed)}</Text>
          </View>
          <View>
            <Text variant="caption" color="dim">
              VOLUME
            </Text>
            <Text variant="h2" color="primary">
              {formatVolume(totalVolume, unit)}
            </Text>
          </View>
          <View>
            <Text variant="caption" color="dim">
              REST
            </Text>
            <Text variant="h2" color={restSecondsLeft > 0 ? 'warning' : 'dim'}>
              {restSecondsLeft > 0 ? `${restSecondsLeft}s` : '—'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
          {session.pausedAt ? (
            <Button title="Resume" variant="success" onPress={() => session.resume()} style={{ flex: 1 }} />
          ) : (
            <Button title="Pause" variant="secondary" onPress={() => session.pause()} style={{ flex: 1 }} />
          )}
          <Button
            title={`Rest ${defaultRest}s`}
            variant="secondary"
            onPress={() => session.startRest(defaultRest)}
            style={{ flex: 1 }}
          />
          {restSecondsLeft > 0 ? (
            <Button title="Skip" variant="ghost" onPress={() => session.cancelRest()} />
          ) : null}
        </View>
      </Card>

      {session.exercises.map((e) => (
        <ExerciseLiveCard
          key={e.workoutExercise.id}
          weId={e.workoutExercise.id}
          sets={e.sets}
          previous={previousByEx[e.workoutExercise.exercise_id] ?? []}
          unit={unit}
        />
      ))}

      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
        <Button title="Cancel" variant="ghost" onPress={cancelWorkout} style={{ flex: 1 }} />
        <Button title="Finish workout" variant="success" onPress={finishWorkout} style={{ flex: 2 }} />
      </View>
    </Screen>
  );
};

interface ExerciseLiveCardProps {
  weId: string;
  sets: WorkoutSet[];
  previous: WorkoutSet[];
  unit: 'kg' | 'lbs';
}

const ExerciseLiveCard: React.FC<ExerciseLiveCardProps> = ({
  weId,
  sets,
  previous,
  unit,
}) => {
  const t = useTheme();
  const session = useWorkoutSession();
  const [exerciseName, setExerciseName] = useState<string>('Exercise');

  useEffect(() => {
    void (async () => {
      const ex = session.exercises.find((e) => e.workoutExercise.id === weId);
      if (!ex) return;
      const { getExercise } = await import('@/database/repositories/exercises');
      const e = await getExercise(ex.workoutExercise.exercise_id);
      if (e) setExerciseName(e.name);
    })();
  }, [weId, session.exercises]);

  return (
    <Card style={{ marginBottom: t.spacing.md }}>
      <Text variant="h3">{exerciseName}</Text>
      {previous.length ? (
        <Text variant="caption" color="muted" style={{ marginTop: t.spacing.xs }}>
          Last: {previous.map((p) => `${p.weight}×${p.reps}`).join(' · ')}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: t.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
        }}
      >
        <Text variant="caption" color="dim" style={{ width: 36 }}>SET</Text>
        <Text variant="caption" color="dim" style={{ flex: 1 }}>TYPE</Text>
        <Text variant="caption" color="dim" style={{ width: 70 }}>{unit.toUpperCase()}</Text>
        <Text variant="caption" color="dim" style={{ width: 50 }}>REPS</Text>
        <Text variant="caption" color="dim" style={{ width: 50 }}>RPE</Text>
        <Text variant="caption" color="dim" style={{ width: 28 }}>✓</Text>
      </View>
      {sets.map((s, idx) => (
        <SetRow key={s.id} set={s} index={idx} />
      ))}
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
        <Button
          title="+ Set"
          variant="secondary"
          size="sm"
          onPress={() =>
            session.addSet(weId, {
              weight: sets[sets.length - 1]?.weight,
              reps: sets[sets.length - 1]?.reps,
            })
          }
        />
        <Button
          title="+ Warmup"
          variant="ghost"
          size="sm"
          onPress={() => session.addSet(weId, { set_type: 'warmup' })}
        />
      </View>
    </Card>
  );
};

interface SetRowProps {
  set: WorkoutSet;
  index: number;
}

const SetRow: React.FC<SetRowProps> = ({ set, index }) => {
  const t = useTheme();
  const session = useWorkoutSession();
  const [w, setW] = useState(set.weight ? String(set.weight) : '');
  const [r, setR] = useState(set.reps ? String(set.reps) : '');
  const [rpe, setRpe] = useState(set.rpe ? String(set.rpe) : '');

  useEffect(() => {
    setW(set.weight ? String(set.weight) : '');
    setR(set.reps ? String(set.reps) : '');
    setRpe(set.rpe ? String(set.rpe) : '');
  }, [set.id, set.weight, set.reps, set.rpe]);

  const cycleType = () => {
    const idx = SET_TYPES.indexOf(set.set_type);
    const next = SET_TYPES[(idx + 1) % SET_TYPES.length]!;
    void session.patchSet(set.id, { set_type: next });
  };

  const commit = () => {
    const patch: Partial<WorkoutSet> = {};
    const weight = Number(w);
    const reps = Number(r);
    const r1 = rpe ? Number(rpe) : null;
    if (!Number.isNaN(weight)) patch.weight = weight;
    if (!Number.isNaN(reps)) patch.reps = reps;
    patch.rpe = r1 && !Number.isNaN(r1) ? r1 : null;
    void session.patchSet(set.id, patch);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: t.spacing.xs,
        opacity: set.completed ? 0.6 : 1,
      }}
    >
      <Text variant="bodyBold" style={{ width: 36, color: t.colors.text }}>
        {index + 1}
      </Text>
      <Pressable onPress={cycleType} style={{ flex: 1 }}>
        <Text
          variant="caption"
          weight="700"
          style={{ color: setTypeColor[set.set_type] }}
        >
          {setTypeLabel[set.set_type]} · {set.set_type}
        </Text>
      </Pressable>
      <CompactInput value={w} onChange={setW} onBlur={commit} width={70} />
      <CompactInput value={r} onChange={setR} onBlur={commit} width={50} />
      <CompactInput value={rpe} onChange={setRpe} onBlur={commit} width={50} />
      <Pressable
        onPress={() => session.toggleSetComplete(set.id)}
        onLongPress={() => session.removeSet(set.id)}
        hitSlop={6}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: set.completed ? t.colors.success : t.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: t.colors.border,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {set.completed ? (
          <Text style={{ color: '#FFF', fontWeight: '800' }}>✓</Text>
        ) : null}
      </Pressable>
    </View>
  );
};

interface CompactInputProps {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  width: number;
}

const CompactInput: React.FC<CompactInputProps> = ({ value, onChange, onBlur, width }) => {
  const t = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      keyboardType="decimal-pad"
      placeholder="—"
      placeholderTextColor={t.colors.textDim}
      style={{
        width,
        height: 36,
        marginRight: 4,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: t.colors.surfaceAlt,
        color: t.colors.text,
        textAlign: 'center',
      }}
    />
  );
};
