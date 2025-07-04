import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { AudioTrack } from '@/stores/library';
import { appDataDir } from '@tauri-apps/api/path';
import { join } from '@tauri-apps/api/path';

// 获取缓存缓存文件路径
async function getCacheFilePath(): Promise<string> {
  const appData = await appDataDir();
  return join(appData, 'flac-player', 'library.json');
}

// 确保缓存目录存在
async function ensureCacheDir() {
  const cacheFile = await getCacheFilePath();
  const dir = cacheFile.substring(0, cacheFile.lastIndexOf('/'));
  // Tauri v2 中可使用 fs:create-dir 插件确保目录存在
  try {
    await exists(dir);
  } catch {
    // 目录不存在时创建（需在 capabilities 中添加 fs:create-dir 权限）
    await invoke('create_directory', { path: dir });
  }
}

// 保存曲库到缓存
export async function saveLibraryCache(tracks: AudioTrack[]): Promise<boolean> {
  try {
    await ensureCacheDir();
    const cacheFile = await getCacheFilePath();
    await writeTextFile(
      cacheFile,
      JSON.stringify(tracks, null, 2) // 格式化JSON便于调试
    );
    console.log(`已保存 ${tracks.length} 首曲目到缓存`);
    return true;
  } catch (err) {
    console.error('保存缓存失败:', err);
    return false;
  }
}

// 从缓存加载曲库
export async function loadLibraryCache(): Promise<AudioTrack[]> {
  try {
    const cacheFile = await getCacheFilePath();
    if (!await exists(cacheFile)) {
      console.log('缓存文件不存在');
      return [];
    }

    const content = await readTextFile(cacheFile);
    const tracks = JSON.parse(content) as AudioTrack[];
    
    // 验证缓存数据格式
    if (Array.isArray(tracks) && tracks.every(t => 
      t.id && t.path && t.title && t.artist
    )) {
      console.log(`从缓存加载 ${tracks.length} 首曲目`);
      return tracks;
    } else {
      console.error('缓存数据格式无效');
      return [];
    }
  } catch (err) {
    console.error('加载缓存失败:', err);
    return [];
  }
}

// 清除缓存
export async function clearLibraryCache(): Promise<boolean> {
  try {
    const cacheFile = await getCacheFilePath();
    if (await exists(cacheFile)) {
      await invoke('remove_file', { path: cacheFile });
      console.log('缓存已清除');
      return true;
    }
    return false;
  } catch (err) {
    console.error('清除缓存失败:', err);
    return false;
  }
}