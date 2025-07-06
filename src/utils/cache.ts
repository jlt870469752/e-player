import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { AudioTrack } from '@/stores/library';
import { appDataDir } from '@tauri-apps/api/path';
import { join, dirname } from '@tauri-apps/api/path'; // 新增 dirname 导入
import { invoke } from '@tauri-apps/api/core'; // 确保导入 invoke

// 获取缓存文件路径（使用 join 确保跨平台路径正确）
async function getCacheFilePath(): Promise<string> {
  const appData = await appDataDir();
  return join(appData, 'flac-player', 'library.json');
}

// 确保缓存目录存在（修正版）
async function ensureCacheDir() {
  try {
    const cacheFile = await getCacheFilePath();
    const dir = await dirname(cacheFile); // 使用 Tauri 提供的 dirname 解析目录
    console.log('需要确保存在的缓存目录:', dir);

    if (!(await exists(dir))) {
      console.log('目录不存在，尝试创建:', dir);
      // 调用后端的 create_directory 命令递归创建目录
      await invoke('create_directory', { path: dir });
      console.log('目录创建成功:', dir);
    } else {
      console.log('目录已存在:', dir);
    }
  } catch (error) {
    console.error('确保缓存目录存在失败:', error);
    throw error; // 向上传递错误，避免后续写入失败
  }
}

// 保存曲库到缓存（保持现有逻辑）
export async function saveLibraryCache(tracks: AudioTrack[]): Promise<boolean> {
  try {
    await ensureCacheDir();
    const cacheFile = await getCacheFilePath();
    await writeTextFile(
      cacheFile,
      JSON.stringify(tracks, null, 2)
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