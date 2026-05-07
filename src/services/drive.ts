import * as FileSystem from 'expo-file-system/legacy';
import { DRIVE } from '@/constants';
import { getValidAccessToken } from './auth';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  parents?: string[];
}

const auth = async (): Promise<string> => {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  return token;
};

const json = async <T>(r: Response): Promise<T> => {
  if (!r.ok) {
    throw new Error(`Drive API ${r.status}: ${await r.text()}`);
  }
  return (await r.json()) as T;
};

export const listAppDataFiles = async (
  query?: string
): Promise<DriveFile[]> => {
  const token = await auth();
  const params = new URLSearchParams({
    spaces: DRIVE.appDataSpace,
    fields: 'files(id, name, modifiedTime, size, parents)',
    pageSize: '1000',
  });
  if (query) params.set('q', query);
  const r = await fetch(`${DRIVE.apiEndpoint}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json<{ files: DriveFile[] }>(r);
  return data.files ?? [];
};

export const findFileByName = async (
  name: string,
  parentId: string = 'appDataFolder'
): Promise<DriveFile | null> => {
  const safe = name.replace(/'/g, "\\'");
  const files = await listAppDataFiles(
    `name = '${safe}' and '${parentId}' in parents and trashed = false`
  );
  return files[0] ?? null;
};

export const createFolder = async (
  name: string,
  parentId: string = 'appDataFolder'
): Promise<DriveFile> => {
  const token = await auth();
  const r = await fetch(DRIVE.apiEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  return json<DriveFile>(r);
};

export const ensureFolder = async (
  name: string,
  parentId: string = 'appDataFolder'
): Promise<string> => {
  const existing = await findFileByName(name, parentId);
  if (existing) return existing.id;
  const created = await createFolder(name, parentId);
  return created.id;
};

export const ensureFolderTree = async (): Promise<{
  rootId: string;
  backupsId: string;
  photosId: string;
  exportsId: string;
}> => {
  const rootId = await ensureFolder(DRIVE.rootFolderName);
  const [backupsId, photosId, exportsId] = await Promise.all([
    ensureFolder(DRIVE.backupsFolder, rootId),
    ensureFolder(DRIVE.photosFolder, rootId),
    ensureFolder(DRIVE.exportsFolder, rootId),
  ]);
  return { rootId, backupsId, photosId, exportsId };
};

export const uploadJSON = async (
  name: string,
  data: unknown,
  parentId: string
): Promise<DriveFile> => {
  const token = await auth();
  const existing = await findFileByName(name, parentId);
  const body = JSON.stringify(data);
  const boundary = '------BoundaryGymTracker' + Date.now();
  const metadata = existing
    ? { name }
    : { name, parents: [parentId], mimeType: 'application/json' };
  const multipart =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    body +
    `\r\n--${boundary}--`;
  const url = existing
    ? `${DRIVE.uploadEndpoint}/${existing.id}?uploadType=multipart`
    : `${DRIVE.uploadEndpoint}?uploadType=multipart`;
  const r = await fetch(url, {
    method: existing ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipart,
  });
  return json<DriveFile>(r);
};

export const downloadJSON = async <T>(fileId: string): Promise<T> => {
  const token = await auth();
  const r = await fetch(`${DRIVE.apiEndpoint}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`Drive download failed: ${r.status}`);
  return (await r.json()) as T;
};

export const uploadBinary = async (
  name: string,
  fileUri: string,
  parentId: string,
  mimeType: string = 'image/jpeg'
): Promise<DriveFile> => {
  const token = await auth();
  const existing = await findFileByName(name, parentId);

  const initUrl = existing
    ? `${DRIVE.uploadEndpoint}/${existing.id}?uploadType=resumable`
    : `${DRIVE.uploadEndpoint}?uploadType=resumable`;
  const metadata = existing ? { name } : { name, parents: [parentId], mimeType };
  const initRes = await fetch(initUrl, {
    method: existing ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
    },
    body: JSON.stringify(metadata),
  });
  if (!initRes.ok) {
    throw new Error(`Drive resumable init failed: ${initRes.status}`);
  }
  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) throw new Error('Missing upload URL from Drive');

  const upload = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { 'Content-Type': mimeType },
  });
  if (upload.status >= 300) {
    throw new Error(`Drive upload failed: ${upload.status} ${upload.body}`);
  }
  return JSON.parse(upload.body) as DriveFile;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  const token = await auth();
  await fetch(`${DRIVE.apiEndpoint}/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};
