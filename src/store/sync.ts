import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: number | null;
  pending: number;
  failed: number;
  lastError: string | null;
  setSyncing: (b: boolean) => void;
  setStats: (s: { pending: number; failed: number }) => void;
  setLastError: (e: string | null) => void;
  markSynced: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncAt: null,
  pending: 0,
  failed: 0,
  lastError: null,
  setSyncing: (b) => set({ isSyncing: b }),
  setStats: ({ pending, failed }) => set({ pending, failed }),
  setLastError: (e) => set({ lastError: e }),
  markSynced: async () => {
    const t = Date.now();
    await AsyncStorage.setItem(STORAGE_KEYS.lastSync, String(t));
    set({ lastSyncAt: t });
  },
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.lastSync);
    set({ lastSyncAt: raw ? Number(raw) : null });
  },
}));
