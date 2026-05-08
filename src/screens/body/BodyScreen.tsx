import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Card,
  Text,
  Stat,
  StatRow,
  Button,
  Pill,
} from '@/components/ui';
import { LineChartCard } from '@/charts/LineChartCard';
import { useTheme } from '@/hooks/useTheme';
import {
  listBodyMeasurements,
  getLatestBodyMeasurement,
} from '@/database/repositories/body';
import { useSettingsStore } from '@/store/settings';
import { dayjs, formatDate } from '@/utils/date';
import { formatWeight } from '@/utils/calc';
import type { BodyMeasurement } from '@/types';
import { LogBodyModal } from './LogBodyModal';
import { NutritionTab } from '@/screens/nutrition/NutritionTab';

type Tab = 'measurements' | 'nutrition';

export const BodyScreen: React.FC = () => {
  const t = useTheme();
  const unit = useSettingsStore((s) => s.unit);
  const [tab, setTab] = useState<Tab>('measurements');
  const [latest, setLatest] = useState<BodyMeasurement | null>(null);
  const [history, setHistory] = useState<BodyMeasurement[]>([]);
  const [logOpen, setLogOpen] = useState(false);

  const load = useCallback(async () => {
    const [l, list] = await Promise.all([getLatestBodyMeasurement(), listBodyMeasurements(180)]);
    setLatest(l);
    setHistory(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const trend = (() => {
    if (history.length < 2) return null;
    const oldest = history[history.length - 1];
    const newest = history[0];
    if (!oldest?.weight || !newest?.weight) return null;
    return newest.weight - oldest.weight;
  })();

  const series = history
    .filter((h) => h.weight !== null)
    .reverse()
    .map((h) => ({ value: h.weight ?? 0, label: dayjs(h.measured_at).format('M/D') }));

  return (
    <Screen scroll>
      <ScreenHeader
        title="Body"
        rightAction={
          tab === 'measurements'
            ? { label: '+ Log', onPress: () => setLogOpen(true) }
            : undefined
        }
      />

      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        <Pill label="Measurements" active={tab === 'measurements'} onPress={() => setTab('measurements')} />
        <Pill label="Nutrition" active={tab === 'nutrition'} onPress={() => setTab('nutrition')} />
      </View>

      {tab === 'measurements' ? (
        <>
          <StatRow>
            <Stat
              label="Weight"
              value={latest?.weight ? formatWeight(latest.weight, unit) : '—'}
              hint={latest ? formatDate(latest.measured_at, 'MMM D') : ''}
              tone="primary"
            />
            <Stat
              label="Body fat"
              value={latest?.body_fat ? `${latest.body_fat.toFixed(1)}%` : '—'}
            />
            <Stat
              label="Trend"
              value={trend === null ? '—' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}`}
              tone={trend && trend < 0 ? 'success' : 'default'}
              hint="vs first log"
            />
          </StatRow>

          <View style={{ height: t.spacing.md }} />
          <LineChartCard title="Weight" subtitle="Last 6 months" data={series} />

          <View style={{ height: t.spacing.md }} />
          <Card>
            <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Latest measurements</Text>
            {latest ? (
              <View style={{ gap: t.spacing.xs }}>
                <Row label="Chest" value={latest.chest} />
                <Row label="Waist" value={latest.waist} />
                <Row label="Arms" value={latest.arms} />
                <Row label="Neck" value={latest.neck} />
                <Row label="Thighs" value={latest.thighs} />
              </View>
            ) : (
              <Text color="muted">No data — tap + Log to add.</Text>
            )}
          </Card>
        </>
      ) : null}

      {tab === 'nutrition' ? <NutritionTab /> : null}

      <LogBodyModal
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        onSaved={load}
      />
    </Screen>
  );
};

const Row: React.FC<{ label: string; value: number | null }> = ({ label, value }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    }}
  >
    <Text color="muted">{label}</Text>
    <Text variant="bodyBold">{value !== null ? `${value} cm` : '—'}</Text>
  </View>
);
