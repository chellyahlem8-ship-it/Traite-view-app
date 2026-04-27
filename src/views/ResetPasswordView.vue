<template>
  <div class="auth-root">
    <div class="auth-card">

      <!-- PANNEAU VIOLET — plein écran au chargement, puis se rétracte à gauche -->
      <div class="color-panel" :class="entering ? 'panel-expand' : 'panel-left'">
        <div class="panel-content">
          <div class="panel-logo">
            <TraityLogo :size="36" show-text />
          </div>

          <div class="stat-float stat-top">
            <span class="stat-icon">🔐</span>
            <div>
              <p class="stat-value">Sécurisé</p>
              <p class="stat-label">Chiffrement SSL</p>
            </div>
            <span class="stat-badge">✓</span>
          </div>

          <div class="avatar-wrap">
            <img src="@/assets/rei.png" alt="avatar" class="avatar-img" />
          </div>

          <div class="stat-float stat-bottom">
            <span class="stat-icon">🛡️</span>
            <div>
              <p class="stat-value">Protégé</p>
              <p class="stat-label">Mot de passe hashé</p>
            </div>
            <span class="stat-badge">AES</span>
          </div>
        </div>
      </div>

      <!-- PANNEAU FORMULAIRE BLANC -->
      <div class="form-panel" :class="entering ? 'form-hidden' : 'form-right'">
        <div class="form-inner">
          

          <h1 class="form-title">Nouveau mot de passe</h1>
          <p class="form-sub">Choisissez un nouveau mot de passe sécurisé.</p>

          <div v-if="successMsg" class="success-alert">✅ {{ successMsg }}</div>

          <form v-else class="auth-form" @submit.prevent="handleReset">
            <div class="field-group">
              <label>Nouveau mot de passe</label>
              <div class="pass-field">
                <input
                  v-model="newPassword"
                  :type="showNew ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  minlength="8"
                />
                <button type="button" class="eye-btn" @click="showNew = !showNew">
                  {{ showNew ? '🙈' : '👁' }}
                </button>
              </div>
            </div>
            <div class="field-group">
              <label>Confirmer le mot de passe</label>
              <div class="pass-field">
                <input
                  v-model="confirmPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  minlength="8"
                />
                <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
                  {{ showConfirm ? '🙈' : '👁' }}
                </button>
              </div>
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '@/api/auth.api'
import TraityLogo from '@/components/TraityLogo.vue'

const route = useRoute()
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const newPassword = ref('')
const confirmPassword = ref('')
const showNew = ref(false)
const showConfirm = ref(false)

// Animation d'entrée : panneau violet commence plein écran (panel-expand),
// puis au prochain frame se rétracte vers la gauche (panel-left)
// révélant le formulaire à droite — identique à la transition de la vidéo
const entering = ref(true)

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      entering.value = false
    })
  })
})

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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.auth-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ede9fe;
  font-family: 'Outfit', sans-serif;
}

.auth-card {
  width: 900px;
  height: 560px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 24px 60px rgba(109, 40, 217, 0.2);
  background: #f5f3ff;
}

/* ── Panneau violet ─────────────────────────────────────────── */
.color-panel {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(150deg, #6d28d9 0%, #8b5cf6 40%, #a78bfa 75%, #c4b5fd 100%);
  border-radius: 20px;
  z-index: 10;
  overflow: hidden;

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

  /* État repos — moitié gauche */
  &.panel-left {
    left: 0;
    width: 50%;
    transition:
      left  0.75s cubic-bezier(0.76, 0, 0.24, 1),
      width 0.75s cubic-bezier(0.76, 0, 0.24, 1);
  }

  /* État initial au chargement — plein écran, sans transition */
  &.panel-expand {
    left: 0;
    width: 100%;
    transition: none;
  }
}

/* ── Contenu panneau violet ─────────────────────────────────── */
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
  top: 24px; left: 28px;
  z-index: 2;
  :deep(.traity-name) { color: #fff !important; }
}

.avatar-wrap { z-index: 1; }

.avatar-img {
  width: 200px;
  height: auto;
  display: block;
  mix-blend-mode: multiply;
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

.stat-top    { top: 20%; right: 5%; animation: floatUp 4s ease-in-out infinite; }
.stat-bottom { bottom: 14%; left: 3%; animation: floatDown 4.5s ease-in-out infinite; }

@keyframes floatUp   { 0%,100% { transform: translateY(0);     } 50% { transform: translateY(-12px); } }
@keyframes floatDown { 0%,100% { transform: translateY(0);     } 50% { transform: translateY(12px);  } }

/* ── Panneau formulaire ─────────────────────────────────────── */
.form-panel {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    left    0.75s cubic-bezier(0.76, 0, 0.24, 1),
    opacity 0.4s ease 0.2s;

  &.form-right  { left: 50%; opacity: 1; }
  &.form-hidden { left: 50%; opacity: 0; pointer-events: none; transition: none; }
}

.form-inner {
  width: 100%;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
/*
.form-logo-wrap {
  position: absolute;
  top: 24px; left: 28px;
}
*/
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
  margin-top: 4px;

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

.back-link {
  margin-top: 16px;
  font-size: 13px;
  color: #7c3aed;
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}
</style>