import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { create } from 'zustand';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastInput {
  message: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

interface ToastItem extends Required<Pick<ToastInput, 'message' | 'tone' | 'duration'>> {
  id: string;
  description?: string;
  action?: ToastInput['action'];
}

interface ToastState {
  current: ToastItem | null;
  show: (t: ToastInput) => void;
  dismiss: () => void;
}

const toastStore = create<ToastState>((set) => ({
  current: null,
  show: (t) =>
    set({
      current: {
        id: Math.random().toString(36).slice(2),
        message: t.message,
        description: t.description,
        tone: t.tone ?? 'info',
        duration: t.duration ?? 2800,
        action: t.action,
      },
    }),
  dismiss: () => set({ current: null }),
}));

export const toast = {
  show: (t: ToastInput) => toastStore.getState().show(t),
  success: (message: string, description?: string) =>
    toastStore.getState().show({ message, description, tone: 'success' }),
  error: (message: string, description?: string) =>
    toastStore.getState().show({ message, description, tone: 'danger' }),
  warn: (message: string, description?: string) =>
    toastStore.getState().show({ message, description, tone: 'warning' }),
  info: (message: string, description?: string) =>
    toastStore.getState().show({ message, description, tone: 'info' }),
  dismiss: () => toastStore.getState().dismiss(),
};

const iconMap: Record<ToastTone, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  info: 'information',
  success: 'check-circle',
  warning: 'alert',
  danger: 'alert-circle',
};

export const ToastHost: React.FC = () => {
  const t = useTheme();
  const current = toastStore((s) => s.current);
  const dismiss = toastStore((s) => s.dismiss);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (!current) {
      opacity.value = withTiming(0, { duration: 160 });
      translateY.value = withTiming(-20, { duration: 160 });
      return;
    }
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 220 });
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withDelay(
        20,
        withTiming(-20, { duration: 180 }, (finished) => {
          if (finished) runOnJS(dismiss)();
        })
      );
    }, current.duration);
    return () => clearTimeout(timer);
  }, [current, opacity, translateY, dismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!current) return null;

  const tones: Record<ToastTone, { bg: string; fg: string; ring: string }> = {
    info: { bg: t.colors.surface, fg: t.colors.text, ring: t.colors.primary },
    success: { bg: t.colors.surface, fg: t.colors.text, ring: t.colors.success },
    warning: { bg: t.colors.surface, fg: t.colors.text, ring: t.colors.warning },
    danger: { bg: t.colors.surface, fg: t.colors.text, ring: t.colors.danger },
  };
  const palette = tones[current.tone];

  return (
    <SafeAreaView
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      edges={['top']}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            paddingHorizontal: t.spacing.lg,
            paddingTop: t.spacing.sm,
          },
          animatedStyle,
        ]}
      >
        <Pressable
          onPress={dismiss}
          style={{
            backgroundColor: palette.bg,
            borderRadius: t.radius.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            padding: t.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.md,
            ...t.elevation(3, t.colors.shadow),
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: palette.ring + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name={iconMap[current.tone]}
              size={20}
              color={palette.ring}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold" numberOfLines={2}>
              {current.message}
            </Text>
            {current.description ? (
              <Text variant="caption" color="muted" numberOfLines={3}>
                {current.description}
              </Text>
            ) : null}
          </View>
          {current.action ? (
            <Pressable
              hitSlop={8}
              onPress={() => {
                current.action?.onPress();
                dismiss();
              }}
            >
              <Text variant="bodyBold" color="primary">
                {current.action.label}
              </Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
};
