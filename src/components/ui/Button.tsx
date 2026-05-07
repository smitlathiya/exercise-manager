import React from 'react';
import { Pressable, ActivityIndicator, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
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
}) => {
  const t = useTheme();
  const heights: Record<Size, number> = { sm: 36, md: 46, lg: 54 };
  const padH: Record<Size, number> = { sm: t.spacing.md, md: t.spacing.lg, lg: t.spacing.xl };
  const fontSize: Record<Size, number> = { sm: 13, md: 15, lg: 17 };

  const palette = {
    primary: { bg: t.colors.primary, fg: '#FFFFFF', border: 'transparent' },
    secondary: { bg: t.colors.surface, fg: t.colors.text, border: t.colors.border },
    ghost: { bg: 'transparent', fg: t.colors.text, border: 'transparent' },
    danger: { bg: t.colors.danger, fg: '#FFFFFF', border: 'transparent' },
    success: { bg: t.colors.success, fg: '#FFFFFF', border: 'transparent' },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: padH[size],
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderRadius: t.radius.md,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {iconLeft}
          <Text
            variant="bodyBold"
            style={{ color: palette.fg, fontSize: fontSize[size], marginHorizontal: iconLeft || iconRight ? 6 : 0 }}
          >
            {title}
          </Text>
          {iconRight}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
