import React, { useEffect } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  contentStyle,
}) => {
  const t = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withTiming(0, { duration: 240 });
    } else if (mounted) {
      opacity.value = withTiming(0, { duration: 160 });
      translateY.value = withTiming(40, { duration: 200 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, opacity, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
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
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>
      <View style={styles.host} pointerEvents="box-none">
        <Animated.View
          style={[
            {
              backgroundColor: t.colors.bgElevated,
              borderTopLeftRadius: t.radius.xxl,
              borderTopRightRadius: t.radius.xxl,
              borderTopWidth: 1,
              borderTopColor: t.colors.border,
              ...t.elevation(4, t.colors.shadow),
            },
            sheetStyle,
            contentStyle,
          ]}
        >
          <SafeAreaView edges={['bottom']}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: t.colors.border,
                alignSelf: 'center',
                marginTop: t.spacing.sm,
                marginBottom: t.spacing.xs,
              }}
            />
            {title ? (
              <View style={{ paddingHorizontal: t.spacing.xxl, paddingTop: t.spacing.sm }}>
                <Text variant="h2">{title}</Text>
              </View>
            ) : null}
            <View style={{ padding: t.spacing.xxl }}>{children}</View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
