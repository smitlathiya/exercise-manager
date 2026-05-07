import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import type { AppSettings } from '@/types';

const DEFAULTS: AppSettings = {
  unit: 'kg',
  themeMode: 'dark',
  appLockEnabled: false,
  biometricEnabled: false,
  pinEnabled: false,
  autoSyncEnabled: true,
  workoutReminderHour: null,
  waterReminderEvery: null,
  weightReminderHour: null,
  defaultRestSeconds: 90,
};

interface SettingsState extends AppSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        set({ ...DEFAULTS, ...parsed, hydrated: true });
        return;
      } catch {
        // fall through
      }
    }
    set({ hydrated: true });
  },
  update: async (patch) => {
    const current = get();
    const next: AppSettings = {
      unit: current.unit,
      themeMode: current.themeMode,
      appLockEnabled: current.appLockEnabled,
      biometricEnabled: current.biometricEnabled,
      pinEnabled: current.pinEnabled,
      autoSyncEnabled: current.autoSyncEnabled,
      workoutReminderHour: current.workoutReminderHour,
      waterReminderEvery: current.waterReminderEvery,
      weightReminderHour: current.weightReminderHour,
      defaultRestSeconds: current.defaultRestSeconds,
      ...patch,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    set(next);
  },
}));
