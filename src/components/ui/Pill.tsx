import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Pill: React.FC<Props> = ({ label, active, onPress, style, tone = 'default' }) => {
  const t = useTheme();
  const toneBg: Record<NonNullable<Props['tone']>, string> = {
    default: t.colors.surface,
    primary: t.colors.primary,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
  };
  const fg =
    tone === 'default'
      ? active
        ? t.colors.text
        : t.colors.textMuted
      : '#FFFFFF';
  const bg = active
    ? tone === 'default'
      ? t.colors.surfaceAlt
      : toneBg[tone]
    : tone === 'default'
      ? t.colors.surface
      : `${toneBg[tone]}33`;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: t.spacing.md,
          paddingVertical: 6,
          borderRadius: t.radius.pill,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: active ? 'transparent' : t.colors.border,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <Text variant="caption" style={{ color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
};
