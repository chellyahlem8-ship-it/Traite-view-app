<template>
  <!-- Ce composant redirige vers /login où la transition forgot est intégrée -->
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
// La page forgot password est maintenant intégrée dans LoginView.vue
// avec la transition animée. On redirige simplement.
router.replace('/login')
</script>