<template>  
    <AppLayout>
        <div class="profilo-page">
            <main class="profilo-container">
                <div class="profilo-content">
                    <h1>Gestione Profilo</h1>
                    
                    <CardProfilo />

                    <div class="verifica-identita-section">
                        <h2>Verifica Identità</h2>
                        <p>Verifica la tua identità tramite SPID o CIE per accedere a funzionalità avanzate</p>
                        <RouterLink to="/verificaIdentita" class="btn-verifica">
                            Verifica Identità
                        </RouterLink>
                    </div>
                    
                    <div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
				        {{ successMessage }}
			        </div>          
                    
                    <div class="logout-section">
                        <button class="btn-logout" @click="logout">
                            Logout
                        </button>
                    </div>
                </div>
            </main>
        </div>
    </AppLayout>
</template>        

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import CardProfilo from '@/components/cardProfilo.vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

function logout() {
    auth.logout()
    router.push('/')
}
</script>

<style scoped>
.profilo-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.profilo-container {
    flex: 1;
    padding: 2rem;
}
.logout-section {
    margin-top: 2rem;
    text-align: right;
}

.btn-logout {
    padding: 0.75rem 1.5rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-logout:hover {
    background-color: #c82333;
}
.profilo-content {
    max-width: 1000px;
    margin: 0 auto;
}

h1 {
    margin-bottom: 2rem;
    font-size: 2rem;
    color: #333;
}

.verifica-identita-section {
    margin-top: 3rem;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    text-align: center;
}

.verifica-identita-section h2 {
    margin-bottom: 1rem;
    color: #333;
}

.verifica-identita-section p {
    margin-bottom: 1.5rem;
    color: #666;
}

.btn-verifica {
    display: inline-block;
    padding: 0.75rem 2rem;
    background-color: #0066cc;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.btn-verifica:hover {
    background-color: #0052a3;
}
</style>