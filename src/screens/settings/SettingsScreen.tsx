import React, { useEffect, useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
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
  BottomSheet,
  ListItem,
  IconButton,
  ConfirmDialog,
} from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme';
import { useSettingsStore } from '@/store/settings';
import { resetDatabase } from '@/database/db';
import { exportSnapshot, importSnapshot, type DatabaseSnapshot } from '@/database/repositories/export';
import {
  scheduleWaterReminder,
  scheduleWeightReminder,
  scheduleWorkoutReminder,
} from '@/services/notifications';
import {
  isBiometricAvailable,
  setPin,
  clearPin,
  authenticateBiometric,
} from '@/services/appLock';
import {
  saveGoogleSession,
  isGoogleConnected,
  getGoogleUserEmail,
  signOutGoogle,
} from '@/services/auth';
import {
  ensureFolderTree,
  uploadJSON,
  downloadJSON,
  listAppDataFiles,
  type DriveFile,
} from '@/services/drive';
import { GOOGLE } from '@/constants';
import { fromNow } from '@/utils/date';

WebBrowser.maybeCompleteAuthSession();

export const SettingsScreen: React.FC = () => {
  const t = useTheme();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const settings = useSettingsStore();
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

  const importFromFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      
      const fileUri = result.assets[0]!.uri;
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const snap = JSON.parse(content);
      
      await importSnapshot(snap);
      Alert.alert('Imported', 'Data has been restored successfully.');
    } catch (e) {
      Alert.alert('Import failed', e instanceof Error ? e.message : String(e));
    }
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
      <ScreenHeader title="Settings" />

      <DriveSection />

      <Card style={{ marginBottom: t.spacing.md }}>
        <Text variant="h3">Local Backup</Text>
        <Text color="muted" style={{ marginTop: t.spacing.xs, marginBottom: t.spacing.md }}>
          Export or import data as a JSON file on this device.
        </Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          <Button title="Export JSON" onPress={exportToFile} style={{ flex: 1 }} />
          <Button title="Import JSON" variant="secondary" onPress={importFromFile} style={{ flex: 1 }} />
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

const DriveSection: React.FC = () => {
  const t = useTheme();
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [backupList, setBackupList] = useState<DriveFile[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<DriveFile | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE.iosClientId,
    androidClientId: GOOGLE.androidClientId,
    webClientId: GOOGLE.webClientId,
    scopes: [...GOOGLE.scopes],
    extraParams: { access_type: 'offline', prompt: 'consent' },
  });

  useEffect(() => {
    void (async () => {
      const ok = await isGoogleConnected();
      setConnected(ok);
      if (ok) setEmail(await getGoogleUserEmail());
    })();
  }, []);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const auth = response.authentication;
    if (!auth) return;
    void (async () => {
      try {
        const userRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
        const info = (await userRes.json()) as { email?: string };
        await saveGoogleSession({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken ?? null,
          expiresIn: auth.expiresIn ?? 3600,
          email: info.email,
        });
        setConnected(true);
        setEmail(info.email ?? null);
      } catch {
        Alert.alert('Sign-in failed', 'Could not complete Google sign-in.');
      }
    })();
  }, [response]);

  const onBackup = async () => {
    setBusy(true);
    try {
      const snap = await exportSnapshot();
      const { backupsId } = await ensureFolderTree();
      const filename = `backup_${Date.now()}.json`;
      await uploadJSON(filename, snap, backupsId);
      Alert.alert('Backup complete', 'Your data has been saved to Google Drive.');
    } catch (e) {
      Alert.alert('Backup failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onOpenRestore = async () => {
    setBusy(true);
    try {
      const { backupsId } = await ensureFolderTree();
      const files = await listAppDataFiles(`'${backupsId}' in parents and trashed = false`);
      files.sort(
        (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
      );
      setBackupList(files);
      setShowPicker(true);
    } catch (e) {
      Alert.alert('Could not load backups', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async (fileId: string) => {
    setBusy(true);
    try {
      const snap = await downloadJSON<DatabaseSnapshot>(fileId);
      await importSnapshot(snap);
      Alert.alert('Restored', 'Your data has been restored from Google Drive.');
    } catch (e) {
      Alert.alert('Restore failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = () => {
    Alert.alert('Disconnect Google Drive?', 'Backups in Drive are not deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          await signOutGoogle();
          setConnected(false);
          setEmail(null);
        },
      },
    ]);
  };

  return (
    <>
      <Card style={{ marginBottom: t.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginBottom: t.spacing.xs }}>
          <IconButton name="google-drive" size="sm" tone="primary" variant="tonal" />
          <Text variant="h3">Google Drive</Text>
        </View>

        {connected ? (
          <>
            <Text color="muted" style={{ marginBottom: t.spacing.md }}>
              {email ?? 'Connected'}
            </Text>
            <View style={{ gap: t.spacing.sm }}>
              <Button
                title="Backup to Drive"
                onPress={onBackup}
                loading={busy}
                fullWidth
              />
              <Button
                title="Restore from Drive"
                variant="secondary"
                onPress={onOpenRestore}
                loading={busy}
                fullWidth
              />
              <Button
                title="Disconnect"
                variant="ghost"
                onPress={onDisconnect}
                fullWidth
              />
            </View>
          </>
        ) : (
          <>
            <Text color="muted" style={{ marginTop: t.spacing.xs, marginBottom: t.spacing.md }}>
              Back up and restore your data via Google Drive.
            </Text>
            <Button
              title="Connect Google Drive"
              onPress={() => promptAsync()}
              disabled={!request}
              fullWidth
            />
          </>
        )}
      </Card>

      <BottomSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        title="Select Backup"
      >
        {backupList.length === 0 ? (
          <Text color="muted" align="center" style={{ paddingVertical: t.spacing.lg }}>
            No backups found in Drive
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: 360 }}>
            {backupList.map((file) => (
              <ListItem
                key={file.id}
                title={new Date(file.modifiedTime).toLocaleString()}
                subtitle={file.size ? `${(Number(file.size) / 1024).toFixed(1)} KB` : file.name}
                leading={<IconButton name="cloud-download-outline" size="sm" tone="primary" variant="tonal" />}
                onPress={() => {
                  setShowPicker(false);
                  setConfirmRestore(file);
                }}
              />
            ))}
          </ScrollView>
        )}
      </BottomSheet>

      <ConfirmDialog
        visible={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        title="Restore Backup"
        description={`Restore from ${confirmRestore ? new Date(confirmRestore.modifiedTime).toLocaleString() : ''}? All current local data will be replaced.`}
        destructive
        confirmLabel="Restore"
        onConfirm={async () => {
          if (confirmRestore) await onRestore(confirmRestore.id);
          setConfirmRestore(null);
        }}
      />
    </>
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
