import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = `${FileSystem.documentDirectory}progress_photos/`;
const THUMBS_DIR = `${FileSystem.documentDirectory}progress_thumbs/`;

export const ensurePhotoDirs = async (): Promise<void> => {
  for (const d of [PHOTOS_DIR, THUMBS_DIR]) {
    const info = await FileSystem.getInfoAsync(d);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(d, { intermediates: true });
    }
  }
};

interface ProcessResult {
  uri: string;
  thumbUri: string;
  width: number;
  height: number;
}

export const processProgressImage = async (
  sourceUri: string
): Promise<ProcessResult> => {
  await ensurePhotoDirs();

  const main = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1280 } }],
    { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG }
  );
  const thumb = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 320 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const mainPath = `${PHOTOS_DIR}${id}.jpg`;
  const thumbPath = `${THUMBS_DIR}${id}.jpg`;

  await FileSystem.copyAsync({ from: main.uri, to: mainPath });
  await FileSystem.copyAsync({ from: thumb.uri, to: thumbPath });

  return {
    uri: mainPath,
    thumbUri: thumbPath,
    width: main.width,
    height: main.height,
  };
};

export const removeImageFiles = async (
  uris: (string | null | undefined)[]
): Promise<void> => {
  for (const u of uris) {
    if (!u) continue;
    try {
      await FileSystem.deleteAsync(u, { idempotent: true });
    } catch {
      /* ignore */
    }
  }
};
