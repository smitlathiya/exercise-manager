import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'plain' | 'tonal' | 'solid' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const sizeMap: Record<Size, { box: number; icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: 40, icon: 20 },
  lg: { box: 48, icon: 24 },
};

export const IconButton: React.FC<Props> = ({
  name,
  onPress,
  variant = 'plain',
  size = 'md',
  tone = 'default',
  disabled,
  style,
  accessibilityLabel,
}) => {
  const t = useTheme();
  const scale = useSharedValue(1);

  const toneColor =
    tone === 'primary'
      ? t.colors.primary
      : tone === 'success'
        ? t.colors.success
        : tone === 'warning'
          ? t.colors.warning
          : tone === 'danger'
            ? t.colors.danger
            : t.colors.text;

  const toneSoft =
    tone === 'primary'
      ? t.colors.primarySoft
      : tone === 'success'
        ? t.colors.successSoft
        : tone === 'warning'
          ? t.colors.warningSoft
          : tone === 'danger'
            ? t.colors.dangerSoft
            : t.colors.surfaceAlt;

  const bg =
    variant === 'solid'
      ? toneColor
      : variant === 'tonal'
        ? toneSoft
        : variant === 'plain'
          ? t.colors.surface
          : 'transparent';

  const fg = variant === 'solid' ? '#FFFFFF' : toneColor;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const { box, icon } = sizeMap[size];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => (scale.value = withTiming(0.92, { duration: 80 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
      style={[
        {
          width: box,
          height: box,
          borderRadius: box / 2,
          backgroundColor: bg,
          borderWidth: variant === 'plain' ? 1 : 0,
          borderColor: t.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : 1,
        },
        animStyle,
        style,
      ]}
    >
      <MaterialCommunityIcons name={name} size={icon} color={fg} />
    </AnimatedPressable>
  );
};
