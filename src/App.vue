<template>
  <div class="app-container">
    <TopMenu @scan="scanMusicDirectory" />
    <router-view />
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import TopMenu from '@/components/TopMenu.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import { useLibraryStore } from '@/stores/library'
import { onMounted } from 'vue';

const library = useLibraryStore()


onMounted(async () => {
  await library.init();
});

function scanMusicDirectory() {
  library.scanMusicDirectory()
}
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

router-view {
  flex: 1;
  overflow-y: auto;
}
</style>
