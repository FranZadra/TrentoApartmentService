import { createRouter, createWebHistory } from 'vue-router'

// Importazione lazy delle pagine: il bundle viene caricato solo quando serve
import HomePage from '@/pages/HomePage.vue'
import AnnunciPage from '@/pages/AnnunciPage.vue'
import MansioniPage from '@/pages/MansioniPage.vue'
import GuastiPage from '@/pages/GuastiPage.vue'
import PaginaGestioneInterna from '@/pages/paginaGestioneInterna.vue'
import PaginaAccesso from '../pages/paginaAccesso.vue'
import PaginaProfilo from '../pages/paginaProfilo.vue'
import ResetPassword from '@/pages/ResetPassword.vue'

// AnnuncioDetail caricato in lazy load (pagina pesante con mappa e galleria)
const AnnuncioDetail = () => import('@/pages/AnnuncioDetail.vue')
const AdminApartments = () => import('../pages/AdminApartments.vue')

// Guardia di navigazione: controlla che l'utente abbia un token JWT in localStorage.
// Se non ce l'ha, lo reindirizza alla pagina di login (TC51).
function richiedeAutenticazione(_to, _from, next) {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token')
  if (!token) {
    next({ name: 'accesso' })
  } else {
    next()
  }
}
const routes = [
  {
    // Pagina iniziale con presentazione del servizio.
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    // Lista degli annunci attivi + mappa interattiva (US9).
    path: '/annunci',
    name: 'annunci',
    component: AnnunciPage,
  },   
  {
      // Pagina gestione immobili: accessibile solo agli amministratori autenticati.
      path: '/admin/appartamenti',
      name: 'admin-appartamenti',
      component: AdminApartments,
      beforeEnter: richiedeAutenticazione,
  },
  {
    // Dettaglio singolo annuncio — :id è il MongoDB ObjectId (US9, TC30-33)
    path: '/annunci/:id',
    name: 'annuncio-detail',
    component: AnnuncioDetail,
  },
  {
    // Pagine di servizio mostrate in modo coerente con il resto del sito.
    path: '/mansioni',
    name: 'mansioni',
    component: MansioniPage,
  },
  {
    path: '/gestione-interna',
    name: 'gestione-interna',
    component: PaginaGestioneInterna,
    beforeEnter: richiedeAutenticazione,
    meta: { title: 'TAS - Gestione interna' },
  },
  {
    path: '/guasti',
    name: 'guasti',
    component: GuastiPage,
  },
	{
    // Pagina di accesso e registrazione, con alias per il vecchio percorso.
		path: '/accesso',
		name: 'accesso',
		component: PaginaAccesso,
		alias: ['/registrazione'],
		meta: { title: 'TAS - Accesso' },
	},
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPassword,
    meta: { title: 'TAS - Reset password' },
  },
	{
    // Profilo utente con informazioni salvate lato client.
		path: '/profilo',
		name: 'profilo',
		component: PaginaProfilo,
		meta: { title: 'TAS - Profilo' },
	}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Torna sempre in cima alla pagina quando si naviga
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
