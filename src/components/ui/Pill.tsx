import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: Tone;
  size?: 'sm' | 'md';
  iconLeft?: React.ReactNode;
}

export const Pill: React.FC<Props> = ({
  label,
  active,
  onPress,
  style,
  tone = 'default',
  size = 'md',
  iconLeft,
}) => {
  const t = useTheme();

  const toneFg: Record<Tone, string> = {
    default: t.colors.textMuted,
    primary: t.colors.primary,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
    accent: t.colors.accent,
  };
  const toneBgSoft: Record<Tone, string> = {
    default: t.colors.surfaceAlt,
    primary: t.colors.primarySoft,
    success: t.colors.successSoft,
    warning: t.colors.warningSoft,
    danger: t.colors.dangerSoft,
    accent: t.colors.accentSoft,
  };

  const fg = active && tone === 'default' ? t.colors.text : toneFg[tone];
  const bg = active ? toneBgSoft[tone] : 'transparent';
  const borderColor = active ? 'transparent' : t.colors.border;

  const padH = size === 'sm' ? 8 : t.spacing.md;
  const padV = size === 'sm' ? 4 : 6;

  const content = (
    <View
      style={[
        {
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: t.radius.pill,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        style,
      ]}
    >
      {iconLeft}
      <Text variant={size === 'sm' ? 'footnote' : 'caption'} style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {content}
    </Pressable>
  );
};
