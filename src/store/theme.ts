import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, Theme } from '@/theme';
import { STORAGE_KEYS } from '@/constants';

type Mode = 'dark' | 'light' | 'system';

interface ThemeState {
  mode: Mode;
  theme: Theme;
  setMode: (m: Mode) => Promise<void>;
  hydrate: () => Promise<void>;
}

const resolve = (mode: Mode): Theme => {
  if (mode === 'system') {
    const sys = Appearance.getColorScheme() ?? 'dark';
    return sys === 'light' ? themes.light : themes.dark;
  }
  return themes[mode];
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  theme: themes.dark,
  setMode: async (m) => {
    await AsyncStorage.setItem(STORAGE_KEYS.theme, m);
    set({ mode: m, theme: resolve(m) });
  },
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.theme);
    const mode = (raw as Mode) || 'dark';
    set({ mode, theme: resolve(mode) });
  },
}));
