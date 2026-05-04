<!-- APRÈS -->
<template>
  <RouterView />
  <ChatBot v-if="isAuthenticated" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChatBot from '@/components/ChatBot.vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)
</script>