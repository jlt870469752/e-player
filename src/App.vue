<template>
  <div class="app">
    <h1>FLAC 音乐播放器</h1>
    <PlayerControls />
  </div>
</template>

<script setup lang="ts">
import PlayerControls from './components/PlayerControls.vue'
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background: #f0f2f5;
  margin: 0;
  padding: 20px;
  color: #333;
}

.app {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
}
</style>