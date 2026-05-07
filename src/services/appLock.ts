import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { SECURE_KEYS } from '@/constants';

export const isBiometricAvailable = async (): Promise<boolean> => {
  const supported = await LocalAuthentication.hasHardwareAsync();
  if (!supported) return false;
  return LocalAuthentication.isEnrolledAsync();
};

export const authenticateBiometric = async (): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Gym Tracker',
    fallbackLabel: 'Use PIN',
    disableDeviceFallback: false,
  });
  return result.success;
};

const hashPin = async (pin: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `gymtracker:${pin}`);

export const setPin = async (pin: string): Promise<void> => {
  if (!/^\d{4,8}$/.test(pin)) throw new Error('PIN must be 4–8 digits.');
  const hashed = await hashPin(pin);
  await SecureStore.setItemAsync(SECURE_KEYS.appPin, hashed);
};

export const clearPin = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SECURE_KEYS.appPin);
};

export const verifyPin = async (pin: string): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync(SECURE_KEYS.appPin);
  if (!stored) return false;
  const hashed = await hashPin(pin);
  return hashed === stored;
};

export const isPinSet = async (): Promise<boolean> => {
  const v = await SecureStore.getItemAsync(SECURE_KEYS.appPin);
  return Boolean(v);
};
