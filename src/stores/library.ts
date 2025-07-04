import { defineStore } from 'pinia'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

export interface AudioTrack {
  id: string
  path: string
  title: string
  artist: string
  album: string
  duration: number
  cover?: string
}

interface LibraryState {
  tracks: AudioTrack[]
  loading: boolean
}

export const useLibraryStore = defineStore('library', {
  state: (): LibraryState => ({
    tracks: [],
    loading: false
  }),

  actions: {
   async scanMusicDirectory() {
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
