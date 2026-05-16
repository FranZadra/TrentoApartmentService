import { createRouter, createWebHistory } from 'vue-router'

// Importazione lazy delle pagine: il bundle viene caricato solo quando serve
import HomePage from '@/pages/HomePage.vue'
import AnnunciPage from '@/pages/AnnunciPage.vue'
import MansioniPage from '@/pages/MansioniPage.vue'
import GuastiPage from '@/pages/GuastiPage.vue'
import PaginaAccesso from '../pages/paginaAccesso.vue'
import PaginaProfilo from '../pages/paginaProfilo.vue'

// AnnuncioDetail caricato in lazy load (pagina pesante con mappa e galleria)
const AnnuncioDetail = () => import('@/pages/AnnuncioDetail.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    // Lista degli annunci attivi + mappa interattiva (US9)
    path: '/annunci',
    name: 'annunci',
    component: AnnunciPage,
  },
  {
    // Dettaglio singolo annuncio — :id è il MongoDB ObjectId (US9, TC30-33)
    path: '/annunci/:id',
    name: 'annuncio-detail',
    component: AnnuncioDetail,
  },
  {
    path: '/mansioni',
    name: 'mansioni',
    component: MansioniPage,
  },
  {
    path: '/guasti',
    name: 'guasti',
    component: GuastiPage,
  },
	{
		path: '/accesso',
		name: 'accesso',
		component: PaginaAccesso,
		alias: ['/registrazione'],
		meta: { title: 'TAS - Accesso' },
	},
	{
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
