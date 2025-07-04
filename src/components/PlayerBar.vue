<template>
  <div class="player-bar">
    <!-- 左侧 -->
    <div class="left">
      <img :src="track?.cover || defaultCover" class="cover" />
      <div class="meta">
        <div class="title">{{ track?.title || '未播放' }}</div>
        <div class="artist">{{ track?.artist || '未知艺术家' }}</div>
      </div>
    </div>

    <!-- 中间 -->
    <div class="center">
      <div class="controls">
        <img src="@/assets/icons/prev.svg" class="icon" @click="prev" title="上一首" />
        <img
          :src="isPlaying ? pauseIcon : playIcon"
          class="icon play-icon"
          @click="toggle"
          title="播放/暂停"
        />
        <img src="@/assets/icons/next.svg" class="icon" @click="next" title="下一首" />
      </div>
      <div class="progress-row">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          min="0"
          max="100"
          v-model="progress"
          @change="seek"
          class="progress"
        />
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="right">
      <img src="@/assets/icons/volume.svg" class="icon" />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="volume"
        @input="changeVolume"
        class="volume"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

// 状态
const player = usePlayerStore()
const track = computed(() => player.currentTrack)
const isPlaying = computed(() => player.isPlaying)
const currentTime = computed(() => player.currentTime)
const duration = computed(() => player.duration)
const volume = ref(player.volume)
const progress = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0
)

const defaultCover = 'https://via.placeholder.com/60?text=♪'
const playIcon = new URL('@/assets/icons/play.svg', import.meta.url).href
const pauseIcon = new URL('@/assets/icons/pause.svg', import.meta.url).href

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
function toggle() {
  player.togglePlay()
}
function next() {
  player.nextTrack()
}
function prev() {
  player.prevTrack()
}
function seek(event: Event) {
  const val = (event.target as HTMLInputElement).valueAsNumber
  player.seek(val)
}
function changeVolume(event: Event) {
  const val = (event.target as HTMLInputElement).valueAsNumber
  player.setVolume(val)
}
</script>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  filter: brightness(0) invert(1);
  transition: transform 0.1s ease;
}
.icon:hover {
  transform: scale(1.1);
}
.play-icon {
  width: 32px;
  height: 32px;
}

.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(30, 30, 30, 0.95);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 999;
  font-size: 14px;
}

/* 左侧 */
.left {
  display: flex;
  align-items: center;
  width: 240px;
}
.cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
  object-fit: cover;
}
.meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.meta .title {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta .artist {
  font-size: 12px;
  color: #bbb;
}

/* 中间 */
.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.controls {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 6px;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.progress {
  flex: 1;
  accent-color: #1db954;
}
.time {
  width: 40px;
  text-align: center;
  color: #aaa;
  font-family: monospace;
}

/* 右侧 */
.right {
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.volume {
  width: 80px;
  accent-color: #1db954;
}
</style>
