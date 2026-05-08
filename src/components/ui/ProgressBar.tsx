import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: number;
  max?: number;
  height?: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  trackColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<Props> = ({
  value,
  max = 1,
  height = 8,
  tone = 'primary',
  trackColor,
  style,
}) => {
  const t = useTheme();
  const ratio = Math.max(0, Math.min(1, value / max));
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(ratio, { duration: 400 });
  }, [ratio, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animated.value * 100}%`,
  }));

  const fg = {
    primary: t.colors.primary,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
  }[tone];

  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? t.colors.surfaceAlt,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[{ height: '100%', backgroundColor: fg }, fillStyle]} />
    </View>
  );
};
