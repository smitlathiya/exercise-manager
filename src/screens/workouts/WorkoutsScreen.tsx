import React, { useCallback, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Card,
  Text,
  Pill,
  EmptyState,
  Fab,
  Button,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  listTemplates,
  listCompletedWorkouts,
  duplicateWorkout,
  softDeleteWorkout,
  createWorkout,
} from '@/database/repositories/workouts';
import type { Workout } from '@/types';
import { fromNow } from '@/utils/date';
import { formatDuration } from '@/utils/calc';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type Tab = 'history' | 'templates';

export const WorkoutsScreen: React.FC = () => {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<Tab>('history');
  const [history, setHistory] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<Workout[]>([]);

  const load = useCallback(async () => {
    const [h, tpl] = await Promise.all([listCompletedWorkouts(50), listTemplates()]);
    setHistory(h);
    setTemplates(tpl);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onCreateBlank = async () => {
    const w = await createWorkout({ name: 'New Workout', template_kind: 'Custom Split' });
    nav.navigate('WorkoutEditor', { workoutId: w.id });
  };

  const onLongPress = (item: Workout) => {
    Alert.alert(item.name, undefined, [
      {
        text: 'Edit',
        onPress: () => nav.navigate('WorkoutEditor', { workoutId: item.id }),
      },
      {
        text: 'Duplicate',
        onPress: async () => {
          await duplicateWorkout(item.id);
          await load();
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await softDeleteWorkout(item.id);
          await load();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const data = tab === 'history' ? history : templates;

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md }}>
        <ScreenHeader
          title="Workouts"
          rightAction={{ label: '+ New', onPress: onCreateBlank }}
        />
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
          <Pill label="History" active={tab === 'history'} onPress={() => setTab('history')} />
          <Pill label="Templates" active={tab === 'templates'} onPress={() => setTab('templates')} />
        </View>
      </View>

      {data.length === 0 ? (
        <EmptyState
          title={tab === 'history' ? 'No workouts logged' : 'No templates yet'}
          description={
            tab === 'history'
              ? 'Tap + New to start your first workout.'
              : 'Save any workout as a template to reuse it.'
          }
          actionLabel={tab === 'history' ? 'Start workout' : undefined}
          onAction={tab === 'history' ? onCreateBlank : undefined}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                tab === 'history'
                  ? nav.navigate('WorkoutEditor', { workoutId: item.id })
                  : nav.navigate('WorkoutEditor', { workoutId: item.id })
              }
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="h3">{item.name}</Text>
                  <Text variant="caption" color="muted" style={{ marginTop: t.spacing.xs }}>
                    {item.template_kind}
                    {item.completed_at ? ` • ${fromNow(item.completed_at)}` : ''}
                  </Text>
                </View>
                <Pill
                  label={
                    item.is_template
                      ? 'Template'
                      : item.duration_seconds
                        ? formatDuration(item.duration_seconds)
                        : 'In progress'
                  }
                  tone={item.is_template ? 'primary' : 'default'}
                  active
                />
              </View>
              <Button
                title="More"
                variant="ghost"
                onPress={() => onLongPress(item)}
                size="sm"
                style={{ alignSelf: 'flex-start', marginTop: t.spacing.sm, paddingHorizontal: 0 }}
              />
            </Card>
          )}
        />
      )}

      <Fab label="Start" onPress={onCreateBlank} />
    </Screen>
  );
};
