import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  title: string;
  subtitle?: string;
  data: { value: number; label?: string }[];
  formatY?: (v: number) => string;
}

export const LineChartCard: React.FC<Props> = ({ title, subtitle, data, formatY }) => {
  const t = useTheme();
  const { width } = Dimensions.get('window');
  const chartWidth = Math.max(220, width - 80);
  const safeData = data.length ? data : [{ value: 0, label: '' }];
  return (
    <Card>
      <Text variant="h3">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.md }}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ alignItems: 'center' }}>
        <LineChart
          data={safeData}
          width={chartWidth}
          height={160}
          isAnimated
          thickness={2}
          color={t.colors.chart1}
          startFillColor={t.colors.chart1}
          endFillColor={t.colors.chart1}
          startOpacity={0.4}
          endOpacity={0.05}
          areaChart
          curved
          hideDataPoints
          rulesColor={t.colors.border}
          rulesType="solid"
          xAxisColor={t.colors.border}
          yAxisColor={t.colors.border}
          yAxisTextStyle={{ color: t.colors.textDim, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: t.colors.textDim, fontSize: 10 }}
          formatYLabel={formatY ? (label: string) => formatY(Number(label)) : undefined}
          noOfSections={4}
        />
      </View>
    </Card>
  );
};
