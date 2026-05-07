import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { TypographyKey } from '@/theme/typography';

interface Props extends TextProps {
  variant?: TypographyKey;
  color?: 'text' | 'muted' | 'dim' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
}

export const Text: React.FC<Props> = ({
  variant = 'body',
  color = 'text',
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const t = useTheme();
  const colorMap: Record<NonNullable<Props['color']>, string> = {
    text: t.colors.text,
    muted: t.colors.textMuted,
    dim: t.colors.textDim,
    primary: t.colors.primary,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
    accent: t.colors.accent,
  };
  return (
    <RNText
      style={[
        t.typography[variant],
        { color: colorMap[color] },
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
