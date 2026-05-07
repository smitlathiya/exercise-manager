import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Card,
  Text,
  Stat,
  StatRow,
  Input,
  Button,
  EmptyState,
  Pill,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  createNutritionLog,
  listNutritionByDay,
  listFavoriteMeals,
  deleteNutritionLog,
} from '@/database/repositories/nutrition';
import { dayjs, formatTime } from '@/utils/date';
import type { NutritionLog } from '@/types';

const numOrZero = (s: string): number => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export const NutritionTab: React.FC = () => {
  const t = useTheme();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [favorites, setFavorites] = useState<NutritionLog[]>([]);

  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [water, setWater] = useState('');
  const [favorite, setFavorite] = useState(false);

  const load = useCallback(async () => {
    const start = dayjs().startOf('day').valueOf();
    const end = dayjs().endOf('day').valueOf();
    const [day, fav] = await Promise.all([
      listNutritionByDay(start, end),
      listFavoriteMeals(),
    ]);
    setLogs(day);
    setFavorites(fav);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
      water: acc.water + l.water_ml,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }
  );

  const reset = () => {
    setMeal('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setWater('');
    setFavorite(false);
  };

  const submit = async () => {
    await createNutritionLog({
      logged_at: Date.now(),
      meal_label: meal.trim() || null,
      calories: numOrZero(calories),
      protein: numOrZero(protein),
      carbs: numOrZero(carbs),
      fat: numOrZero(fat),
      water_ml: numOrZero(water),
      is_favorite: favorite ? 1 : 0,
      notes: null,
    });
    reset();
    await load();
  };

  const reuseFav = (f: NutritionLog) => {
    setMeal(f.meal_label ?? '');
    setCalories(String(f.calories));
    setProtein(String(f.protein));
    setCarbs(String(f.carbs));
    setFat(String(f.fat));
    setWater(String(f.water_ml));
  };

  return (
    <View>
      <StatRow>
        <Stat label="Kcal" value={`${Math.round(totals.calories)}`} tone="primary" />
        <Stat label="Protein" value={`${Math.round(totals.protein)}g`} />
        <Stat label="Water" value={`${Math.round(totals.water)} ml`} />
      </StatRow>
      <View style={{ height: t.spacing.md }} />
      <StatRow>
        <Stat label="Carbs" value={`${Math.round(totals.carbs)}g`} />
        <Stat label="Fat" value={`${Math.round(totals.fat)}g`} />
      </StatRow>

      <View style={{ height: t.spacing.md }} />
      <Card>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Add entry</Text>
        <Input label="Meal" value={meal} onChangeText={setMeal} placeholder="Breakfast / shake / etc." />
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          <Input label="kcal" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={calories} onChangeText={setCalories} />
          <Input label="protein g" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={protein} onChangeText={setProtein} />
        </View>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          <Input label="carbs g" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={carbs} onChangeText={setCarbs} />
          <Input label="fat g" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={fat} onChangeText={setFat} />
          <Input label="water ml" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={water} onChangeText={setWater} />
        </View>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center', marginBottom: t.spacing.md }}>
          <Pill
            label={favorite ? '★ Favorite' : '☆ Make favorite'}
            active={favorite}
            onPress={() => setFavorite((v) => !v)}
            tone="primary"
          />
        </View>
        <Button title="Log" onPress={submit} fullWidth />
      </Card>

      {favorites.length ? (
        <>
          <View style={{ height: t.spacing.md }} />
          <Card>
            <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Favorites</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
              {favorites.map((f) => (
                <Pill key={f.id} label={f.meal_label ?? '(unnamed)'} onPress={() => reuseFav(f)} />
              ))}
            </View>
          </Card>
        </>
      ) : null}

      <View style={{ height: t.spacing.md }} />
      <Card>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Today’s entries</Text>
        {logs.length === 0 ? (
          <EmptyState title="Nothing logged yet" />
        ) : (
          logs.map((l) => (
            <View
              key={l.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: t.colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{l.meal_label ?? '(meal)'}</Text>
                <Text variant="caption" color="muted">
                  {formatTime(l.logged_at)} · {Math.round(l.calories)} kcal · {Math.round(l.protein)}p
                </Text>
              </View>
              <Button title="×" variant="ghost" size="sm" onPress={async () => {
                await deleteNutritionLog(l.id);
                await load();
              }} />
            </View>
          ))
        )}
      </Card>
    </View>
  );
};
