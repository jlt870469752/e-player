<template>
  <div class="app-container">
    <aside class="sidebar">
      <h1>🎵 FLAC 播放器</h1>
      <nav>
        <router-link to="/library" class="nav-link" active-class="active">曲库</router-link>
        <router-link to="/player" class="nav-link" active-class="active">正在播放</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
  background: #f9fafb;
  color: #333;
}

.sidebar {
  width: 200px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}

.sidebar h1 {
  font-size: 20px;
  margin-bottom: 1rem;
}

.nav-link {
  display: block;
  padding: 10px 0;
  color: #ccc;
  text-decoration: none;
}

.nav-link.active,
.nav-link:hover {
  color: #fff;
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
