import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Screen, ScreenHeader, Card, Text, EmptyState } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listPRsForExercise } from '@/database/repositories/prs';
import { formatDate } from '@/utils/date';
import { formatWeight, formatVolume } from '@/utils/calc';
import { useSettingsStore } from '@/store/settings';
import type { PersonalRecord } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export const PRHistoryScreen: React.FC = () => {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'PRHistory'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unit = useSettingsStore((s) => s.unit);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  const load = useCallback(async () => {
    setPrs(await listPRsForExercise(route.params.exerciseId));
  }, [route.params.exerciseId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md }}>
        <ScreenHeader title="PR History" onBack={() => nav.goBack()} />
      </View>
      <FlatList
        data={prs}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.sm }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text variant="bodyBold">{item.kind.replace(/_/g, ' ')}</Text>
                <Text variant="caption" color="muted">
                  {formatDate(item.achieved_at, 'MMM D, YYYY')} · {item.weight}×{item.reps}
                </Text>
              </View>
              <Text variant="bodyBold" color="primary">
                {item.kind === 'max_weight'
                  ? formatWeight(item.value, unit)
                  : item.kind === 'max_volume'
                    ? formatVolume(item.value, unit)
                    : `${Math.round(item.value)}${item.kind === 'max_reps' ? '' : ` ${unit}`}`}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState title="No PRs yet" description="Complete sets to start logging records." />
        }
      />
    </Screen>
  );
};
