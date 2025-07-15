import { defineStore } from 'pinia'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'
import { saveLibraryCache, loadLibraryCache } from '@/utils/cache' // 导入缓存工具
import { usePlayerStore } from './player'

export interface AudioTrack {
  id: string
  path: string
  title: string
  artist: string
  album: string
  duration: number
  cover?: string,
  lastModified?: number // 新增字段用于增量更新
}

interface LibraryState {
  tracks: AudioTrack[]
  loading: boolean,
  lastScanned: number // 记录最后扫描时间
}

export const useLibraryStore = defineStore('library', {
  state: (): LibraryState => ({
    tracks: [],
    loading: false,
    lastScanned: 0
  }),

  actions: {
	 // 初始化时加载缓存
    async init() {
      this.loading = true;
      try {
        const cachedTracks = await loadLibraryCache();
        console.log('从缓存加载的曲目数量:', cachedTracks.length);  
        this.tracks = cachedTracks;
        this.lastScanned = Date.now();
         // 将缓存中的曲目添加到播放列表
        const player = usePlayerStore();
        await player.addTracks(cachedTracks);
      } catch (error) {
        console.error('初始化时加载缓存失败:', error); // 捕获并输出错误信息
      } finally {
        this.loading = false;
      }
    },

    async scanMusicDirectory() {
      try {
        this.loading = true;
        const selectedDir = await open({
          directory: true,
          multiple: false
        });

        if (!selectedDir || typeof selectedDir !== 'string') {
          console.warn('未选择有效目录');
          return;
        }

        const filePaths = await this._walkDir(selectedDir);
        const flacFiles = filePaths.filter(p => p.toLowerCase().endsWith('.flac'));
        const newTracks: AudioTrack[] = [];

        for (const filePath of flacFiles) {
          // 检查是否已存在相同路径的曲目（避免重复）
          if (!this.tracks.some(t => t.path === filePath)) {
            try {
              // 获取文件最后修改时间（用于后续增量更新）
              const stats = await invoke('get_file_metadata', { path: filePath });
              const track = await invoke<AudioTrack>('get_flac_metadata', { path: filePath });
              newTracks.push({ 
                ...track, 
                path: filePath,
                lastModified: stats.mtimeMs
              });
            } catch (err) {
              console.warn('解析失败:', filePath, err);
            }
          }
        }

        // 合并新扫描的曲目并去重
        this.tracks = [
          ...this.tracks.filter(t => !newTracks.some(nt => nt.path === t.path)),
          ...newTracks
        ];
        
        // 保存到缓存
        await saveLibraryCache(this.tracks);
        this.lastScanned = Date.now();

          // 将新扫描的曲目添加到播放列表
        const player = usePlayerStore();
        await player.addTracks(newTracks);
      } catch (e) {
        console.error('扫描目录失败:', e);
      } finally {
        this.loading = false;
      }
    },

    // 增量更新缓存（检查文件变化）
    async refreshLibrary() {
      try {
        this.loading = true;
        // 实现思路：
        // 1. 遍历现有曲目检查文件是否存在
        // 2. 检查文件最后修改时间是否有变化
        // 3. 对变化的文件重新解析元数据
        // 4. 移除已删除的文件记录
        const validTracks: AudioTrack[] = [];
        for (const track of this.tracks) {
          try {
            const exists = await invoke('file_exists', { path: track.path });
            if (exists) {
              const stats = await invoke('get_file_metadata', { path: track.path });
              if (track.lastModified !== stats.mtimeMs) {
                // 文件已修改，重新解析
                const updatedTrack = await invoke<AudioTrack>('get_flac_metadata', { path: track.path });
                validTracks.push({
                  ...updatedTrack,
                  path: track.path,
                  lastModified: stats.mtimeMs
                });
              } else {
                validTracks.push(track);
              }
            }
          } catch (err) {
            console.warn('文件检查失败:', track.path, err);
          }
        }
        this.tracks = validTracks;
        await saveLibraryCache(this.tracks);

         // 更新播放列表
        const player = usePlayerStore();
        player.playlist = validTracks;
      } finally {
        this.loading = false;
      }
    },

   async scanMusicDirectory1() {
	try {
	console.log('开始扫描音乐目录...')
	const selectedDir = await open({
	directory: true,
	multiple: false
	})
	console.log('选中的目录:', selectedDir)

	if (!selectedDir || typeof selectedDir !== 'string') {
	console.warn('未选择有效目录')
	return
	}

	this.loading = true
	const filePaths = await this._walkDir(selectedDir)
	console.log('扫描到文件数量:', filePaths.length)
	console.log('扫描到的文件列表:', filePaths)

	const flacFiles = filePaths.filter(p => p.toLowerCase().endsWith('.flac'))
	console.log('筛选出的FLAC文件:', flacFiles)

	const newTracks: AudioTrack[] = []
	for (const filePath of flacFiles) {
	try {
		console.log('解析文件:', filePath)
		const track = await invoke<AudioTrack>('get_flac_metadata', { path: filePath })
		console.log('解析结果:', track)
		if (!this.tracks.find(t => t.path === filePath)) {
		newTracks.push({ ...track, path: filePath })
		}
	} catch (err) {
		console.warn('解析失败:', filePath, err)
	}
	}

	this.tracks = [...this.tracks, ...newTracks]
	console.log('更新后的曲库:', this.tracks)

    // 将新扫描的曲目添加到播放列表
    const player = usePlayerStore();
    await player.addTracks(newTracks);
	} catch (e) {
	console.error('扫描目录失败:', e)
	} finally {
	this.loading = false
	}
	},

	async _walkDir(dir: string): Promise<string[]> {
	const result: string[] = []
	const entries = await readDir(dir, { recursive: true })

	const walk = async (entries: any[], parentPath: string) => {
	for (const entry of entries) {
	if (entry.children && entry.children.length > 0) {
		await walk(entry.children, `${parentPath}/${entry.name}`)
	} else if (entry.isFile) {
		// 拼接完整路径
		const fullPath = `${parentPath}/${entry.name}`
		console.log('发现文件:', fullPath)
		result.push(fullPath)
	}
	}
	}

	await walk(entries, dir)
	console.log('所有文件路径:', result)
	return result
	}



  }
})
