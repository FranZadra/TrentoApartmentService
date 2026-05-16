import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import PaginaAccesso from '../pages/paginaAccesso.vue'

const routes = [
	{
		path: '/',
		name: 'home',
		component: HomePage,
		meta: { title: 'TAS - Home' },
	},
	{
		path: '/accesso',
		name: 'accesso',
		component: PaginaAccesso,
		alias: ['/registrazione'],
		meta: { title: 'TAS - Accesso' },
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior() {
		return { top: 0 }
	},
})

router.afterEach((to) => {
	document.title = to.meta.title ?? 'TAS'
})

export default router
