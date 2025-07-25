<template>
  <div class="player-bar">
    <!-- 左侧歌曲信息 -->
    <div class="left">
      <img
        :src="track?.cover || defaultCover"
        class="cover"
        :class="{ playing: isPlaying }"
      />
      <div class="meta">
        <div class="title" @click="showTrackDetail">
          {{ track?.title || "未播放" }}
        </div>
        <div class="artist">{{ track?.artist || "未知艺术家" }}</div>
      </div>
      <img
        src="@/assets/icons/playlist.svg"
        class="icon playlist-icon"
        @click="togglePlaylist"
        title="播放列表"
      />
    </div>

    <!-- 中间控制区域 -->
    <div class="center">
      <div class="controls">
        <img
          src="@/assets/icons/prev.svg"
          class="icon"
          @click="prev"
          title="上一首"
        />
        <img
          :src="isPlaying ? pauseIcon : playIcon"
          class="icon play-icon"
          @click="toggle"
          title="播放/暂停"
          :class="{ pulse: isPlaying }"
        />
        <img
          src="@/assets/icons/next.svg"
          class="icon"
          @click="next"
          title="下一首"
        />
      </div>
      <div class="progress-row">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div
          class="progress-container"
          @click="handleProgressClick"
          @mousedown="startDragging"
          @mousemove="isDragging ? handleDrag : showHoverTime"
          @mouseup="stopDragging"
          @mouseleave="clearHoverTime"
          :class="{ buffering: isBuffering }"
        >
          <div class="progress-bg"></div>
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
          <div
            class="progress-handle"
            :style="{
              left: (isDragging ? dragPercent : progressPercent) + '%',
            }"
          ></div>
          <div
            class="progress-tooltip"
            v-if="hoverTime !== null"
            :style="{ left: hoverPercent + '%' }"
          >
            {{ formatTime(hoverTime) }}
          </div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 右侧音量控制 -->
    <div class="right">
      <img
        :src="volumeIcon"
        class="icon"
        @click="toggleMute"
        :title="isMuted ? '取消静音' : '静音'"
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="volume"
        @input="changeVolume"
        class="volume"
        :class="{ muted: isMuted }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { usePlayerStore } from "@/stores/player";
import { listen } from "@tauri-apps/api/event";

// 状态管理
const player = usePlayerStore();
const track = computed(() => player.currentTrack);
const isPlaying = computed(() => player.isPlaying);
const currentTime = computed(() => player.currentTime);
const duration = computed(() => player.duration);
const volume = ref(player.volume);
const isBuffering = ref(false);

// 拖拽相关状态
const isDragging = ref(false);
const dragPercent = ref(0);
const dragTime = ref(0);

// 鼠标悬停显示时间
const hoverTime = ref<number | null>(null);
const hoverPercent = ref(0);

// 静态资源
const defaultCover = "https://via.placeholder.com/60?text=♪";
const playIcon = new URL("@/assets/icons/play.svg", import.meta.url).href;
const pauseIcon = new URL("@/assets/icons/pause.svg", import.meta.url).href;
const volumeHighIcon = new URL("@/assets/icons/volume.svg", import.meta.url)
  .href;
const volumeLowIcon = new URL("@/assets/icons/volume-low.svg", import.meta.url)
  .href;
const volumeMuteIcon = new URL("@/assets/icons/mute.svg", import.meta.url).href;

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const isMuted = computed({
  get: () => player.volume === 0,
  set: (value) => {
    if (value) {
      player.setVolume(0);
    } else {
      player.setVolume(0.8); // 恢复默认音量
    }
  },
});

const volumeIcon = computed(() => {
  if (isMuted.value) {
    return volumeMuteIcon;
  } else if (volume.value < 0.5) {
    return volumeLowIcon;
  } else {
    return volumeHighIcon;
  }
});

// 时间格式化
function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// 播放控制
function toggle() {
  player.togglePlay();
}

function next() {
  player.nextTrack();
}

function prev() {
  player.prevTrack();
}

// 进度条控制
function handleProgressClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const percent = ((e.clientX - rect.left) / rect.width) * 100;
  player.seek(percent);
}

function startDragging(e: MouseEvent) {
  isDragging.value = true;
  handleDrag(e);
}

function handleDrag(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const percent = Math.max(
    0,
    Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
  );
  dragPercent.value = percent;
  dragTime.value = (percent / 100) * duration.value;
}

function stopDragging() {
  if (isDragging.value) {
    player.seek((dragPercent.value / 100) * duration.value);
    isDragging.value = false;
  }
}

function showHoverTime(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const percent = Math.max(
    0,
    Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
  );
  hoverPercent.value = percent;
  hoverTime.value = (percent / 100) * duration.value;
}

function clearHoverTime() {
  hoverTime.value = null;
}

// 音量控制
function changeVolume() {
  player.setVolume(volume.value);
}

function toggleMute() {
  isMuted.value = !isMuted.value;
}

// 额外功能
function showTrackDetail() {
  // 可以在这里实现点击歌曲标题显示详情的逻辑
  console.log("显示歌曲详情:", track.value);
}

function togglePlaylist() {
  // 可以在这里实现播放列表的显示/隐藏逻辑
  console.log("切换播放列表显示状态");
}

// 全局快捷键支持
onMounted(() => {
  const unlisten = listen("global-shortcut", (event) => {
    switch (event.payload) {
      case "MediaPlayPause":
        toggle();
        break;
      case "MediaNextTrack":
        next();
        break;
      case "MediaPreviousTrack":
        prev();
        break;
      case "VolumeUp":
        volume.value = Math.min(1, volume.value + 0.1);
        changeVolume();
        break;
      case "VolumeDown":
        volume.value = Math.max(0, volume.value - 0.1);
        changeVolume();
        break;
    }
  });

  // 监听音量变化（从其他地方修改音量时同步）
  const volumeUnlisten = player.$subscribe((mutation: any) => {
    if (
      mutation.storeId === "player" &&
      mutation.type === "set" &&
      mutation.events?.key === "volume"
    ) {
      volume.value = player.volume;
    }
  });

  return () => {
    unlisten.then((u) => u());
    volumeUnlisten();
  };
});
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

.play-icon.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
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
  transition: transform 0.3s ease;
}

.cover.playing {
  animation: rotate 10s linear infinite;
}

.cover.loading {
  animation: spin 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 10px;
}

.meta .title {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.meta .title:hover {
  text-decoration: underline;
}

.meta .artist {
  font-size: 12px;
  color: #bbb;
}

.playlist-icon {
  margin-left: auto;
  opacity: 0.8;
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

.progress-container {
  flex: 1;
  height: 8px;
  position: relative;
  cursor: pointer;
}

.progress-bg {
  width: 100%;
  height: 100%;
  background: #444;
  border-radius: 4px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #1db954;
  border-radius: 4px;
  transition: width 0.1s ease;
}

.progress-container.buffering .progress-fill {
  background: linear-gradient(90deg, #1db954 25%, #3ddb7a 50%, #1db954 75%);
  background-size: 200% 100%;
  animation: buffer 1.5s infinite;
}

@keyframes buffer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #1db954;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-container:hover .progress-handle {
  opacity: 1;
}

.progress-tooltip {
  position: absolute;
  bottom: 24px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
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
  transition: opacity 0.2s ease;
}

.volume.muted {
  opacity: 0.5;
}
</style>