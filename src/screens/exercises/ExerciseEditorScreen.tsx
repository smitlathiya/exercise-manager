import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Screen, ScreenHeader, Card, Input, Button, Pill, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getExercise, createExercise, updateExercise } from '@/database/repositories/exercises';
import { MUSCLE_GROUPS, EQUIPMENT, DIFFICULTY } from '@/constants';
import type { MuscleGroup, Equipment, Difficulty } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export const ExerciseEditorScreen: React.FC = () => {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ExerciseEditor'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const exerciseId = route.params?.exerciseId;

  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Dumbbell');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!exerciseId) return;
    void getExercise(exerciseId).then(ex => {
      if (!ex) return;
      setName(ex.name);
      setMuscle(ex.muscle_group);
      setEquipment(ex.equipment);
      setDifficulty(ex.difficulty);
      setInstructions(ex.instructions ?? '');
    });
  }, [exerciseId]);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter a name for the exercise.');
      return;
    }

    if (exerciseId) {
      await updateExercise(exerciseId, {
        name: name.trim(),
        muscle_group: muscle,
        equipment,
        difficulty,
        instructions: instructions.trim() || null,
      });
    } else {
      await createExercise({
        name: name.trim(),
        muscle_group: muscle,
        equipment,
        difficulty,
        instructions: instructions.trim() || null,
        is_favorite: 0,
        is_custom: 1,
      });
    }
    nav.goBack();
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title={exerciseId ? 'Edit Exercise' : 'New Exercise'}
        onBack={() => nav.goBack()}
        rightAction={{ label: 'Save', onPress: onSave }}
      />

      <Card style={{ marginBottom: t.spacing.md }}>
        <Input label="Exercise Name" value={name} onChangeText={setName} />
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.sm }}>
          MUSCLE GROUP
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
          {MUSCLE_GROUPS.map((m) => (
            <Pill key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.sm }}>
          EQUIPMENT
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
          {EQUIPMENT.map((eq) => (
            <Pill key={eq} label={eq} active={equipment === eq} onPress={() => setEquipment(eq)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.sm }}>
          DIFFICULTY
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
          {DIFFICULTY.map((d) => (
            <Pill key={d} label={d} active={difficulty === d} onPress={() => setDifficulty(d)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Input
          label="Instructions (Optional)"
          value={instructions}
          onChangeText={setInstructions}
          multiline
        />
      </Card>

      <Button title="Save Exercise" onPress={onSave} style={{ marginTop: t.spacing.md }} />
      <View style={{ height: t.spacing.xl }} />
    </Screen>
  );
};
