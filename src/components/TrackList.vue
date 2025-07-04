<template>
  <div class="track-list">
    <table>
      <thead>
        <tr>
          <th>标题</th>
          <th>艺术家</th>
          <th>专辑</th>
          <th>时长</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="track in tracks" 
          :key="track.id" 
          @click="$emit('select', track)" 
          :class="['track-row', selectedTrackId === track.id ? 'selected' : '']"
        >
          <td>{{ track.title }}</td>
          <td>{{ track.artist }}</td>
          <td>{{ track.album }}</td>
          <td>{{ formatDuration(track.duration) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, toRefs, watch } from 'vue'
import type { AudioTrack } from '@/stores/library'

const props = defineProps<{
  tracks: AudioTrack[],
  selectedTrackId?: string | null
}>()

const emit = defineEmits<{
  (e: 'select', track: AudioTrack): void
}>()

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const { selectedTrackId } = toRefs(props)
</script>

<style scoped>
.track-list {
  margin-top: 20px;
  overflow-x: auto;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #2c3e50;
  color: #ecf0f1;
}

th, td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.track-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.track-row:hover {
  background-color: #f0f8ff;
}

.selected {
  background-color: #d0eaff !important;
  font-weight: 600;
}
</style>
