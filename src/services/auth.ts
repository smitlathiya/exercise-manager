import * as SecureStore from 'expo-secure-store';
import { GOOGLE } from '@/constants';

const KEYS = {
  accessToken: 'google_access_token',
  refreshToken: 'google_refresh_token',
  expiresAt: 'google_token_expires_at',
  userEmail: 'google_user_email',
} as const;

export const saveGoogleSession = async (params: {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  email?: string | null;
}): Promise<void> => {
  await SecureStore.setItemAsync(KEYS.accessToken, params.accessToken);
  if (params.refreshToken) {
    await SecureStore.setItemAsync(KEYS.refreshToken, params.refreshToken);
  }
  await SecureStore.setItemAsync(
    KEYS.expiresAt,
    String(Date.now() + params.expiresIn * 1000)
  );
  if (params.email) {
    await SecureStore.setItemAsync(KEYS.userEmail, params.email);
  }
};

const tryRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
    if (!refreshToken) return null;
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: GOOGLE.webClientId,
      }).toString(),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; expires_in: number };
    await saveGoogleSession({
      accessToken: data.access_token,
      refreshToken: null,
      expiresIn: data.expires_in,
    });
    return data.access_token;
  } catch {
    return null;
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    const [token, expiresAtStr] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.expiresAt),
    ]);
    if (!token) return null;
    if (Date.now() < Number(expiresAtStr ?? '0') - 60_000) return token;
    return await tryRefreshToken();
  } catch {
    return null;
  }
};

export const getGoogleUserEmail = (): Promise<string | null> =>
  SecureStore.getItemAsync(KEYS.userEmail);

export const isGoogleConnected = async (): Promise<boolean> => {
  const token = await SecureStore.getItemAsync(KEYS.accessToken);
  return !!token;
};

export const signOutGoogle = async (): Promise<void> => {
  await Promise.all(
    Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k).catch(() => {}))
  );
};
