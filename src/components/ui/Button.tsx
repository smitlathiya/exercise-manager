import React from 'react';
import { Pressable, ActivityIndicator, ViewStyle, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  accessibilityLabel?: string;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  style,
  iconLeft,
  iconRight,
  accessibilityLabel,
}) => {
  const t = useTheme();
  const scale = useSharedValue(1);

  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const padH: Record<Size, number> = { sm: t.spacing.md, md: t.spacing.xl, lg: t.spacing.xxl };
  const fontSize: Record<Size, number> = { sm: 13, md: 15, lg: 16 };

  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: t.colors.primary, fg: t.colors.primaryFg, border: 'transparent' },
    secondary: { bg: t.colors.surface, fg: t.colors.text, border: t.colors.border },
    tonal: { bg: t.colors.primarySoft, fg: t.colors.primary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: t.colors.text, border: 'transparent' },
    danger: { bg: t.colors.danger, fg: '#FFFFFF', border: 'transparent' },
    success: { bg: t.colors.success, fg: '#FFFFFF', border: 'transparent' },
  };
  const p = palette[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 80 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 140 }))}
      style={[
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: padH[size],
          backgroundColor: p.bg,
          borderColor: p.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderRadius: t.radius.md,
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {iconLeft ? <View style={{ marginRight: 6 }}>{iconLeft}</View> : null}
          <Text
            variant="button"
            style={{ color: p.fg, fontSize: fontSize[size] }}
          >
            {title}
          </Text>
          {iconRight ? <View style={{ marginLeft: 6 }}>{iconRight}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
