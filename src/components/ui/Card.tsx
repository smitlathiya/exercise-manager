import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'flat' | 'elevated' | 'outline' | 'tonal';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: Variant;
  padded?: boolean;
  highlighted?: boolean;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Card: React.FC<Props> = ({
  children,
  style,
  onPress,
  onLongPress,
  variant = 'flat',
  padded = true,
  highlighted,
  tone = 'default',
}) => {
  const t = useTheme();
  const scale = useSharedValue(1);

  const toneSoft =
    tone === 'primary'
      ? t.colors.primarySoft
      : tone === 'success'
        ? t.colors.successSoft
        : tone === 'warning'
          ? t.colors.warningSoft
          : tone === 'danger'
            ? t.colors.dangerSoft
            : null;

  const variantBg: Record<Variant, string> = {
    flat: t.colors.surface,
    elevated: t.colors.bgElevated,
    outline: 'transparent',
    tonal: toneSoft ?? t.colors.surfaceAlt,
  };

  const ringColor =
    tone === 'primary'
      ? t.colors.primary
      : tone === 'success'
        ? t.colors.success
        : tone === 'warning'
          ? t.colors.warning
          : tone === 'danger'
            ? t.colors.danger
            : t.colors.border;

  const base: ViewStyle = {
    backgroundColor: variantBg[variant],
    borderRadius: t.radius.lg,
    borderWidth: variant === 'outline' || variant === 'flat' || highlighted ? 1 : 0,
    borderColor: highlighted ? ringColor : t.colors.border,
    padding: padded ? t.spacing.lg : 0,
    ...(variant === 'elevated' ? t.elevation(2, t.colors.shadow) : {}),
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => (scale.value = withTiming(0.985, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 140 }))}
        style={[base, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
};

export const CardRow: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View
    style={[
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      style,
    ]}
  >
    {children}
  </View>
);

export const Divider: React.FC<{ vertical?: boolean; inset?: number }> = ({ vertical, inset }) => {
  const t = useTheme();
  return (
    <View
      style={
        vertical
          ? {
              width: 1,
              alignSelf: 'stretch',
              backgroundColor: t.colors.divider,
              marginHorizontal: inset,
            }
          : {
              height: 1,
              alignSelf: 'stretch',
              backgroundColor: t.colors.divider,
              marginVertical: inset,
            }
      }
    />
  );
};
