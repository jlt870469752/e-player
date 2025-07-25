<template>
  <div class="library-view">
    <h1>🎵 曲库</h1>

    <div v-if="library.loading" class="loading">正在扫描目录...</div>

    <div v-if="library.tracks.length === 0 && !library.loading" class="empty">
      暂无音乐，请点击“添加曲库”
    </div>

    <ul class="track-list">
      <li
        v-for="track in library.tracks"
        :key="track.id"
        class="track-item"
        :class="{ playing: track.id === player.currentTrack?.id }"
        @click="play(track)"
      >
        <img :src="track.cover" alt="封面" class="track-cover" />
        <div class="track-info">
          <div class="title">{{ track.title }}</div>
          <div class="artist">{{ track.artist }} - {{ track.album }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from "@/stores/library";
import { usePlayerStore } from "@/stores/player";

const library = useLibraryStore();
const player = usePlayerStore();

const play = (track: AudioTrack) => {
  player.playTrack(track);
};

type AudioTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  path: string;
  duration: number;
};
</script>

<style scoped>
.library-view {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.track-item:hover {
  background-color: #f5f5f5;
}

.track-item.playing {
  background-color: #e0f7fa;
}

.track-cover {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  border-radius: 4px;
  object-fit: cover;
}

.track-info {
  flex: 1;
}

.title {
  font-weight: bold;
}

.artist {
  font-size: 0.9em;
  color: #666;
}
</style>
