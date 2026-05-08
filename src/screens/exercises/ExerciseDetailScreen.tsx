import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Card,
  Text,
  Stat,
  StatRow,
  Button,
  Pill,
  ConfirmDialog,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getExercise, toggleFavoriteExercise, softDeleteExercise } from '@/database/repositories/exercises';
import { listPRsForExercise, getBestPR } from '@/database/repositories/prs';
import { useSettingsStore } from '@/store/settings';
import { formatWeight, formatVolume } from '@/utils/calc';
import { formatDate } from '@/utils/date';
import type { Exercise, PersonalRecord } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export const ExerciseDetailScreen: React.FC = () => {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ExerciseDetail'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unit = useSettingsStore((s) => s.unit);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [bestWeight, setBestWeight] = useState<PersonalRecord | null>(null);
  const [bestReps, setBestReps] = useState<PersonalRecord | null>(null);
  const [best1rm, setBest1rm] = useState<PersonalRecord | null>(null);
  const [bestVolume, setBestVolume] = useState<PersonalRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    const ex = await getExercise(route.params.exerciseId);
    setExercise(ex);
    const [list, mw, mr, m1, mv] = await Promise.all([
      listPRsForExercise(route.params.exerciseId),
      getBestPR(route.params.exerciseId, 'max_weight'),
      getBestPR(route.params.exerciseId, 'max_reps'),
      getBestPR(route.params.exerciseId, 'estimated_1rm'),
      getBestPR(route.params.exerciseId, 'max_volume'),
    ]);
    setPrs(list);
    setBestWeight(mw);
    setBestReps(mr);
    setBest1rm(m1);
    setBestVolume(mv);
  }, [route.params.exerciseId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onConfirmDelete = async () => {
    if (!exercise) return;
    await softDeleteExercise(exercise.id);
    nav.goBack();
  };

  if (!exercise) {
    return (
      <Screen scroll>
        <ScreenHeader title="Exercise" onBack={() => nav.goBack()} />
        <Text color="muted">Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={exercise.name}
        subtitle={`${exercise.muscle_group} · ${exercise.equipment}`}
        onBack={() => nav.goBack()}
        rightAction={{
          label: 'Edit',
          onPress: () => nav.navigate('ExerciseEditor', { exerciseId: exercise.id }),
        }}
      />

      {exercise.target_muscles.length > 0 ? (
        <Card style={{ marginBottom: t.spacing.md }}>
          <Text variant="label" color="muted" style={{ marginBottom: t.spacing.sm }}>
            Targeted Muscles
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
            {exercise.target_muscles.map((m, idx) => (
              <Pill
                key={m}
                label={m}
                active
                tone={idx === 0 ? 'primary' : 'default'}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {exercise.instructions ? (
        <Card style={{ marginBottom: t.spacing.md }}>
          <Text variant="label" color="muted">
            Instructions
          </Text>
          <Text variant="body" style={{ marginTop: t.spacing.xs }}>
            {exercise.instructions}
          </Text>
        </Card>
      ) : null}

      <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Personal Records</Text>
      <StatRow>
        <Stat
          label="Max weight"
          value={bestWeight ? formatWeight(bestWeight.value, unit) : '—'}
          tone="primary"
        />
        <Stat label="Max reps" value={bestReps ? `${Math.round(bestReps.value)}` : '—'} />
      </StatRow>
      <View style={{ height: t.spacing.md }} />
      <StatRow>
        <Stat
          label="Est 1RM"
          value={best1rm ? formatWeight(best1rm.value, unit) : '—'}
          tone="success"
        />
        <Stat
          label="Max volume"
          value={bestVolume ? formatVolume(bestVolume.value, unit) : '—'}
        />
      </StatRow>

      <View style={{ height: t.spacing.lg }} />
      <Button
        title={`PR history (${prs.length})`}
        variant="secondary"
        onPress={() => nav.navigate('PRHistory', { exerciseId: exercise.id })}
      />
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
        <Button
          title={exercise.is_favorite ? 'Unfavorite' : 'Favorite'}
          variant="secondary"
          onPress={async () => {
            await toggleFavoriteExercise(exercise.id);
            await load();
          }}
          style={{ flex: 1 }}
        />
        <Button
          title="Delete"
          variant="ghost"
          onPress={() => setConfirmDelete(true)}
          style={{ flex: 1 }}
        />
      </View>

      <ConfirmDialog
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete exercise?"
        description="Your past workout records will remain intact."
        destructive
        confirmLabel="Delete"
        onConfirm={onConfirmDelete}
      />
    </Screen>
  );
};
