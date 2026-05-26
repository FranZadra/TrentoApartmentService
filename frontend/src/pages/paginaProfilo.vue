<template>  
    <AppLayout>
        <div class="profilo-page">
            <main class="profilo-container">
                <div class="profilo-content">
                    <h1>Gestione Profilo</h1>
                    
                    <CardProfilo />

                    <div class="verifica-identita-section">
                        <h2>Verifica Identità</h2>
                        <p>Verifica la tua identità per accedere a funzionalità avanzate</p>
                        <button 
                            v-if="auth.user?.ruolo === 'utente base'" 
                            class="btn-verifica" 
                            @click="verificaIdentita"
                            :disabled="isLoading"
                        >
                            {{ isLoading ? 'Elaborazione...' : 'Verifica Identità' }}
                        </button>
                        <div v-else class="status-verificato">
                            ✓ Il tuo account è già verificato o ha uno status speciale
                        </div>
                    </div>
                    
                    <br><br>

                    <!-- Messaggi -->
                    <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {{ errorMessage }}
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { verificaIdentitaUser } from '@/services/authService'
import { ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

async function verificaIdentita() {
    errorMessage.value = ''
    successMessage.value = ''
    isLoading.value = true

    try {
        const result = await verificaIdentitaUser(auth.token)
        
        if (result.success) {
            // Aggiorna il ruolo dell'utente nello store
            auth.updateUserRole(result.data.utente.ruolo)
            successMessage.value = 'Verifica identità effettuata con successo! Il tuo account è ora verificato.'
            
            // Nascondi il messaggio dopo 3 secondi
            setTimeout(() => {
                successMessage.value = ''
            }, 3000)
        } else {
            errorMessage.value = result.error || 'Errore durante la verifica identità'
        }
    } catch (error) {
        errorMessage.value = 'Errore durante la verifica identità'
        console.error(error)
    } finally {
        isLoading.value = false
    }
}

function logout() {
    try {
        auth.logout()
        successMessage.value = 'Logout effettuato con successo'
        setTimeout(() => {
            router.push('/')
        }, 1000)
    } catch (error) {
        errorMessage.value = 'Errore durante il logout'
    }
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

.btn-logout:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
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
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-verifica:hover:not(:disabled) {
    background-color: #0052a3;
}

.btn-verifica:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}

.status-verificato {
    display: inline-block;
    padding: 0.75rem 2rem;
    background-color: #28a745;
    color: white;
    border-radius: 4px;
    font-weight: 500;
}
</style>