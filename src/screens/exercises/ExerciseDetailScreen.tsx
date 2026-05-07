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
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getExercise, toggleFavoriteExercise } from '@/database/repositories/exercises';
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
          label: exercise.is_favorite ? '★' : '☆',
          onPress: async () => {
            await toggleFavoriteExercise(exercise.id);
            await load();
          },
        }}
      />

      {exercise.instructions ? (
        <Card style={{ marginBottom: t.spacing.md }}>
          <Text variant="caption" color="muted">
            INSTRUCTIONS
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
    </Screen>
  );
};
