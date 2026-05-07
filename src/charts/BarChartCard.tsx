import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  title: string;
  subtitle?: string;
  data: { value: number; label: string; frontColor?: string }[];
}

export const BarChartCard: React.FC<Props> = ({ title, subtitle, data }) => {
  const t = useTheme();
  const { width } = Dimensions.get('window');
  const chartWidth = Math.max(220, width - 80);
  return (
    <Card>
      <Text variant="h3">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.md }}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ alignItems: 'center' }}>
        <BarChart
          data={data.length ? data : [{ value: 0, label: '' }]}
          width={chartWidth}
          height={160}
          frontColor={t.colors.chart2}
          barWidth={Math.max(8, chartWidth / Math.max(7, data.length) - 8)}
          spacing={6}
          barBorderRadius={4}
          rulesColor={t.colors.border}
          rulesType="solid"
          xAxisColor={t.colors.border}
          yAxisColor={t.colors.border}
          yAxisTextStyle={{ color: t.colors.textDim, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: t.colors.textDim, fontSize: 10 }}
          noOfSections={4}
          isAnimated
        />
      </View>
    </Card>
  );
};
