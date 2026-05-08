import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  label?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const Fab: React.FC<Props> = ({ label, icon, onPress, style, accessibilityLabel }) => {
  const t = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.94, { duration: 90 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 140 }))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? 'Action'}
      style={[
        {
          position: 'absolute',
          right: t.spacing.lg,
          bottom: t.spacing.xxxl,
          backgroundColor: t.colors.primary,
          paddingHorizontal: label ? t.spacing.xl : 0,
          height: 56,
          minWidth: 56,
          borderRadius: 28,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          ...t.elevation(4, t.colors.shadow),
        },
        animatedStyle,
        style,
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons name={icon} size={22} color={t.colors.primaryFg} />
      ) : null}
      {label ? (
        <Text variant="button" style={{ color: t.colors.primaryFg }}>
          {label}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
};
