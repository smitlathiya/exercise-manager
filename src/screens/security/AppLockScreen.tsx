import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Text, Button, Input } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  authenticateBiometric,
  isBiometricAvailable,
  isPinSet,
  verifyPin,
} from '@/services/appLock';
import { useAppLockStore } from '@/store/appLock';
import { useSettingsStore } from '@/store/settings';

export const AppLockScreen: React.FC = () => {
  const t = useTheme();
  const unlock = useAppLockStore((s) => s.unlock);
  const settings = useSettingsStore();
  const [pin, setPin] = useState('');
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable);
    if (settings.biometricEnabled) {
      void tryBiometric();
    }
  }, [settings.biometricEnabled]);

  const tryBiometric = async () => {
    const ok = await authenticateBiometric();
    if (ok) unlock();
  };

  const submitPin = async () => {
    if (!(await isPinSet())) {
      Alert.alert('No PIN set', 'Disable PIN lock from Settings.');
      return;
    }
    const ok = await verifyPin(pin);
    if (ok) {
      setPin('');
      unlock();
    } else {
      Alert.alert('Incorrect PIN');
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: t.spacing.lg }}>
        <Text variant="display" align="center">
          Locked
        </Text>
        <Text variant="body" color="muted" align="center">
          Unlock to continue.
        </Text>
        {settings.biometricEnabled && bioAvailable ? (
          <Button title="Use biometrics" onPress={tryBiometric} variant="secondary" fullWidth />
        ) : null}
        {settings.pinEnabled ? (
          <>
            <Input
              label="PIN"
              keyboardType="number-pad"
              secureTextEntry
              value={pin}
              onChangeText={setPin}
              maxLength={8}
            />
            <Button title="Unlock" onPress={submitPin} fullWidth />
          </>
        ) : null}
      </View>
    </Screen>
  );
};
