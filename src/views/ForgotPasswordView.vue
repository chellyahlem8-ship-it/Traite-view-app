<template>
  <div class="auth-layout">
    <div class="left-panel">
      <TraityLogo :size="44" show-text class="mb-logo" />
      <img src="@/assets/mdpoub.png" alt="Illustration réinitialisation" class="left-illustration" />
    </div>
    <div class="right-panel">
      <TraityLogo :size="28" show-text class="form-logo-wrap" />
      <h1 class="form-title">Mot de passe oublié</h1>
      <p class="form-sub">Entrez votre adresse e-mail, nous vous enverrons un lien de réinitialisation.</p>

      <div v-if="successMsg" class="success-alert">
        ✅ {{ successMsg }}
      </div>

      <form v-else class="auth-form" @submit.prevent="handleForgot">
        <div class="field-group">
          <label>Adresse e-mail</label>
          <input v-model="email" type="email" placeholder="vous@traity.app" required />
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span v-else>ENVOYER LE LIEN</span>
        </button>
      </form>

      <RouterLink to="/login" class="back-link">← Retour à la connexion</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'

const { forgotPassword, loading, errorMsg, successMsg } = useAuth()
const email = ref('')

async function handleForgot() {
  await forgotPassword({ email: email.value })
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/auth.scss';

.left-illustration {
  display: block;
  max-width: 280px;
  width: 100%;
  margin-top: 2rem;
  align-self: center;
  opacity: 0.95;
}
</style>