import '@/utils/date';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppState, AppStateStatus } from 'react-native';

import { initDatabase } from '@/database/db';
import { useThemeStore } from '@/store/theme';
import { useSettingsStore } from '@/store/settings';
import { useAuthStore } from '@/store/auth';
import { useSyncStore } from '@/store/sync';
import { useAppLockStore } from '@/store/appLock';
import { useWorkoutSession } from '@/store/workoutSession';
import { Root } from '@/navigation/Root';
import { Loading } from '@/components/ui';
import { startAutoSync, stopAutoSync, refreshSyncStats } from '@/sync/manager';
import {
  setupAndroidChannel,
  scheduleWaterReminder,
  scheduleWeightReminder,
  scheduleWorkoutReminder,
} from '@/services/notifications';

void SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const themeMode = useThemeStore((s) => s.mode);
  const settings = useSettingsStore();
  const auth = useAuthStore();

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        await Promise.all([
          initDatabase(),
          useThemeStore.getState().hydrate(),
          useSettingsStore.getState().hydrate(),
          useAuthStore.getState().hydrate(),
          useSyncStore.getState().hydrate(),
          setupAndroidChannel(),
        ]);
        await useWorkoutSession.getState().recoverFromSnapshot();
        if (useSettingsStore.getState().appLockEnabled) {
          useAppLockStore.getState().lock();
        }
        await refreshSyncStats();
      } finally {
        if (alive) {
          setReady(true);
          await SplashScreen.hideAsync();
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Auto-sync lifecycle
  useEffect(() => {
    if (!ready) return;
    const enabled = settings.autoSyncEnabled && Boolean(auth.accessToken || auth.refreshToken);
    if (enabled) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
    return () => stopAutoSync();
  }, [ready, settings.autoSyncEnabled, auth.accessToken, auth.refreshToken]);

  // Reschedule reminders when settings change
  useEffect(() => {
    if (!ready) return;
    void scheduleWorkoutReminder(settings.workoutReminderHour);
    void scheduleWaterReminder(settings.waterReminderEvery);
    void scheduleWeightReminder(settings.weightReminderHour);
  }, [
    ready,
    settings.workoutReminderHour,
    settings.waterReminderEvery,
    settings.weightReminderHour,
  ]);

  // Re-lock when backgrounded
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'background' && useSettingsStore.getState().appLockEnabled) {
        useAppLockStore.getState().lock();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
        {ready ? <Root /> : <Loading message="Preparing your gym log…" />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
