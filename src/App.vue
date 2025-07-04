<template>
  <div class="app-container">
    <RouterView />
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import PlayerBar from '@/components/PlayerBar.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.router-view {
  flex: 1;
  overflow-y: auto;
}

</style>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  background-color: #f8f9fa;
}
</style>
