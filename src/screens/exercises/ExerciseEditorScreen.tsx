import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  Screen,
  ScreenHeader,
  Card,
  Input,
  Button,
  Pill,
  Text,
  toast,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getExercise, createExercise, updateExercise } from '@/database/repositories/exercises';
import { MUSCLE_GROUPS, EQUIPMENT, DIFFICULTY, MUSCLES_BY_GROUP } from '@/constants';
import type { MuscleGroup, Equipment, Difficulty } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const ExerciseEditorScreen: React.FC = () => {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ExerciseEditor'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const exerciseId = route.params?.exerciseId;

  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Dumbbell');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [instructions, setInstructions] = useState('');
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);

  useEffect(() => {
    if (!exerciseId) return;
    void getExercise(exerciseId).then(ex => {
      if (!ex) return;
      setName(ex.name);
      setMuscle(ex.muscle_group);
      setEquipment(ex.equipment);
      setDifficulty(ex.difficulty);
      setInstructions(ex.instructions ?? '');
      setTargetMuscles(ex.target_muscles);
    });
  }, [exerciseId]);

  const toggleMuscle = (m: string) => {
    setTargetMuscles((curr) =>
      curr.includes(m) ? curr.filter((x) => x !== m) : [...curr, m]
    );
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error('Name required', 'Please enter a name for the exercise.');
      return;
    }

    if (exerciseId) {
      await updateExercise(exerciseId, {
        name: name.trim(),
        muscle_group: muscle,
        equipment,
        difficulty,
        instructions: instructions.trim() || null,
        target_muscles: targetMuscles,
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
        notes: null,
        target_muscles: targetMuscles,
      });
    }
    nav.goBack();
  };

  const groupedMuscles = MUSCLE_GROUPS
    .map((g) => ({ group: g, muscles: MUSCLES_BY_GROUP[g] as readonly string[] }))
    .filter((g) => g.muscles.length > 0);

  const primaryGroupMuscles = (MUSCLES_BY_GROUP[muscle] ?? []) as readonly string[];
  const otherGroups = groupedMuscles.filter((g) => g.group !== muscle);

  return (
    <Screen scroll>
      <ScreenHeader
        title={exerciseId ? 'Edit Exercise' : 'New Exercise'}
        onBack={() => nav.goBack()}
        rightAction={{ label: 'Save', onPress: onSave, tone: 'primary' }}
      />

      <Card style={{ marginBottom: t.spacing.md }}>
        <Input label="Exercise Name" value={name} onChangeText={setName} />
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="label" color="muted" style={{ marginBottom: t.spacing.sm }}>
          Muscle Group
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
          {MUSCLE_GROUPS.map((m) => (
            <Pill key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.spacing.sm,
          }}
        >
          <Text variant="label" color="muted">
            Targeted Muscles
          </Text>
          {targetMuscles.length > 0 ? (
            <Text variant="caption" color="primary">
              {targetMuscles.length} selected
            </Text>
          ) : null}
        </View>

        {primaryGroupMuscles.length > 0 ? (
          <View style={{ marginBottom: t.spacing.md }}>
            <Text variant="footnote" color="dim" style={{ marginBottom: t.spacing.xs }}>
              {muscle.toUpperCase()}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
              {primaryGroupMuscles.map((m) => (
                <Pill
                  key={m}
                  label={m}
                  active={targetMuscles.includes(m)}
                  onPress={() => toggleMuscle(m)}
                  tone="primary"
                />
              ))}
            </View>
          </View>
        ) : null}

        {otherGroups.map((g) => (
          <View key={g.group} style={{ marginBottom: t.spacing.md }}>
            <Text variant="footnote" color="dim" style={{ marginBottom: t.spacing.xs }}>
              {g.group.toUpperCase()}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
              {g.muscles.map((m) => (
                <Pill
                  key={m}
                  label={m}
                  active={targetMuscles.includes(m)}
                  onPress={() => toggleMuscle(m)}
                />
              ))}
            </View>
          </View>
        ))}
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="label" color="muted" style={{ marginBottom: t.spacing.sm }}>
          Equipment
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
          {EQUIPMENT.map((eq) => (
            <Pill key={eq} label={eq} active={equipment === eq} onPress={() => setEquipment(eq)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="label" color="muted" style={{ marginBottom: t.spacing.sm }}>
          Difficulty
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
          {DIFFICULTY.map((d) => (
            <Pill
              key={d}
              label={capitalize(d)}
              active={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
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
