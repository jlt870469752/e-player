<template>
  <div class="library-view">
    <div class="header">
      <h1>🎵 曲库</h1>
      <button class="scan-button" @click="scan">📁 扫描目录</button>
    </div>

    <div v-if="library.loading" class="loading">正在扫描目录...</div>

    <div v-if="library.tracks.length === 0 && !library.loading" class="empty">
      暂无音乐，请点击“扫描目录”
    </div>

    <ul class="track-list">
      <li
        v-for="track in library.tracks"
        :key="track.id"
        class="track-item"
        @click="play(track)"
      >
        <div class="title">{{ track.title }}</div>
        <div class="artist">{{ track.artist }} - {{ track.album }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'

const library = useLibraryStore()
const player = usePlayerStore()

const scan = () => {
  library.scanMusicDirectory()
}

const play = (track: AudioTrack) => {
  player.playTrack(track)
}
</script>

<style scoped>
.library-view {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scan-button {
  padding: 6px 16px;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.scan-button:hover {
  background-color: #0056b3;
}

.loading,
.empty {
  margin-top: 20px;
  color: #666;
  text-align: center;
}

.track-list {
  margin-top: 16px;
  padding: 0;
  list-style: none;
}

.track-item {
  padding: 10px 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.track-item:hover {
  background-color: #f5f5f5;
}

.title {
  font-weight: bold;
}

.artist {
  font-size: 0.9em;
  color: #666;
}
</style>
