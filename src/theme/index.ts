import { darkColors, lightColors, ThemeColors } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';
import { elevation } from './elevation';
import { motion } from './motion';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  motion: typeof motion;
}

export const themes: Record<ThemeMode, Theme> = {
  dark: { mode: 'dark', colors: darkColors, spacing, radius, typography, elevation, motion },
  light: { mode: 'light', colors: lightColors, spacing, radius, typography, elevation, motion },
};

export { darkColors, lightColors, spacing, radius, typography, elevation, motion };
export type { ThemeColors };
