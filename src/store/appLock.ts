import { create } from 'zustand';

interface AppLockState {
  isLocked: boolean;
  hasUnlockedOnce: boolean;
  lock: () => void;
  unlock: () => void;
}

export const useAppLockStore = create<AppLockState>((set) => ({
  isLocked: false,
  hasUnlockedOnce: false,
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false, hasUnlockedOnce: true }),
}));
