<template>
  <div class="player-controls">
    <div class="current-track" v-if="player.currentTrack">
      <img :src="player.currentTrack.cover || defaultCover" alt="Cover" class="cover" />
      <div class="track-info">
        <div class="title">{{ player.currentTrack.title }}</div>
        <div class="artist">{{ player.currentTrack.artist }}</div>
      </div>
    </div>

    <div class="controls">
      <button @click="player.prevTrack" title="上一首" class="btn">
        ◀️
      </button>

      <button @click="player.togglePlay" class="btn play-btn" :title="player.isPlaying ? '暂停' : '播放'">
        {{ player.isPlaying ? '⏸' : '▶️' }}
      </button>

      <button @click="player.nextTrack" title="下一首" class="btn">
        ▶️
      </button>
    </div>

    <div class="progress-bar" @click="seek($event)">
      <div class="progress" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div class="time-info">
      <span>{{ formatTime(player.currentTime) }}</span>
      <span>{{ formatTime(player.duration) }}</span>
    </div>

    <div class="volume-control">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model.number="player.volume"
        @input="player.setVolume(player.volume)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { computed } from 'vue'

const player = usePlayerStore()
const defaultCover = 'https://via.placeholder.com/80?text=No+Cover'

const progressPercent = computed(() => {
  if (player.duration === 0) return 0
  return (player.currentTime / player.duration) * 100
})

function seek(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const ratio = clickX / rect.width
  player.seek(ratio * 100)
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-controls {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.1);
  user-select: none;
}

.current-track {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.track-info {
  flex-grow: 1;
  overflow: hidden;
}

.title {
  font-weight: 700;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  color: #666;
  margin-top: 3px;
  font-size: 0.9rem;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.btn {
  font-size: 1.5rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 6px 10px;
  transition: background-color 0.2s ease;
  border-radius: 4px;
}

.btn:hover {
  background-color: #eee;
}

.play-btn {
  font-size: 2rem;
  color: #2c3e50;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ddd;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  margin-bottom: 10px;
}

.progress {
  background: #2c3e50;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 15px;
}

.volume-control input[type='range'] {
  width: 100%;
  cursor: pointer;
}
</style>
