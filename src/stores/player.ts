import { defineStore } from 'pinia'
import { Howl } from 'howler'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'

export interface AudioTrack {
  id: string
  path: string
  title: string
  artist: string
  album: string
  duration: number
  cover?: string
}

interface PlayerState {
  currentTrack: AudioTrack | null
  playlist: AudioTrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  sound: Howl | null
  progressInterval: number | null
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    sound: null,
    progressInterval: null
  }),

  actions: {
    async openFileDialog() {
      try {
        const selected = await open({
          multiple: true,
          filters: [{ name: 'FLAC Files', extensions: ['flac'] }]
        })

        if (!selected) return

        const files = typeof selected === 'string' ? [selected] : selected

        const addedTracks: AudioTrack[] = []

        for (const filePath of files) {
          const track = await this.addTrack(filePath)
          if (track) addedTracks.push(track)
        }

        if (addedTracks.length > 0 && !this.currentTrack) {
          this.playTrack(addedTracks[0])
        }
      } catch (error) {
        console.error('Error opening file dialog:', error)
      }
    },

    async addTrack(path: string): Promise<AudioTrack | null> {
      try {
        const metadata = await invoke<AudioTrack>('get_flac_metadata', { path })

        const exists = this.playlist.some(track => track.path === path)
        if (!exists) {
          this.playlist.push(metadata)
          if (!this.currentTrack) {
            this.currentTrack = metadata
            this.duration = metadata.duration
          }
          return metadata
        }
        return null
      } catch (error) {
        console.error('Error adding track:', error)
        return null
      }
    },

    async playTrack(track: AudioTrack) {
      if (this.sound) {
        this.sound.stop()
        this.sound.unload()
      }

      if (this.progressInterval) {
        clearInterval(this.progressInterval)
        this.progressInterval = null
      }

      this.currentTrack = track
      this.currentTime = 0
      this.duration = track.duration

      try {
        // 通过 IPC 调用后端命令读取文件 base64
        const base64Data: string = await invoke('read_file_base64', { path: track.path })

        // base64 => Uint8Array
        const binaryString = atob(base64Data)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // 转成 Blob → URL
        const blob = new Blob([bytes.buffer], { type: 'audio/flac' })
        const audioUrl = URL.createObjectURL(blob)

        // ✅ 确保播放前设置音量
        this.setVolume(this.volume)

        this.sound = new Howl({
          src: [audioUrl],
          format: ['flac'],
          html5: true,
          volume: this.volume,
          onplay: () => {
            this.isPlaying = true
            this.startProgressTimer()
          },
          onpause: () => {
            this.isPlaying = false
          },
          onend: () => {
            this.isPlaying = false
            this.nextTrack()
          },
          onloaderror: (_, err) => {
            console.error('Load error:', err)
          },
          onplayerror: (_, err) => {
            console.error('Play error:', err)
          }
        })

        this.sound.play()
      } catch (error) {
        console.error('Error creating player:', error)
      }
    },

    togglePlay() {
      if (!this.sound) return
      if (this.isPlaying) {
        this.sound.pause()
      } else {
        this.sound.play()
      }
    },

    nextTrack() {
      if (!this.currentTrack || this.playlist.length === 0) return
      const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack!.id)
      const nextIndex = (currentIndex + 1) % this.playlist.length
      this.playTrack(this.playlist[nextIndex])
    },

    prevTrack() {
      if (!this.currentTrack || this.playlist.length === 0) return
      const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack!.id)
      const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length
      this.playTrack(this.playlist[prevIndex])
    },

    seek(position: number) {
      if (!this.sound || !this.currentTrack) return
      const seconds = (position / 100) * this.duration
      this.sound.seek(seconds)
      this.currentTime = seconds
    },

    // ✅ 修复音量设置问题（防止播放时没声音）
    setVolume(volume: number) {
      this.volume = volume
      if (this.sound) {
    try {
      this.sound.volume(volume)

      // ✅ 强制对 HTML5 audio 元素设置音量
      const soundId = this.sound._sounds?.[0]?._id
      const audioNode = this.sound._sounds?.[0]?._node as HTMLAudioElement | null

      if (audioNode) {
        audioNode.volume = volume
      }
    } catch (e) {
      console.warn('Failed to set volume:', e)
    }
  }
    },
       setVolume1(volume: number) {
      if (this.volume === volume) return // 没变就跳过

      this.volume = volume

      if (this.sound) {
        try {
          this.sound.volume(volume)
        } catch (e) {
          console.warn('Howl volume setting failed, fallback to refresh', e)
        }
      }
    },

    startProgressTimer() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval)
      }
      this.progressInterval = setInterval(() => {
        if (this.sound && this.sound.playing()) {
          this.currentTime = this.sound.seek() as number
        }
      }, 1000)
    }
  }
})
