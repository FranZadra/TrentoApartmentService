import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'

// Pagina gestione appartamenti (caricata in lazy per non appesantire il bundle iniziale)
const AdminApartments = () => import('../pages/AdminApartments.vue')

// Guardia di navigazione: controlla che l'utente abbia un token JWT in localStorage.
// Se non ce l'ha, lo reindirizza alla pagina di login (TC51).
function richiedeAutenticazione(_to, _from, next) {
  const token = localStorage.getItem('token')
  if (!token) {
    next({ name: 'signin' })
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      // Pagina gestione immobili: accessibile solo agli amministratori autenticati
      path: '/admin/appartamenti',
      name: 'admin-appartamenti',
      component: AdminApartments,
      beforeEnter: richiedeAutenticazione,
    },
    {
      // Pagina di login: da implementare (placeholder per ora)
      path: '/signin',
      name: 'signin',
      component: HomeView,
    },
    {
      // Placeholder per la route annunci (implementata in altri branch)
      path: '/annunci',
      name: 'annunci',
      component: HomeView,
    },
  ],
})

export default router
