import { writable } from 'svelte/store';
import { defineStore } from 'pinia';

// Stato utente condiviso usato da più parti dell'interfaccia.
// Mantiene i dati essenziali del profilo in una forma semplice da leggere e aggiornare.
function createUserStore() {
    const { subscribe, set, update } = writable({
        nome: '',
        cognome: '',
        email: '',
        fotoProfilo: '',
        ruolo: ''
    });

    return {
        subscribe,
        setUser: (user) => set(user),
        updateUser: (updates) => update(current => ({ ...current, ...updates })),
        clearUser: () => set({
            nome: '',
            cognome: '',
            email: '',
            fotoProfilo: '',
            ruolo: ''
        })
    };
}

export const userStore = createUserStore();
export const useUserStore = defineStore('user', {
    state: () => ({
        nome: '',
        cognome: '',
        email: '',
        fotoProfilo: '',
        ruolo: ''
    }),
    actions: {
        setUser(user) {
            this.$patch(user);
        },
        updateUser(updates) {
            this.$patch(updates);
        },
        clearUser() {
            this.$reset();
        }
    }
});