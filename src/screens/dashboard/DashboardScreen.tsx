import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Stat,
  StatRow,
  Card,
  Button,
  Text,
  EmptyState,
} from '@/components/ui';
import { LineChartCard } from '@/charts/LineChartCard';
import { HeatmapCard } from '@/charts/HeatmapCard';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settings';
import {
  getStreak,
  getWeeklyWorkoutCount,
  getWeeklyVolume,
  getDailyVolumeRange,
  getCaloriesToday,
  getMonthlyConsistency,
} from '@/database/repositories/analytics';
import { listInProgressWorkout, listCompletedWorkouts, listTemplates } from '@/database/repositories/workouts';
import { listRecentPRs } from '@/database/repositories/prs';
import { getLatestBodyMeasurement } from '@/database/repositories/body';
import { formatVolume, formatWeight } from '@/utils/calc';
import { dayjs, formatDate } from '@/utils/date';
import type { Workout, BodyMeasurement, PersonalRecord } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

interface DashboardData {
  streak: number;
  weeklyWorkouts: number;
  weeklyVolume: number;
  todayKcals: number;
  todayProtein: number;
  todayWater: number;
  consistency: { day: string; count: number }[];
  volumeSeries: { value: number; label?: string }[];
  inProgress: Workout | null;
  upcomingTemplate: Workout | null;
  latestBody: BodyMeasurement | null;
  recentPRs: PersonalRecord[];
  monthlyVolume: number;
}

export const DashboardScreen: React.FC = () => {
  const t = useTheme();
  const unit = useSettingsStore((s) => s.unit);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [
      streak,
      weeklyWorkouts,
      weeklyVolume,
      todayMacros,
      consistency,
      vol30,
      inProgress,
      templates,
      latestBody,
      recentPRs,
    ] = await Promise.all([
      getStreak(),
      getWeeklyWorkoutCount(),
      getWeeklyVolume(),
      getCaloriesToday(),
      getMonthlyConsistency(),
      getDailyVolumeRange(14),
      listInProgressWorkout(),
      listTemplates(),
      getLatestBodyMeasurement(),
      listRecentPRs(5),
    ]);
    const monthlyVolume = vol30.reduce((a, b) => a + b.volume, 0);
    setData({
      streak,
      weeklyWorkouts,
      weeklyVolume,
      todayKcals: todayMacros.calories,
      todayProtein: todayMacros.protein,
      todayWater: todayMacros.water_ml,
      consistency,
      volumeSeries: vol30.map((v) => ({
        value: v.volume,
        label: dayjs(v.day).format('D'),
      })),
      inProgress,
      upcomingTemplate: templates[0] ?? null,
      latestBody,
      recentPRs,
      monthlyVolume,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <Screen scroll>
        <ScreenHeader title="Dashboard" />
        <Text color="muted">Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <ScreenHeader
        title="Dashboard"
        subtitle={formatDate(Date.now(), 'dddd, MMM D')}
      />

      {data.inProgress ? (
        <Card style={{ marginBottom: t.spacing.md, borderColor: t.colors.primary, borderWidth: 1 }}>
          <Text variant="caption" color="primary">
            IN PROGRESS
          </Text>
          <Text variant="h2" style={{ marginTop: t.spacing.xs }}>
            {data.inProgress.name}
          </Text>
          <Button
            title="Resume workout"
            onPress={() => nav.navigate('WorkoutLive', { workoutId: data.inProgress!.id })}
            style={{ marginTop: t.spacing.md }}
          />
        </Card>
      ) : (
        <Card style={{ marginBottom: t.spacing.md }}>
          <Text variant="caption" color="muted">
            QUICK START
          </Text>
          <Text variant="h2" style={{ marginTop: t.spacing.xs }}>
            {data.upcomingTemplate ? data.upcomingTemplate.name : 'Start a workout'}
          </Text>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
            <Button
              title="New blank workout"
              variant="secondary"
              onPress={() => nav.navigate('WorkoutEditor', {})}
              style={{ flex: 1 }}
            />
            {data.upcomingTemplate ? (
              <Button
                title="Start template"
                onPress={() =>
                  nav.navigate('WorkoutEditor', { workoutId: data.upcomingTemplate!.id })
                }
                style={{ flex: 1 }}
              />
            ) : null}
          </View>
        </Card>
      )}

      <StatRow>
        <Stat label="Streak" value={`${data.streak}d`} tone="primary" />
        <Stat label="This Week" value={String(data.weeklyWorkouts)} hint="workouts" />
        <Stat label="Volume" value={formatVolume(data.weeklyVolume, unit)} hint="this week" />
      </StatRow>

      <View style={{ height: t.spacing.md }} />

      <StatRow>
        <Stat
          label="Body"
          value={
            data.latestBody?.weight
              ? formatWeight(data.latestBody.weight, unit)
              : '—'
          }
          hint={data.latestBody ? formatDate(data.latestBody.measured_at, 'MMM D') : 'no log yet'}
        />
        <Stat label="Calories" value={`${Math.round(data.todayKcals)}`} hint="today" />
        <Stat label="Water" value={`${Math.round(data.todayWater)} ml`} hint="today" />
      </StatRow>

      <View style={{ height: t.spacing.md }} />

      <LineChartCard
        title="Volume — last 14 days"
        subtitle={formatVolume(data.monthlyVolume, unit) + ' over 30 days'}
        data={data.volumeSeries}
      />

      <View style={{ height: t.spacing.md }} />

      <HeatmapCard
        title="Monthly consistency"
        subtitle="Last 30 days"
        data={data.consistency}
      />

      <View style={{ height: t.spacing.md }} />

      <Card>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>
          Recent PRs
        </Text>
        {data.recentPRs.length === 0 ? (
          <EmptyState
            title="No PRs yet"
            description="Complete a workout to start logging records."
          />
        ) : (
          data.recentPRs.map((pr) => (
            <View
              key={pr.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: t.spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: t.colors.border,
              }}
            >
              <View>
                <Text variant="bodyBold">{pr.kind.replace(/_/g, ' ')}</Text>
                <Text variant="caption" color="muted">
                  {formatDate(pr.achieved_at)}
                </Text>
              </View>
              <Text variant="bodyBold" color="primary">
                {pr.kind === 'max_weight'
                  ? formatWeight(pr.value, unit)
                  : pr.kind === 'max_volume'
                    ? formatVolume(pr.value, unit)
                    : `${Math.round(pr.value)}${pr.kind === 'max_reps' ? ' reps' : ' (1RM)'}`}
              </Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
};
