import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Card,
  Text,
  Pill,
  EmptyState,
  Fab,
  IconButton,
  ConfirmDialog,
  BottomSheet,
  ListItem,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  listTemplates,
  listCompletedWorkouts,
  duplicateWorkout,
  softDeleteWorkout,
  createWorkout,
  startWorkoutFromTemplate,
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
  const [pendingDelete, setPendingDelete] = useState<Workout | null>(null);
  const [menuItem, setMenuItem] = useState<Workout | null>(null);
  const [menuSnapshot, setMenuSnapshot] = useState<Workout | null>(null);

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

  const onStartFromTemplate = async (template: Workout) => {
    const workout = await startWorkoutFromTemplate(template.id);
    if (workout) nav.navigate('WorkoutLive', { workoutId: workout.id });
  };

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    await softDeleteWorkout(pendingDelete.id);
    setPendingDelete(null);
    await load();
  };

  const openMenu = (item: Workout) => {
    setMenuSnapshot(item);
    setMenuItem(item);
  };

  const closeMenu = () => setMenuItem(null);

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
              onPress={() => nav.navigate('WorkoutEditor', { workoutId: item.id })}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="h3">{item.name}</Text>
                  <Text variant="caption" color="muted" style={{ marginTop: t.spacing.xs }}>
                    {item.template_kind}
                    {item.completed_at ? ` • ${fromNow(item.completed_at)}` : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs }}>
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
                  <IconButton
                    name="dots-vertical"
                    size="sm"
                    variant="ghost"
                    accessibilityLabel="More options"
                    onPress={() => openMenu(item)}
                  />
                </View>
              </View>
            </Card>
          )}
        />
      )}

      <Fab label="Start" onPress={onCreateBlank} />

      <BottomSheet
        visible={!!menuItem}
        onClose={closeMenu}
        title={menuSnapshot?.name}
      >
        {menuSnapshot?.is_template ? (
          <ListItem
            title="Start Workout"
            leading={<IconButton name="play-outline" size="sm" tone="primary" variant="tonal" />}
            onPress={() => {
              closeMenu();
              onStartFromTemplate(menuSnapshot);
            }}
          />
        ) : null}
        <ListItem
          title="Edit"
          leading={<IconButton name="pencil-outline" size="sm" variant="tonal" />}
          onPress={() => {
            closeMenu();
            nav.navigate('WorkoutEditor', { workoutId: menuSnapshot!.id });
          }}
        />
        <ListItem
          title="Duplicate"
          leading={<IconButton name="content-copy" size="sm" variant="tonal" />}
          onPress={async () => {
            closeMenu();
            await duplicateWorkout(menuSnapshot!.id);
            await load();
          }}
        />
        <ListItem
          title="Delete"
          destructive
          leading={<IconButton name="trash-can-outline" size="sm" tone="danger" variant="tonal" />}
          onPress={() => {
            closeMenu();
            setPendingDelete(menuSnapshot);
          }}
        />
      </BottomSheet>

      <ConfirmDialog
        visible={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete Template"
        description={`"${pendingDelete?.name}" will be permanently removed.`}
        destructive
        confirmLabel="Delete"
        onConfirm={onConfirmDelete}
      />
    </Screen>
  );
};
