import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Screen,
  ScreenHeader,
  Card,
  Text,
  Switch,
  Pill,
  Button,
  Input,
  Modal,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme';
import { useSettingsStore } from '@/store/settings';
import { useAuthStore } from '@/store/auth';
import { useSyncStore } from '@/store/sync';
import { runSync } from '@/sync/manager';
import { restoreLatestBackup } from '@/sync/restore';
import { resetDatabase } from '@/database/db';
import { exportSnapshot } from '@/database/repositories/export';
import {
  scheduleWaterReminder,
  scheduleWeightReminder,
  scheduleWorkoutReminder,
} from '@/services/notifications';
import {
  isBiometricAvailable,
  isPinSet,
  setPin,
  clearPin,
  authenticateBiometric,
} from '@/services/appLock';
import { signOut } from '@/services/auth';
import { fromNow } from '@/utils/date';

export const SettingsScreen: React.FC = () => {
  const t = useTheme();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const settings = useSettingsStore();
  const profile = useAuthStore((s) => s.profile);
  const sync = useSyncStore();

  const [bioAvailable, setBioAvailable] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable);
  }, []);

  const onTogglePin = async (enable: boolean) => {
    if (enable) {
      setPinModal(true);
    } else {
      await clearPin();
      await settings.update({ pinEnabled: false });
    }
  };

  const onSavePin = async () => {
    try {
      await setPin(pinInput);
      await settings.update({ pinEnabled: true });
      setPinModal(false);
      setPinInput('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to set PIN.';
      Alert.alert('Invalid PIN', msg);
    }
  };

  const onToggleBiometric = async (enable: boolean) => {
    if (enable) {
      const ok = await authenticateBiometric();
      if (!ok) return;
    }
    await settings.update({ biometricEnabled: enable });
  };

  const exportToFile = async () => {
    try {
      const snap = await exportSnapshot();
      const path = `${FileSystem.documentDirectory}gymtracker_export_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(snap), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      Alert.alert('Exported', `Saved to:\n${path}`);
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : String(e));
    }
  };

  const restore = async () => {
    Alert.alert(
      'Restore from Drive?',
      'This will overwrite all local data with your latest Drive backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            const r = await restoreLatestBackup();
            if (r.ok) Alert.alert('Restore complete');
            else Alert.alert('Restore failed', r.reason);
          },
        },
      ]
    );
  };

  const wipe = async () => {
    Alert.alert(
      'Delete all local data?',
      'This is irreversible. Drive backups are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('Local data cleared');
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Settings" subtitle={profile?.email ?? ''} />

      {/* Account */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3">Account</Text>
        <Text color="muted" style={{ marginTop: t.spacing.xs }}>
          {profile?.name ?? 'Signed in with Google'}
        </Text>
        <Text variant="caption" color="dim" style={{ marginTop: t.spacing.xs }}>
          Drive scope: appdata only
        </Text>
        <Button
          title="Sign out"
          variant="ghost"
          onPress={async () => {
            await signOut();
          }}
          style={{ alignSelf: 'flex-start', marginTop: t.spacing.sm, paddingHorizontal: 0 }}
        />
      </Card>

      {/* Sync */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3">Backup & Sync</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.sm }}>
          <Text color="muted">Last sync</Text>
          <Text>{sync.lastSyncAt ? fromNow(sync.lastSyncAt) : 'Never'}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.xs }}>
          <Text color="muted">Pending changes</Text>
          <Text>{sync.pending}</Text>
        </View>
        {sync.lastError ? (
          <Text variant="caption" color="danger" style={{ marginTop: t.spacing.xs }}>
            {sync.lastError}
          </Text>
        ) : null}
        <Row
          label="Auto sync"
          right={
            <Switch
              value={settings.autoSyncEnabled}
              onValueChange={(v) => settings.update({ autoSyncEnabled: v })}
            />
          }
        />
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
          <Button title="Sync now" loading={sync.isSyncing} onPress={() => runSync({ manual: true })} style={{ flex: 1 }} />
          <Button title="Restore" variant="secondary" onPress={restore} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
          <Button title="Export JSON" variant="ghost" onPress={exportToFile} style={{ flex: 1 }} />
        </View>
      </Card>

      {/* Appearance */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Appearance</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          {(['dark', 'light', 'system'] as const).map((m) => (
            <Pill
              key={m}
              label={m === 'system' ? 'System' : m === 'dark' ? 'Dark' : 'Light'}
              active={themeMode === m}
              onPress={() => setThemeMode(m)}
            />
          ))}
        </View>
      </Card>

      {/* Units */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Units</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          {(['kg', 'lbs'] as const).map((u) => (
            <Pill
              key={u}
              label={u.toUpperCase()}
              active={settings.unit === u}
              onPress={() => settings.update({ unit: u })}
            />
          ))}
        </View>
        <Row
          label="Default rest (s)"
          right={
            <Input
              keyboardType="number-pad"
              value={String(settings.defaultRestSeconds)}
              onChangeText={(v) => settings.update({ defaultRestSeconds: Math.max(0, Number(v) || 0) })}
              containerStyle={{ width: 90, marginBottom: 0 }}
            />
          }
        />
      </Card>

      {/* Security */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Security</Text>
        <Row
          label="App lock"
          right={
            <Switch
              value={settings.appLockEnabled}
              onValueChange={(v) => settings.update({ appLockEnabled: v })}
            />
          }
        />
        <Row
          label="Biometric unlock"
          right={
            <Switch
              value={settings.biometricEnabled}
              onValueChange={onToggleBiometric}
              disabled={!bioAvailable || !settings.appLockEnabled}
            />
          }
        />
        <Row
          label="PIN unlock"
          right={
            <Switch
              value={settings.pinEnabled}
              onValueChange={onTogglePin}
              disabled={!settings.appLockEnabled}
            />
          }
        />
      </Card>

      {/* Notifications */}
      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Reminders</Text>
        <ReminderRow
          label="Workout (hour 0–23)"
          value={settings.workoutReminderHour}
          onChange={async (h) => {
            await settings.update({ workoutReminderHour: h });
            await scheduleWorkoutReminder(h);
          }}
        />
        <ReminderRow
          label="Water (every N hours)"
          value={settings.waterReminderEvery}
          onChange={async (v) => {
            await settings.update({ waterReminderEvery: v });
            await scheduleWaterReminder(v);
          }}
          maxValue={24}
        />
        <ReminderRow
          label="Weight check (hour 0–23)"
          value={settings.weightReminderHour}
          onChange={async (h) => {
            await settings.update({ weightReminderHour: h });
            await scheduleWeightReminder(h);
          }}
        />
      </Card>

      {/* Danger zone */}
      <Card>
        <Text variant="h3" style={{ marginBottom: t.spacing.sm }}>Danger zone</Text>
        <Button title="Delete all local data" variant="danger" onPress={wipe} fullWidth />
      </Card>

      <Modal visible={pinModal} onClose={() => setPinModal(false)} title="Set PIN">
        <Input
          label="4–8 digits"
          keyboardType="number-pad"
          secureTextEntry
          value={pinInput}
          onChangeText={setPinInput}
          maxLength={8}
        />
        <Button title="Save" onPress={onSavePin} fullWidth />
      </Modal>
    </Screen>
  );
};

const Row: React.FC<{ label: string; right: React.ReactNode }> = ({ label, right }) => {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.spacing.sm,
      }}
    >
      <Text>{label}</Text>
      {right}
    </View>
  );
};

const ReminderRow: React.FC<{
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  maxValue?: number;
}> = ({ label, value, onChange, maxValue = 23 }) => {
  const t = useTheme();
  const [text, setText] = React.useState(value !== null ? String(value) : '');
  React.useEffect(() => {
    setText(value !== null ? String(value) : '');
  }, [value]);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.spacing.xs,
      }}
    >
      <Text style={{ flex: 1 }}>{label}</Text>
      <Input
        keyboardType="number-pad"
        placeholder="off"
        value={text}
        onChangeText={(v) => setText(v.replace(/[^\d]/g, ''))}
        onEndEditing={() => {
          if (!text) {
            onChange(null);
            return;
          }
          const n = Number(text);
          if (!Number.isFinite(n) || n < 0 || n > maxValue) {
            onChange(null);
          } else {
            onChange(n);
          }
        }}
        containerStyle={{ width: 80, marginBottom: 0 }}
      />
    </View>
  );
};
