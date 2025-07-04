import { createRouter, createWebHistory } from 'vue-router'
import Library from '@/views/Library.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/library' },
    { path: '/library', component: Library }
  ]
})
