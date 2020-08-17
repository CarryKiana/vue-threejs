import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'preview',
    redirect: '/home',
    component: () => import('@/views/preview')
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/panorama',
    name: 'Panorama',
    component: () => import('@/views/Panorama')
  }
]

const router = new VueRouter({
  routes
})

export default router
