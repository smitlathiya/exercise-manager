import { useThemeStore } from '@/store/theme';
import { Theme } from '@/theme';

export const useTheme = (): Theme => useThemeStore((s) => s.theme);
