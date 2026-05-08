import { Platform, ViewStyle } from 'react-native';

type Level = 0 | 1 | 2 | 3 | 4;

export const elevation = (level: Level, shadowColor = '#000'): ViewStyle => {
  if (Platform.OS === 'android') {
    return { elevation: level === 0 ? 0 : level * 2 };
  }
  switch (level) {
    case 0:
      return {};
    case 1:
      return {
        shadowColor,
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      };
    case 2:
      return {
        shadowColor,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      };
    case 3:
      return {
        shadowColor,
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      };
    case 4:
      return {
        shadowColor,
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      };
  }
};
