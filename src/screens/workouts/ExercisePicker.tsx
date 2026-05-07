import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Modal, Input, Pill, Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listExercises } from '@/database/repositories/exercises';
import { MUSCLE_GROUPS } from '@/constants';
import type { Exercise, MuscleGroup } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (e: Exercise) => void;
}

export const ExercisePicker: React.FC<Props> = ({ visible, onClose, onPick }) => {
  const t = useTheme();
  const [muscle, setMuscle] = useState<MuscleGroup | 'All'>('All');
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!visible) return;
    void listExercises({ muscle, query }).then(setExercises);
  }, [visible, muscle, query]);

  return (
    <Modal visible={visible} onClose={onClose} title="Add Exercise">
      <Input placeholder="Search exercises..." value={query} onChangeText={setQuery} />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: t.spacing.xs,
          marginBottom: t.spacing.md,
        }}
      >
        <Pill
          label="All"
          active={muscle === 'All'}
          onPress={() => setMuscle('All')}
        />
        {MUSCLE_GROUPS.map((m) => (
          <Pill key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
        ))}
      </View>
      <FlatList
        data={exercises}
        keyExtractor={(i) => i.id}
        style={{ maxHeight: 360 }}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing.xs }} />}
        renderItem={({ item }) => (
          <Card
            onPress={() => {
              onPick(item);
              onClose();
            }}
            padded
            style={{ paddingVertical: t.spacing.md }}
          >
            <Text variant="bodyBold">{item.name}</Text>
            <Text variant="caption" color="muted">
              {item.muscle_group} · {item.equipment}
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          <Text color="muted" align="center" style={{ marginTop: t.spacing.lg }}>
            No exercises match.
          </Text>
        }
      />
    </Modal>
  );
};
