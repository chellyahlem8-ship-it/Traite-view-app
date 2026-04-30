<template>
  <!-- ══════════════════════════════════════════════
       SignupForm.vue
       Formulaire de création de compte
       ══════════════════════════════════════════════ -->
  <div class="signup-form-wrap">
    <h1 class="form-title">Créer un compte</h1>
    <p class="form-sub">Rejoignez Traity et gérez vos traites efficacement</p>

    <form class="auth-form" @submit.prevent="handleSubmit">

      <!-- Ligne Prénom / Nom -->
      <div class="field-row">
        <div class="field-group">
          <label>Prénom</label>
          <input
            v-model="form.prenom"
            type="text"
            placeholder="Jean"
            :class="{ 'input-error': errors.prenom }"
            @blur="validateField('prenom')"
          />
          <span v-if="errors.prenom" class="field-error">{{ errors.prenom }}</span>
        </div>
        <div class="field-group">
          <label>Nom</label>
          <input
            v-model="form.nom"
            type="text"
            placeholder="Dupont"
            :class="{ 'input-error': errors.nom }"
            @blur="validateField('nom')"
          />
          <span v-if="errors.nom" class="field-error">{{ errors.nom }}</span>
        </div>
      </div>

      <!-- Email -->
      <div class="field-group">
        <label>Adresse e-mail</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="vous@traity.app"
          :class="{ 'input-error': errors.email }"
          @blur="validateField('email')"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <!-- Mot de passe -->
      <div class="field-group">
        <label>Mot de passe</label>
        <div class="pass-field">
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            placeholder="8 caractères minimum"
            :class="{ 'input-error': errors.password }"
            @blur="validateField('password')"
          />
          <button type="button" class="eye-btn" @click="showPass = !showPass">
            {{ showPass ? '🙈' : '👁' }}
          </button>
        </div>
        <!-- Jauge de force du mot de passe -->
        <div v-if="form.password" class="password-strength">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :class="passwordStrength.class"
              :style="{ width: passwordStrength.width }"
            />
          </div>
          <span class="strength-label" :class="passwordStrength.class">
            {{ passwordStrength.label }}
          </span>
        </div>
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </div>

      <!-- Confirmation mot de passe -->
      <div class="field-group">
        <label>Confirmer le mot de passe</label>
        <div class="pass-field">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPass ? 'text' : 'password'"
            placeholder="Retapez votre mot de passe"
            :class="{
              'input-error': errors.confirmPassword,
              'input-success': form.confirmPassword && form.confirmPassword === form.password
            }"
            @blur="validateField('confirmPassword')"
          />
          <button type="button" class="eye-btn" @click="showConfirmPass = !showConfirmPass">
            {{ showConfirmPass ? '🙈' : '👁' }}
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
      </div>

      <!-- Erreur globale -->
      <p v-if="globalError" class="error-msg">{{ globalError }}</p>

      <!-- Bouton continuer -->
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner" />
        <span v-else>Continuer vers les abonnements →</span>
      </button>

    </form>

    <div class="login-link">
      Déjà un compte ? <router-link to="/login">Se connecter</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────
const props = defineProps<{
  loading: boolean
  globalError: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: {
    nom: string
    prenom: string
    email: string
    password: string
  }): void
}>()

// ─── État du formulaire ───────────────────────────────────────
const showPass = ref(false)
const showConfirmPass = ref(false)

const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  prenom: '',
  nom: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// ─── Force du mot de passe ────────────────────────────────────
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { label: '', class: '', width: '0%' }

  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  if (score <= 1) return { label: 'Faible',  class: 'strength-weak',   width: '25%' }
  if (score <= 2) return { label: 'Moyen',   class: 'strength-medium', width: '50%' }
  if (score <= 3) return { label: 'Bon',     class: 'strength-good',   width: '75%' }
  return              { label: 'Fort',    class: 'strength-strong', width: '100%' }
})

// ─── Validation champ par champ ───────────────────────────────
function validateField(field: keyof typeof errors) {
  errors[field] = ''

  switch (field) {
    case 'prenom':
      if (!form.prenom.trim()) errors.prenom = 'Le prénom est requis.'
      break
    case 'nom':
      if (!form.nom.trim()) errors.nom = 'Le nom est requis.'
      break
    case 'email':
      if (!form.email.trim()) {
        errors.email = "L'e-mail est requis."
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Adresse e-mail invalide.'
      }
      break
    case 'password':
      if (!form.password) {
        errors.password = 'Le mot de passe est requis.'
      } else if (form.password.length < 8) {
        errors.password = 'Minimum 8 caractères.'
      }
      break
    case 'confirmPassword':
      if (!form.confirmPassword) {
        errors.confirmPassword = 'Veuillez confirmer votre mot de passe.'
      } else if (form.confirmPassword !== form.password) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
      }
      break
  }
}

// ─── Validation complète ──────────────────────────────────────
function validateAll(): boolean {
  ;(['prenom', 'nom', 'email', 'password', 'confirmPassword'] as const).forEach(validateField)
  return Object.values(errors).every(e => !e)
}

// ─── Soumission ───────────────────────────────────────────────
function handleSubmit() {
  if (!validateAll()) return

  emit('submit', {
    nom: form.nom,
    prenom: form.prenom,
    email: form.email,
    password: form.password,
  })
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.signup-form-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Outfit', sans-serif;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #4c1d95;
  margin: 0 0 6px;
  text-align: center;
}

.form-sub {
  font-size: 13px;
  color: #7c3aed;
  text-align: center;
  margin: 0 0 22px;
  line-height: 1.6;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 12px;
    font-weight: 500;
    color: #7c3aed;
    letter-spacing: 0.3px;
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
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
    }
    &::placeholder { color: #c4b5fd; }

    &.input-error {
      border-color: #f87171;
      background: #fff5f5;
      &:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.12); }
    }

    &.input-success {
      border-color: #4ade80;
      background: #f0fdf4;
    }
  }
}

.field-error {
  font-size: 11px;
  color: #dc2626;
  margin-top: 2px;
}

// ── Mot de passe ──────────────────────────────────────────────
.pass-field {
  position: relative;
  input { width: 100%; padding-right: 42px; }
  .eye-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    opacity: 0.5;
    &:hover { opacity: 0.85; }
  }
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #ede9fe;
  border-radius: 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background 0.3s ease;

  &.strength-weak   { background: #ef4444; }
  &.strength-medium { background: #f59e0b; }
  &.strength-good   { background: #3b82f6; }
  &.strength-strong { background: #22c55e; }
}

.strength-label {
  font-size: 11px;
  font-weight: 500;
  min-width: 40px;

  &.strength-weak   { color: #ef4444; }
  &.strength-medium { color: #f59e0b; }
  &.strength-good   { color: #3b82f6; }
  &.strength-strong { color: #22c55e; }
}

// ── Bouton ────────────────────────────────────────────────────
.btn-primary {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: opacity 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;

  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

// ── Messages ──────────────────────────────────────────────────
.error-msg {
  font-size: 13px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0;
}

.login-link {
  margin-top: 18px;
  font-size: 13px;
  color: #8b5cf6;
  text-align: center;

  a {
    color: #7c3aed;
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

// ── Responsive ────────────────────────────────────────────────
@media (max-width: 480px) {
  .field-row { grid-template-columns: 1fr; }
}
</style>