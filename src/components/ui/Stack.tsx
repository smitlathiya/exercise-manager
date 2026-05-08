import React from 'react';
import { View, ViewStyle, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { Spacing } from '@/theme/spacing';

type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const alignMap: Record<Align, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap: Record<Justify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

interface StackProps extends ViewProps {
  gap?: Spacing | number;
  align?: Align;
  justify?: Justify;
  flex?: number;
  padded?: Spacing | number;
  children: React.ReactNode;
}

const resolveSpace = (v: Spacing | number | undefined, t: ReturnType<typeof useTheme>) =>
  typeof v === 'number' ? v : v ? t.spacing[v] : undefined;

export const Stack: React.FC<StackProps> = ({
  gap,
  align,
  justify,
  flex,
  padded,
  style,
  children,
  ...rest
}) => {
  const t = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'column',
          gap: resolveSpace(gap, t),
          alignItems: align ? alignMap[align] : undefined,
          justifyContent: justify ? justifyMap[justify] : undefined,
          flex,
          padding: resolveSpace(padded, t),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

export const HStack: React.FC<StackProps & { wrap?: boolean }> = ({
  gap,
  align = 'center',
  justify,
  flex,
  padded,
  wrap,
  style,
  children,
  ...rest
}) => {
  const t = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: resolveSpace(gap, t),
          alignItems: alignMap[align],
          justifyContent: justify ? justifyMap[justify] : undefined,
          flex,
          padding: resolveSpace(padded, t),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

export const Spacer: React.FC<{ size?: Spacing | number; horizontal?: boolean }> = ({
  size = 'md',
  horizontal,
}) => {
  const t = useTheme();
  const v = resolveSpace(size, t);
  return <View style={horizontal ? { width: v } : { height: v }} />;
};
