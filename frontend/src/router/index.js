import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import AnnunciPage from '@/pages/AnnunciPage.vue'
import MansioniPage from '@/pages/MansioniPage.vue'
import GuastiPage from '@/pages/GuastiPage.vue'
import SignInPage from '@/pages/SignInPage.vue'

const routes = [
	{
		path: '/',
		name: 'home',
		component: HomePage,
	},
	{
		path: '/annunci',
		name: 'annunci',
		component: AnnunciPage,
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
		path: '/signin',
		name: 'signin',
		component: SignInPage,
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior() {
		return { top: 0 }
	},
})

export default router
