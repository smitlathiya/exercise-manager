import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from '@/constants';
import type { GoogleProfile } from '@/types';

interface AuthState {
  profile: GoogleProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (s: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: number;
    profile?: GoogleProfile | null;
  }) => Promise<void>;
  clear: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  hydrated: false,
  hydrate: async () => {
    const [t, r, e, p] = await Promise.all([
      SecureStore.getItemAsync(SECURE_KEYS.googleAccessToken),
      SecureStore.getItemAsync(SECURE_KEYS.googleRefreshToken),
      SecureStore.getItemAsync(SECURE_KEYS.googleAccessExpires),
      SecureStore.getItemAsync(SECURE_KEYS.googleProfile),
    ]);
    set({
      accessToken: t,
      refreshToken: r,
      expiresAt: e ? Number(e) : null,
      profile: p ? (JSON.parse(p) as GoogleProfile) : null,
      hydrated: true,
    });
  },
  setSession: async ({ accessToken, refreshToken, expiresAt, profile }) => {
    await SecureStore.setItemAsync(SECURE_KEYS.googleAccessToken, accessToken);
    await SecureStore.setItemAsync(
      SECURE_KEYS.googleAccessExpires,
      String(expiresAt)
    );
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_KEYS.googleRefreshToken, refreshToken);
    }
    if (profile) {
      await SecureStore.setItemAsync(
        SECURE_KEYS.googleProfile,
        JSON.stringify(profile)
      );
    }
    set({
      accessToken,
      refreshToken: refreshToken ?? get().refreshToken,
      expiresAt,
      profile: profile ?? get().profile,
    });
  },
  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_KEYS.googleAccessToken),
      SecureStore.deleteItemAsync(SECURE_KEYS.googleRefreshToken),
      SecureStore.deleteItemAsync(SECURE_KEYS.googleAccessExpires),
      SecureStore.deleteItemAsync(SECURE_KEYS.googleProfile),
    ]);
    set({ accessToken: null, refreshToken: null, expiresAt: null, profile: null });
  },
}));
