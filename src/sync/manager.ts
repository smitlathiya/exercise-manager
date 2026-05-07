import {
  peekQueue,
  removeQueueItem,
  markQueueFailure,
  getQueueLength,
  getFailedCount,
} from '@/database/sync';
import { exportSnapshot } from '@/database/repositories/export';
import { ensureFolderTree, uploadJSON, uploadBinary } from '@/services/drive';
import { isOnline } from '@/services/network';
import { useSyncStore } from '@/store/sync';
import { useAuthStore } from '@/store/auth';
import { setPhotoDriveId } from '@/database/repositories/photos';
import * as FileSystem from 'expo-file-system/legacy';
import { SYNC_INTERVAL_MS } from '@/constants';
import dayjs from 'dayjs';

const MAX_ATTEMPTS = 3;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let inFlight = false;

const refreshStats = async (): Promise<void> => {
  const [pending, failed] = await Promise.all([getQueueLength(), getFailedCount()]);
  useSyncStore.getState().setStats({ pending, failed });
};

const handlePhotoUpload = async (
  photo: Record<string, unknown>,
  photosFolderId: string
): Promise<string | null> => {
  const localUri = photo.local_uri as string | undefined;
  const id = photo.id as string;
  if (!localUri) return null;
  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists) return null;
  const filename = `${id}.jpg`;
  const file = await uploadBinary(filename, localUri, photosFolderId, 'image/jpeg');
  await setPhotoDriveId(id, file.id);
  return file.id;
};

export const runSync = async (options?: { manual?: boolean }): Promise<void> => {
  if (inFlight) return;
  if (!useAuthStore.getState().accessToken && !useAuthStore.getState().refreshToken) {
    return;
  }
  if (!(await isOnline())) {
    if (options?.manual) {
      useSyncStore.getState().setLastError('Offline — will retry when reconnected.');
    }
    return;
  }
  inFlight = true;
  useSyncStore.getState().setSyncing(true);
  useSyncStore.getState().setLastError(null);

  try {
    const folders = await ensureFolderTree();

    // 1. Drain queue (process item-by-item, but for entity backups we just
    //    upload a fresh snapshot per drain to keep this simple and reliable).
    const items = await peekQueue(500);

    for (const item of items) {
      try {
        if (item.entity === 'progress_photos' && item.op === 'upsert' && item.payload) {
          const photo = JSON.parse(item.payload) as Record<string, unknown>;
          await handlePhotoUpload(photo, folders.photosId);
        }
        // For all other entities, we rely on the snapshot upload below.
        await removeQueueItem(item.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await markQueueFailure(item.id, msg);
        if (item.attempts + 1 >= MAX_ATTEMPTS) {
          await removeQueueItem(item.id);
        }
      }
    }

    // 2. Upload a fresh DB snapshot (atomic backup).
    const snap = await exportSnapshot();
    const filename = `backup_${dayjs().format('YYYY-MM-DD')}.json`;
    await uploadJSON(filename, snap, folders.backupsId);
    await uploadJSON('latest.json', snap, folders.backupsId);

    await useSyncStore.getState().markSynced();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    useSyncStore.getState().setLastError(msg);
  } finally {
    await refreshStats();
    useSyncStore.getState().setSyncing(false);
    inFlight = false;
  }
};

export const startAutoSync = (): void => {
  if (intervalHandle) return;
  intervalHandle = setInterval(() => {
    void runSync();
  }, SYNC_INTERVAL_MS);
  void runSync();
  void refreshStats();
};

export const stopAutoSync = (): void => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
};

export const refreshSyncStats = refreshStats;
