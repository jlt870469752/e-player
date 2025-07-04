import { createRouter, createWebHistory } from 'vue-router'
import Library from '@/views/Library.vue'
import Player from '@/views/Player.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/library' },
    { path: '/library', component: Library },
    { path: '/player', component: Player }
  ]
})
