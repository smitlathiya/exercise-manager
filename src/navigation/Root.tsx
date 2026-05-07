import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { useAppLockStore } from '@/store/appLock';
import { useSettingsStore } from '@/store/settings';
import { Tabs } from './Tabs';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { AppLockScreen } from '@/screens/security/AppLockScreen';
import { WorkoutEditorScreen } from '@/screens/workouts/WorkoutEditorScreen';
import { WorkoutLiveScreen } from '@/screens/workouts/WorkoutLiveScreen';
import { ExerciseDetailScreen } from '@/screens/exercises/ExerciseDetailScreen';
import { PRHistoryScreen } from '@/screens/prs/PRHistoryScreen';
import { PhotoCompareScreen } from '@/screens/photos/PhotoCompareScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Root: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken || s.refreshToken));
  const authHydrated = useAuthStore((s) => s.hydrated);
  const isLocked = useAppLockStore((s) => s.isLocked);
  const lockEnabled = useSettingsStore((s) => s.appLockEnabled);

  const navTheme =
    theme.mode === 'dark'
      ? {
          ...DarkTheme,
          colors: { ...DarkTheme.colors, background: theme.colors.bg, card: theme.colors.bgElevated, primary: theme.colors.primary, text: theme.colors.text, border: theme.colors.border },
          fonts: DarkTheme.fonts,
        }
      : {
          ...DefaultTheme,
          colors: { ...DefaultTheme.colors, background: theme.colors.bg, card: theme.colors.bgElevated, primary: theme.colors.primary, text: theme.colors.text, border: theme.colors.border },
          fonts: DefaultTheme.fonts,
        };

  if (!authHydrated) return null;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthed ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : lockEnabled && isLocked ? (
          <Stack.Screen name="AppLock" component={AppLockScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} />
            <Stack.Screen name="WorkoutEditor" component={WorkoutEditorScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="WorkoutLive" component={WorkoutLiveScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
            <Stack.Screen name="PRHistory" component={PRHistoryScreen} />
            <Stack.Screen name="PhotoCompare" component={PhotoCompareScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
