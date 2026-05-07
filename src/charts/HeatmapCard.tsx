import React from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  title: string;
  subtitle?: string;
  data: { day: string; count: number }[];
  cols?: number;
}

export const HeatmapCard: React.FC<Props> = ({ title, subtitle, data, cols = 7 }) => {
  const t = useTheme();
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card>
      <Text variant="h3">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.md }}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {data.map((d) => {
          const intensity = d.count / max;
          const bg =
            d.count === 0
              ? t.colors.surfaceAlt
              : `rgba(255,90,31,${Math.max(0.25, intensity).toFixed(2)})`;
          return (
            <View
              key={d.day}
              style={{
                width: `${100 / cols - 2}%`,
                aspectRatio: 1,
                backgroundColor: bg,
                borderRadius: 4,
              }}
            />
          );
        })}
      </View>
    </Card>
  );
};
