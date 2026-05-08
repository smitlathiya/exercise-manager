import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  style,
}: Props<T>) {
  const t = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const segWidth = containerWidth ? containerWidth / segments.length : 0;
  const activeIndex = Math.max(
    0,
    segments.findIndex((s) => s.value === value)
  );
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withSpring(activeIndex * segWidth, {
      damping: 18,
      stiffness: 220,
      mass: 0.6,
    });
  }, [activeIndex, segWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: segWidth,
  }));

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: t.colors.surfaceAlt,
          borderRadius: t.radius.md,
          padding: 4,
          height: 40,
          position: 'relative',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            backgroundColor: t.colors.bgElevated,
            borderRadius: t.radius.sm,
            ...t.elevation(1, t.colors.shadow),
          },
          indicatorStyle,
        ]}
      />
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Text
              variant="label"
              style={{ color: active ? t.colors.text : t.colors.textMuted }}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
