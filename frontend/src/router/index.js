import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
// View per gestione amministratore
const AdminApartments = () => import('../pages/AdminApartments.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AdminApartments,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../pages/AboutView.vue'),
    },
    {
      path: '/admin/appartamenti',
      name: 'admin-appartamenti',
      component: AdminApartments,
    },
    {
      path: '/annunci',
      name: 'annunci',
      component: AdminApartments,
    },
    {
      path: '/signin',
      name: 'signin',
      component: AdminApartments,
    },
  ],
})

export default router
