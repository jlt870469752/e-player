<template>
  <nav class="top-menu">
   <button class="scan-button" @click="scan" aria-label="添加曲库">
  <!-- SVG 直接内联 -->
  <svg
    width="20" height="20" viewBox="0 0 24 24"
    fill="none" xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    style="vertical-align: middle; margin-right: 6px;"
  >
    <path d="M3 7h5l2 3h11v9H3z" fill="none"/>
    <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v2" fill="none"/>
    <line x1="12" y1="12" x2="12" y2="18" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
  扫描目录
</button>

  </nav>
</template>

<style scoped>
.top-menu {
  height: 48px;
  background-color: #1e1e2f; /* 深色背景，与播放器一致 */
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 5px rgb(0 0 0 / 0.2);
  user-select: none;
  z-index: 10;
}

.scan-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3a3a5c; /* 深蓝色按钮背景 */
  border: none;
  border-radius: 20px;
  padding: 6px 18px;
  font-weight: 600;
  color: #f0f0f0;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.scan-button:hover {
  background-color: #57577f;
}

.icon {
  width: 18px;
  height: 18px;
  filter: invert(90%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(90%);
}
</style>
