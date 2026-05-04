<!-- App.vue -->
<!-- Hydrate l'utilisateur connecté au rechargement de la page -->
<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

onMounted(async () => {
  // Si un token existe mais que l'user n'est pas chargé (rechargement)
  // → on récupère le profil depuis /me
  if (auth.token && !auth.user) {
    await auth.fetchCurrentUser(BASE_URL)
  }
})
</script>