import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const HANDLES = {
  workout: 'workout_reminder',
  water: 'water_reminder',
  weight: 'weight_reminder',
} as const;

export const ensurePermission = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === 1) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.ios?.status === 1;
};

export const setupAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

const cancelByTag = async (tag: string): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matches = scheduled.filter(
    (n) => (n.content.data as { tag?: string } | null)?.tag === tag
  );
  await Promise.all(
    matches.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
};

export const scheduleWorkoutReminder = async (hour: number | null): Promise<void> => {
  await cancelByTag(HANDLES.workout);
  if (hour === null) return;
  if (!(await ensurePermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to lift',
      body: 'Your workout is calling.',
      data: { tag: HANDLES.workout },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
};

export const scheduleWaterReminder = async (
  intervalHours: number | null
): Promise<void> => {
  await cancelByTag(HANDLES.water);
  if (intervalHours === null) return;
  if (!(await ensurePermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hydrate',
      body: 'Time to drink water.',
      data: { tag: HANDLES.water },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(900, intervalHours * 3600),
      repeats: true,
    },
  });
};

export const scheduleWeightReminder = async (hour: number | null): Promise<void> => {
  await cancelByTag(HANDLES.weight);
  if (hour === null) return;
  if (!(await ensurePermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weigh-in',
      body: 'Log your weight to keep your trend tracking accurate.',
      data: { tag: HANDLES.weight },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
};

export const cancelAll = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
