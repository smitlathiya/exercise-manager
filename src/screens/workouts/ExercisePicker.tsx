import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Modal, Input, Pill, Text, Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listExercises } from '@/database/repositories/exercises';
import { MUSCLE_GROUPS } from '@/constants';
import type { Exercise, MuscleGroup } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (exercises: Exercise[]) => void;
}

export const ExercisePicker: React.FC<Props> = ({ visible, onClose, onPick }) => {
  const t = useTheme();
  const [muscle, setMuscle] = useState<MuscleGroup | 'All'>('All');
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Map<string, Exercise>>(new Map());

  useEffect(() => {
    if (!visible) {
      // Reset when closed
      setSelected(new Map());
      setQuery('');
      setMuscle('All');
      return;
    }
    void listExercises({ muscle, query }).then(setExercises);
  }, [visible, muscle, query]);

  const toggleSelect = (ex: Exercise) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(ex.id)) {
        next.delete(ex.id);
      } else {
        next.set(ex.id, ex);
      }
      return next;
    });
  };

  const confirm = () => {
    onPick(Array.from(selected.values()));
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Add Exercises">
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
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <Card
              onPress={() => toggleSelect(item)}
              padded
              style={{
                paddingVertical: t.spacing.md,
                borderColor: isSelected ? t.colors.primary : t.colors.border,
                borderWidth: 1,
                backgroundColor: isSelected ? t.colors.primary + '15' : t.colors.bgElevated,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text variant="bodyBold">{item.name}</Text>
                  <Text variant="caption" color="muted">
                    {item.muscle_group} · {item.equipment}
                  </Text>
                </View>
                {isSelected && <Text variant="bodyBold" color="primary">✓</Text>}
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text color="muted" align="center" style={{ marginTop: t.spacing.lg }}>
            No exercises match.
          </Text>
        }
      />
      <View style={{ paddingTop: t.spacing.md }}>
        <Button
          title={`Add ${selected.size > 0 ? selected.size : ''} exercises`}
          onPress={confirm}
          disabled={selected.size === 0}
        />
      </View>
    </Modal>
  );
};
