<template>
  <div class="library-view">
    <h2 class="title">曲库</h2>
    <button @click="scan" :disabled="library.loading" class="scan-btn">
      {{ library.loading ? '扫描中...' : '扫描目录' }}
    </button>

    <TrackList 
      :tracks="library.tracks" 
      :selectedTrackId="currentTrack?.id ?? null"
      @select="onTrackSelect" 
    />

    <PlayerControls />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import type { AudioTrack } from '@/stores/library'
import TrackList from '@/components/TrackList.vue'
import PlayerControls from '@/components/PlayerControls.vue'

const library = useLibraryStore()
const player = usePlayerStore()
const currentTrack = ref<AudioTrack | null>(null)

async function scan() {
  await library.scanMusicDirectory()
}

// 当选中曲目时，通知播放器播放
function onTrackSelect(track: AudioTrack) {
  currentTrack.value = track
  player.playTrack(track)
}

watch(() => player.currentTrack, val => {
  currentTrack.value = val
})
</script>

<style scoped>
.library-view {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgb(0 0 0 / 0.05);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #34495e;
  text-align: center;
}

.scan-btn {
  background-color: #3498db;
  color: white;
  padding: 8px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: background-color 0.3s ease;
}


.scan-btn:disabled {
  background-color: #a0c4db;
  cursor: not-allowed;
}

.scan-btn:not(:disabled):hover {
  background-color: #2980b9;
}
</style>
