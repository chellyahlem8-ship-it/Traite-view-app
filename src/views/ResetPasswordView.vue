<template>
  <div class="auth-layout">
    <div class="left-panel">
      <div class="left-logo">
        <TraityLogo :size="36" show-text />
      </div>
      <!-- Image changée ici -->
      <img src="@/assets/rei.png" alt="avatar" class="avatar-img" style="width:200px; margin-top:80px; mix-blend-mode:multiply;" />
    </div>

    <div class="right-panel">
      <div class="form-logo-wrap">
        <TraityLogo :size="28" show-text />
      </div>
      <h1 class="form-title">Nouveau mot de passe</h1>
      <p class="form-sub">Choisissez un nouveau mot de passe sécurisé.</p>

      <div v-if="successMsg" class="success-alert">✅ {{ successMsg }}</div>

      <form v-else class="auth-form" @submit.prevent="handleReset">
        <div class="field-group">
          <label>Nouveau mot de passe</label>
          <input v-model="newPassword" type="password" placeholder="••••••••" required minlength="8" />
        </div>
        <div class="field-group">
          <label>Confirmer le mot de passe</label>
          <input v-model="confirmPassword" type="password" placeholder="••••••••" required minlength="8" />
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span v-else>RÉINITIALISER</span>
        </button>
      </form>

      <RouterLink to="/login" class="back-link">← Retour à la connexion</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '@/api/auth.api'
import TraityLogo from '@/components/TraityLogo.vue'

const route = useRoute()
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const newPassword = ref('')
const confirmPassword = ref('')

async function handleReset() {
  errorMsg.value = null

  if (!route.query.token || !route.query.email) {
    errorMsg.value = 'Lien de réinitialisation invalide'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  try {
    const res = await authApi.resetPassword({
      email:            route.query.email as string,
      token:            route.query.token as string,
      new_password:     newPassword.value,
      confirm_password: confirmPassword.value,
    })
    successMsg.value = res.message
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Erreur'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/auth.scss';

.left-logo {
  position: absolute;
  top: 24px; left: 28px;
  z-index: 10;
  :deep(.traity-name) { color: #fff !important; }
}
</style>