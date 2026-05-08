import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

const TRACK_W = 48;
const TRACK_H = 28;
const KNOB = 22;
const PAD = 3;

export const Switch: React.FC<Props> = ({ value, onValueChange, disabled }) => {
  const t = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [t.colors.surfaceAlt, t.colors.primary]
    ),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_W - KNOB - PAD * 2) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={[
          {
            width: TRACK_W,
            height: TRACK_H,
            borderRadius: TRACK_H / 2,
            padding: PAD,
            justifyContent: 'center',
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: KNOB,
              height: KNOB,
              borderRadius: KNOB / 2,
              backgroundColor: '#FFFFFF',
            },
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};
