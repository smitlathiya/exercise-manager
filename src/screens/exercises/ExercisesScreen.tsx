import React, { useCallback, useState } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Screen,
  ScreenHeader,
  Input,
  Pill,
  Card,
  Text,
  EmptyState,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  listExercises,
  toggleFavoriteExercise,
} from '@/database/repositories/exercises';
import { MUSCLE_GROUPS } from '@/constants';
import type { Exercise, MuscleGroup } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export const ExercisesScreen: React.FC = () => {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [muscle, setMuscle] = useState<MuscleGroup | 'All'>('All');
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const load = useCallback(async () => {
    const list = await listExercises({ muscle, query, favoritesOnly: favOnly });
    setExercises(list);
  }, [muscle, query, favOnly]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md }}>
        <ScreenHeader 
          title="Exercises" 
          subtitle={`${exercises.length} available`} 
          rightAction={{ label: '+ New', onPress: () => nav.navigate('ExerciseEditor', {}) }}
        />
        <Input placeholder="Search…" value={query} onChangeText={setQuery} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          <Pill label="All" active={muscle === 'All'} onPress={() => setMuscle('All')} />
          {MUSCLE_GROUPS.map((m) => (
            <Pill key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
          ))}
          <Pill
            label="Favorites"
            active={favOnly}
            onPress={() => setFavOnly((v) => !v)}
            tone="warning"
            iconLeft={
              <MaterialCommunityIcons
                name={favOnly ? 'star' : 'star-outline'}
                size={16}
                color={favOnly ? t.colors.warning : t.colors.textMuted}
              />
            }
          />
        </View>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.sm }}
        renderItem={({ item }) => (
          <Card
            onPress={() => nav.navigate('ExerciseDetail', { exerciseId: item.id })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{item.name}</Text>
                <Text variant="caption" color="muted">
                  {item.muscle_group} · {item.equipment} · {item.difficulty}
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={item.is_favorite ? 'Unfavorite' : 'Favorite'}
                onPress={async () => {
                  await toggleFavoriteExercise(item.id);
                  await load();
                }}
                style={({ pressed }) => ({
                  padding: t.spacing.xs,
                  marginLeft: t.spacing.sm,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={item.is_favorite ? 'star' : 'star-outline'}
                  size={26}
                  color={item.is_favorite ? t.colors.warning : t.colors.textDim}
                />
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No exercises"
            description="Try clearing filters."
            actionLabel="Reset"
            onAction={() => {
              setQuery('');
              setMuscle('All');
              setFavOnly(false);
            }}
          />
        }
      />
    </Screen>
  );
};
