import { darkColors, lightColors, ThemeColors } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const themes: Record<ThemeMode, Theme> = {
  dark: { mode: 'dark', colors: darkColors, spacing, radius, typography },
  light: { mode: 'light', colors: lightColors, spacing, radius, typography },
};

export { darkColors, lightColors, spacing, radius, typography };
export type { ThemeColors };
