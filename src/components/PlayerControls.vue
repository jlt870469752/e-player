<template>
  <div class="player-controls">
    <button @click="openFileDialog" class="btn-open">打开FLAC文件</button>
    
    <div class="now-playing" v-if="currentTrack">
      <img :src="currentTrack.cover || 'placeholder.jpg'" class="cover" alt="专辑封面">
      <div class="track-info">
        <h3>{{ currentTrack.title }}</h3>
        <p>{{ currentTrack.artist }} - {{ currentTrack.album }}</p>
      </div>
    </div>
    
    <div class="controls">
      <button @click="prevTrack" class="btn-control">上一首</button>
      <button @click="togglePlay" class="btn-play">
        {{ isPlaying ? '暂停' : '播放' }}
      </button>
      <button @click="nextTrack" class="btn-control">下一首</button>
    </div>
    
    <div class="progress" v-if="currentTrack">
      <input type="range" min="0" max="100" v-model="progress" @change="seek" class="progress-bar">
      <div class="time">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
    
    <div class="volume">
      <span>音量:</span>
      <!-- <input type="range" min="0" max="100" v-model="volume" @change="setVolume(volume / 100)" class="volume-bar"> -->
       <input type="range"
       min="0"
       max="1"
       step="0.01"
       v-model.number="volume"
       @input="setVolume(volume)" />
    </div>
    
    <div class="playlist" v-if="playlist.length > 0">
      <h3>播放列表</h3>
      <ul>
        <li v-for="(track, index) in playlist" :key="track.id" 
            @click="playTrack(track)"
            :class="{ 'current': track.id === currentTrack?.id }">
          {{ index + 1 }}. {{ track.title }} - {{ track.artist }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlayerStore } from '../stores/player'
import { storeToRefs } from 'pinia'

const playerStore = usePlayerStore()
const {
  currentTrack,
  playlist,
  isPlaying,
  currentTime,
  duration,
  volume
} = storeToRefs(playerStore)

const progress = ref(0)
const volumeValue = ref(playerStore.volume * 100)

// 监听当前时间变化更新进度条
watch(currentTime, (newTime) => {
  if (duration.value > 0) {
    progress.value = (newTime / duration.value) * 100
  }
})

// 格式化时间 (秒 -> mm:ss)
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// 暴露播放器操作方法
const openFileDialog = () => playerStore.openFileDialog()
const playTrack = (track: any) => playerStore.playTrack(track)
const togglePlay = () => playerStore.togglePlay()
const prevTrack = () => playerStore.prevTrack()
const nextTrack = () => playerStore.nextTrack()
const seek = (event: Event) => {
  const position = parseInt((event.target as HTMLInputElement).value)
  playerStore.seek(position)
}
const setVolume = (vol: number) => playerStore.setVolume(vol)
</script>

<style scoped>
.player-controls {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.btn-open {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.now-playing {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cover {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  margin-right: 15px;
  object-fit: cover;
}

.track-info h3 {
  margin: 0;
  font-size: 18px;
}

.track-info p {
  margin: 5px 0 0;
  color: #666;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-play {
  background: #2ecc71;
  color: white;
  border: none;
  width: 80px;
  height: 40px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.btn-control {
  background: #95a5a6;
  color: white;
  border: none;
  width: 80px;
  height: 40px;
  border-radius: 5px;
  cursor: pointer;
}

.progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  margin-bottom: 5px;
}

.time {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.volume {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.volume-bar {
  flex-grow: 1;
}

.playlist {
  max-height: 300px;
  overflow-y: auto;
}

.playlist h3 {
  margin-top: 0;
}

.playlist ul {
  list-style: none;
  padding: 0;
}

.playlist li {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.playlist li:hover {
  background: #e9f7fe;
}

.playlist li.current {
  background: #d4edff;
  font-weight: bold;
}
</style>