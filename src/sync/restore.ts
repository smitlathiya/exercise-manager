import { ensureFolderTree, findFileByName, downloadJSON } from '@/services/drive';
import { importSnapshot, DatabaseSnapshot } from '@/database/repositories/export';
import { clearQueue } from '@/database/sync';

export const restoreLatestBackup = async (): Promise<{ ok: boolean; reason?: string }> => {
  const folders = await ensureFolderTree();
  const file = await findFileByName('latest.json', folders.backupsId);
  if (!file) return { ok: false, reason: 'No backup found in Google Drive.' };
  const snap = await downloadJSON<DatabaseSnapshot>(file.id);
  await importSnapshot(snap);
  await clearQueue();
  return { ok: true };
};
