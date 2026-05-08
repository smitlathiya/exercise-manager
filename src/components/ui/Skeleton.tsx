import React, { useEffect } from 'react';
import { View, ViewStyle, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<Props> = ({ width = '100%', height = 14, radius, style }) => {
  const t = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.4,
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? t.radius.sm,
          backgroundColor: t.colors.surfaceAlt,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: t.colors.surface },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonGroup: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap,
}) => {
  const t = useTheme();
  return <View style={{ gap: gap ?? t.spacing.sm }}>{children}</View>;
};
