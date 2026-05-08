import React, { useEffect } from 'react';
import { Modal as RNModal, Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dismissOnBackdrop?: boolean;
}

export const Modal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  children,
  dismissOnBackdrop = true,
}) => {
  const t = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withTiming(1, { duration: 220 });
    } else if (mounted) {
      opacity.value = withTiming(0, { duration: 140 });
      scale.value = withTiming(0.96, { duration: 140 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, opacity, scale]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!mounted) return null;

  return (
    <RNModal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: t.colors.overlay },
          backdropStyle,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={dismissOnBackdrop ? onClose : undefined}
        />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          style={[
            {
              backgroundColor: t.colors.bgElevated,
              borderRadius: t.radius.xl,
              padding: t.spacing.xxl,
              borderWidth: 1,
              borderColor: t.colors.border,
              marginHorizontal: t.spacing.xxl,
              maxWidth: 480,
              width: '100%',
              alignSelf: 'center',
              ...t.elevation(4, t.colors.shadow),
            },
            dialogStyle,
          ]}
        >
          {title ? (
            <Text variant="h2" style={{ marginBottom: t.spacing.md }}>
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
});
