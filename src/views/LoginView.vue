<template>
  <div class="auth-layout">
    <div class="left-panel">

      <!-- Logo fixe haut gauche -->
      <div class="left-logo">
        <TraityLogo :size="36" show-text />
      </div>

      <!-- Stat flottante HAUT droite -->
      <div class="stat-float stat-top">
        <span class="stat-icon">📄</span>
        <div>
          <p class="stat-value">1,284</p>
          <p class="stat-label">Traites actives</p>
        </div>
        <span class="stat-badge">+18%</span>
      </div>

      <!-- Avatar -->
      <div class="avatar-wrap">
        <img src="@/assets/t.png" alt="Traity avatar" class="avatar-img" />
      </div>

      <!-- Stat flottante BAS gauche -->
      <div class="stat-float stat-bottom">
        <span class="stat-icon">💰</span>
        <div>
          <p class="stat-value">842.5k DT</p>
          <p class="stat-label">Trésorerie totale</p>
        </div>
        <span class="stat-badge">+62%</span>
      </div>

    </div>

    <!-- Panneau droit -->
    <div class="right-panel">
      <div class="form-logo-wrap">
        <TraityLogo :size="28" show-text />
      </div>
      <h1 class="form-title">Bienvenue</h1>
      <p class="form-sub">Connectez-vous à votre espace de gestion</p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="field-group">
          <label>Adresse e-mail</label>
          <input v-model="form.email" type="email" placeholder="vous@traity.app" required />
        </div>
        <div class="field-group">
          <label>Mot de passe</label>
          <div class="pass-field">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="••••••••"
              required
            />
            <button type="button" class="eye-btn" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="rememberMe" type="checkbox" />
            Se souvenir de moi
          </label>
          <RouterLink to="/forgot-password" class="forgot-link">
            Mot de passe oublié ?
          </RouterLink>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span v-else>SE CONNECTER</span>
        </button>
      </form>

      <p class="register-link">
        Pas encore de compte ?
        <RouterLink to="/register">Créer un compte</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'

const { login, loading, errorMsg } = useAuth()
const showPass = ref(false)
const rememberMe = ref(false)
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  await login({ email: form.email, password: form.password })
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/auth.scss';

.left-logo {
  position: absolute;
  top: 24px;
  left: 28px;
  z-index: 10;
  :deep(.traity-name) { color: #fff !important; }
}

.avatar-wrap {
  z-index: 1;
  margin: 0;
}

.avatar-img {
  width: 220px;
  height: auto;
  display: block;
  filter: drop-shadow(0 10px 28px rgba(80, 0, 120, 0.3));
}

/* Stats flottantes */
.stat-float {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 10px 16px;
  color: #fff;
  min-width: 195px;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(60, 0, 100, 0.25);

  .stat-icon  { font-size: 20px; }
  .stat-value { font-size: 14px; font-weight: 600; margin: 0; }
  .stat-label { font-size: 11px; opacity: 0.8; margin: 0; }
  .stat-badge {
    margin-left: auto;
    font-size: 11px; font-weight: 600;
    color: #d1fae5;
    background: rgba(52, 211, 153, 0.2);
    border-radius: 6px;
    padding: 2px 8px;
  }
}

/* Haut — à droite de la tête */
.stat-top {
  top: 22%;
  right: 5%;
  animation: floatUp 4s ease-in-out infinite;
}

/* Bas — à gauche des pieds */
.stat-bottom {
  bottom: 16%;
  left: 3%;
  animation: floatDown 4.5s ease-in-out infinite;
}

@keyframes floatUp {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}

@keyframes floatDown {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(14px); }
}
</style>