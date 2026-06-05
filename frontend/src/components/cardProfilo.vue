
<template>
    <div class="profile-card">
        <div class="card-content">
            <div class="profile-image">
                <img :src="profileImage" alt="Profile" class="avatar" />
            </div>
            <div class="profile-info">
                <h2 class="user-name">{{ user?.nome ?? '-' }} {{ user?.cognome ?? '' }}</h2>
                <p class="user-email">{{ user?.email ?? '-' }}</p>
                <p class="user-role">{{ user?.ruolo ?? '-' }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const user = computed(() => auth.user)

const profileImage = computed(() => {
    // Prova a usare user.foto, user.fotoProfilo o fallback
    const u = user.value
    if (!u) {
        const text = encodeURIComponent('--')
        return `https://placehold.co/400?text=${text}&font=poppins`
    }
    const initials = ((u.nome?.trim()[0] || '') + (u.cognome?.trim()[0] || '')).toUpperCase() || '--'
    const text = encodeURIComponent(initials)
    return u.foto || u.fotoProfilo || u.avatarUrl || `https://placehold.co/400?text=${text}&font=poppins`
    })
</script>

<style scoped>
.profile-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.profile-image {
    flex-shrink: 0;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.profile-info {
    flex: 1;
}

.user-name {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
}

.user-email,
.user-role {
    margin: 4px 0;
    color: #666;
    font-size: 14px;
}
</style>