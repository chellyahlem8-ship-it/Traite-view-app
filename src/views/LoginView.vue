<template>
  <div class="auth-root">
    <div class="auth-card">

      <!-- ═══ PANNEAU VIOLET — l'élément qui fait toute la transition ═══ -->
      <div class="color-panel" :class="panelClass">

        <!-- Contenu LOGIN -->
        <Transition name="fade">
          <div v-if="mode === 'login'" class="panel-content" key="panel-login">
            <div class="panel-logo">
              <TraityLogo :size="36" show-text />
            </div>
            <div class="stat-float stat-top">
              <span class="stat-icon">📄</span>
              <div>
                <p class="stat-value">1,284</p>
                <p class="stat-label">Traites actives</p>
              </div>
              <span class="stat-badge">+18%</span>
            </div>
            <div class="avatar-wrap">
              <img src="@/assets/t.png" alt="avatar" class="avatar-img" />
            </div>
            <div class="stat-float stat-bottom">
              <span class="stat-icon">💰</span>
              <div>
                <p class="stat-value">842.5k DT</p>
                <p class="stat-label">Trésorerie totale</p>
              </div>
              <span class="stat-badge">+62%</span>
            </div>
          </div>
        </Transition>

        <!-- Contenu FORGOT -->
        <Transition name="fade">
          <div v-if="mode === 'forgot'" class="panel-content" key="panel-forgot">
            <div class="panel-logo">
              <TraityLogo :size="36" show-text />
            </div>
            <div class="stat-float stat-top">
              <span class="stat-icon">🔒</span>
              <div>
                <p class="stat-value">Sécurisé</p>
                <p class="stat-label">Chiffrement SSL</p>
              </div>
              <span class="stat-badge">✓</span>
            </div>
            <div class="avatar-wrap">
              <img src="@/assets/mdpoub.png" alt="reset" class="avatar-img" />
            </div>
            <div class="stat-float stat-bottom">
              <span class="stat-icon">📧</span>
              <div>
                <p class="stat-value">&lt; 2 min</p>
                <p class="stat-label">Délai de réception</p>
              </div>
              <span class="stat-badge">Rapide</span>
            </div>
          </div>
        </Transition>

      </div>

      <!-- ═══ PANNEAU FORMULAIRE BLANC ═══ -->
      <div class="form-panel" :class="formClass">

        <!-- Formulaire LOGIN -->
        <Transition name="form-fade">
          <div v-if="mode === 'login'" class="form-inner" key="login">
            
            <h1 class="form-title">Bienvenue</h1>
            <p class="form-sub">Connectez-vous à votre espace de gestion</p>
            <form class="auth-form" @submit.prevent="handleLogin">
              <div class="field-group">
                <label>Adresse e-mail</label>
                <input v-model="loginForm.email" type="email" placeholder="vous@traity.app" required />
              </div>
              <div class="field-group">
                <label>Mot de passe</label>
                <div class="pass-field">
                  <input
                    v-model="loginForm.password"
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
                <a href="#" class="forgot-link" @click.prevent="switchToForgot">
                  Mot de passe oublié ?
                </a>
              </div>
              <p v-if="loginError" class="error-msg">{{ loginError }}</p>
              <button type="submit" class="btn-primary" :disabled="loginLoading">
                <span v-if="loginLoading" class="spinner" />
                <span v-else>SE CONNECTER</span>
              </button>
            </form>
            
          </div>
        </Transition>

        <!-- Formulaire FORGOT -->
        <Transition name="form-fade">
          <div v-if="mode === 'forgot'" class="form-inner" key="forgot">
            
            <h1 class="form-title">Mot de passe oublié</h1>
            <p class="form-sub">Entrez votre e-mail, nous vous enverrons un lien de réinitialisation.</p>
            <div v-if="successMsg" class="success-alert">✅ {{ successMsg }}</div>
            <form v-else class="auth-form" @submit.prevent="handleForgot">
              <div class="field-group">
                <label>Adresse e-mail</label>
                <input v-model="forgotEmail" type="email" placeholder="vous@traity.app" required />
              </div>
              <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
              <button type="submit" class="btn-primary" :disabled="forgotLoading">
                <span v-if="forgotLoading" class="spinner" />
                <span v-else>ENVOYER LE LIEN</span>
              </button>
            </form>
            <a href="#" class="back-link" @click.prevent="switchToLogin">← Retour à la connexion</a>
          </div>
        </Transition>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'

const mode = ref<'login' | 'forgot'>('login')
const transitioning = ref(false)

// Login
const { login, loading: loginLoading, errorMsg: loginError } = useAuth()
const showPass = ref(false)
const rememberMe = ref(false)
const loginForm = ref({ email: '', password: '' })

// Forgot
const { forgotPassword, loading: forgotLoading, errorMsg: forgotError, successMsg } = useAuth()
const forgotEmail = ref('')

// ─── Classes dynamiques du panneau violet ────────────────────
// panel-left  = occupe la moitié gauche (mode login, au repos)
// panel-right = occupe la moitié droite (mode forgot, au repos)
// panel-expand = prend tout l'écran (pendant la transition)
const panelClass = computed(() => {
  if (transitioning.value) return 'panel-expand'
  return mode.value === 'login' ? 'panel-left' : 'panel-right'
})

const formClass = computed(() => {
  if (transitioning.value) return 'form-hidden'
  return mode.value === 'login' ? 'form-right' : 'form-left'
})

// ─── LOGIN → FORGOT ──────────────────────────────────────────
async function switchToForgot() {
  if (transitioning.value) return
  transitioning.value = true       // 1. panneau s'étend vers la droite → full screen
  await wait(650)                  // 2. attend que l'expansion soit totale
  mode.value = 'forgot'            // 3. change contenu (invisible car formulaire masqué)
  await wait(80)
  transitioning.value = false      // 4. panneau se rétracte vers la droite
}

// ─── FORGOT → LOGIN ──────────────────────────────────────────
async function switchToLogin() {
  if (transitioning.value) return
  transitioning.value = true
  await wait(650)
  mode.value = 'login'
  await wait(80)
  transitioning.value = false
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function handleLogin() {
  await login({ email: loginForm.value.email, password: loginForm.value.password })
}

async function handleForgot() {
  await forgotPassword({ email: forgotEmail.value })
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

/* ─── Fond de page ─────────────────────────────────────────── */
.auth-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ede9fe;
  font-family: 'Outfit', sans-serif;
}

/* ─── Carte ────────────────────────────────────────────────── */
.auth-card {
  width: 900px;
  height: 560px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 24px 60px rgba(109, 40, 217, 0.2);
  background: #f5f3ff;
}

/* ═══════════════════════════════════════════════════════════
   PANNEAU VIOLET
   ═══════════════════════════════════════════════════════════ */
.color-panel {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(150deg, #6d28d9 0%, #8b5cf6 40%, #a78bfa 75%, #c4b5fd 100%);
  border-radius: 20px;
  z-index: 10;
  overflow: hidden;

  /* Cercles décoratifs */
  &::before {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.15);
    top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    width: 210px; height: 210px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.1);
    bottom: 50px; left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  /* État repos gauche (login) */
  &.panel-left {
    left: 0;
    width: 50%;
    transition:
      left  0.7s cubic-bezier(0.76, 0, 0.24, 1),
      width 0.7s cubic-bezier(0.76, 0, 0.24, 1);
  }

  /* État repos droite (forgot) */
  &.panel-right {
    left: 50%;
    width: 50%;
    transition:
      left  0.7s cubic-bezier(0.76, 0, 0.24, 1),
      width 0.7s cubic-bezier(0.76, 0, 0.24, 1);
  }

  /* État expansion plein écran */
  &.panel-expand {
    left: 0;
    width: 100%;
    transition:
      left  0.55s cubic-bezier(0.76, 0, 0.24, 1),
      width 0.55s cubic-bezier(0.76, 0, 0.24, 1);
  }
}

/* ─── Contenu du panneau violet ────────────────────────────── */
.panel-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.panel-logo {
  position: absolute;
  top: 24px;
  left: 28px;
  z-index: 2;
  :deep(.traity-name) { color: #fff !important; }
}

.avatar-wrap { z-index: 1; }

.avatar-img {
  width: 200px;
  height: auto;
  display: block;
  filter: drop-shadow(0 10px 28px rgba(80, 0, 120, 0.3));
}

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
  min-width: 175px;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(60, 0, 100, 0.2);

  .stat-icon  { font-size: 18px; }
  .stat-value { font-size: 13px; font-weight: 600; margin: 0; }
  .stat-label { font-size: 10px; opacity: 0.8; margin: 0; }
  .stat-badge {
    margin-left: auto;
    font-size: 10px; font-weight: 600;
    color: #d1fae5;
    background: rgba(52, 211, 153, 0.2);
    border-radius: 6px;
    padding: 2px 7px;
  }
}

.stat-top {
  top: 20%; right: 5%;
  animation: floatUp 4s ease-in-out infinite;
}
.stat-bottom {
  bottom: 14%; left: 3%;
  animation: floatDown 4.5s ease-in-out infinite;
}

@keyframes floatUp {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}
@keyframes floatDown {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(12px); }
}

/* ═══════════════════════════════════════════════════════════
   PANNEAU FORMULAIRE
   ═══════════════════════════════════════════════════════════ */
.form-panel {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    left    0.7s cubic-bezier(0.76, 0, 0.24, 1),
    opacity 0.2s ease;

  &.form-right  { left: 50%; opacity: 1; }
  &.form-left   { left: 0;   opacity: 1; }
  &.form-hidden { opacity: 0; pointer-events: none; }
}

.form-inner {
  width: 100%;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
}

.form-logo-wrap {
  position: absolute;
  top: 24px;
  left: 28px;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #4c1d95;
  margin-bottom: 6px;
  margin-top: 40px;
  text-align: center;
}

.form-sub {
  font-size: 13px;
  color: #7c3aed;
  text-align: center;
  margin-bottom: 22px;
  line-height: 1.6;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 500;
    color: #7c3aed;
    letter-spacing: 0.4px;
  }

  input {
    padding: 11px 14px;
    border: 1.5px solid #ddd6fe;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    background: #fff;
    color: #4c1d95;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
    }
    &::placeholder { color: #c4b5fd; }
  }
}

.pass-field {
  position: relative;
  input { width: 100%; padding-right: 42px; }
  .eye-btn {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 16px; opacity: 0.5;
    &:hover { opacity: 0.85; }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .remember-me {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; color: #7c3aed; cursor: pointer;
    input { accent-color: #8b5cf6; }
  }
  .forgot-link {
    font-size: 12px; color: #8b5cf6;
    text-decoration: underline; cursor: pointer;
    &:hover { color: #6d28d9; }
  }
}

.btn-primary {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: opacity 0.2s, transform 0.1s;
  display: flex; align-items: center; justify-content: center;

  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  font-size: 13px; color: #dc2626;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 8px; padding: 10px 14px; margin: 0;
}

.success-alert {
  font-size: 13px; color: #166534;
  background: #f0fdf4; border: 1px solid #86efac;
  border-radius: 10px; padding: 14px; text-align: center;
  width: 100%; margin-bottom: 16px;
}

.register-link, .back-link {
  margin-top: 16px;
  font-size: 13px; color: #8b5cf6; text-align: center;
  a, &.back-link {
    color: #7c3aed; font-weight: 600;
    text-decoration: none; cursor: pointer;
    &:hover { text-decoration: underline; }
  }
}

/* ─── Transitions Vue ──────────────────────────────────────── */
.fade-enter-active { transition: opacity 0.3s ease 0.1s; }
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-fade-enter-active { transition: opacity 0.3s ease 0.15s; }
.form-fade-leave-active { transition: opacity 0.15s ease; }
.form-fade-enter-from, .form-fade-leave-to { opacity: 0; }
</style>