<template>
  <div class="utilisateur-form-card">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="form-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7
               7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div>
        <h2 class="form-title">Nouvel Utilisateur</h2>
        <p class="form-subtitle">Créez un compte utilisateur.</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="emit('submit')">

      <!-- ── SECTION : Identité ─────────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label"><span class="section-dot" />Identité</h3>

        <div class="field-row">
          <!-- Nom -->
          <div class="field-group">
            <label class="field-label">Nom <span class="required-star">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114
                     0H3z" clip-rule="evenodd" />
              </svg>
              <input
                :value="modelValue.nom"
                type="text"
                class="field-input field-input--icon"
                :class="{ 'field-input--error': errors?.nom }"
                placeholder="Ex : Ben Ali"
                @input="patch('nom', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <span v-if="errors?.nom" class="field-error-text">{{ errors.nom }}</span>
          </div>

          <!-- Prénom -->
          <div class="field-group">
            <label class="field-label">Prénom <span class="required-star">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114
                     0H3z" clip-rule="evenodd" />
              </svg>
              <input
                :value="modelValue.prenom"
                type="text"
                class="field-input field-input--icon"
                :class="{ 'field-input--error': errors?.prenom }"
                placeholder="Ex : Karim"
                @input="patch('prenom', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <span v-if="errors?.prenom" class="field-error-text">{{ errors.prenom }}</span>
          </div>
        </div>

        <!-- Rôle -->
        <div class="field-group">
          <label class="field-label">Rôle <span class="required-star">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012
                   2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0
                   01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1
                   1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110
                   2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974
                       24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            <select
              :value="modelValue.role"
              class="field-input field-input--icon field-select"
              :class="{ 'field-input--error': errors?.role }"
              @change="patch('role', ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>Sélectionner un rôle…</option>
              <option value="admin">Administrateur</option>
              <option value="gestionnaire">Gestionnaire</option>
              <option value="comptable">Comptable</option>
              <option value="commercial">Commercial</option>
              <option value="consultant">Consultant</option>
            </select>
          </div>
          <span v-if="errors?.role" class="field-error-text">{{ errors.role }}</span>
        </div>
      </section>

      <!-- ── SECTION : Connexion ────────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label"><span class="section-dot" />Connexion</h3>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label">Email <span class="required-star">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016
                       4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0
                       002-2V8.118z" />
            </svg>
            <input
              :value="modelValue.email"
              type="email"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.email }"
              placeholder="Ex : karim@entreprise.tn"
              @input="patch('email', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <span v-if="errors?.email" class="field-error-text">{{ errors.email }}</span>
        </div>

        <!-- Mot de passe -->
        <div class="field-group">
          <label class="field-label">Mot de passe <span class="required-star">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2
                   2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3
                   0 016 0z" clip-rule="evenodd" />
            </svg>
            <input
              :value="modelValue.motDePasse"
              :type="showPassword ? 'text' : 'password'"
              class="field-input field-input--icon field-input--password"
              :class="{ 'field-input--error': errors?.motDePasse }"
              placeholder="Minimum 6 caractères"
              @input="patch('motDePasse', ($event.target as HTMLInputElement).value)"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <!-- Œil ouvert -->
              <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943
                     9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732
                     14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clip-rule="evenodd" />
              </svg>
              <!-- Œil barré -->
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0
                     001.414-1.414l-1.473-1.473A10.014 10.014 0
                     0019.542 10C18.268 5.943 14.478 3 10 3a9.958
                     9.958 0 00-4.512 1.074l-1.78-1.781zm4.261
                     4.26l1.514 1.515a2.003 2.003 0 012.45
                     2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335
                         6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542
                         7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
          <span v-if="errors?.motDePasse" class="field-error-text">{{ errors.motDePasse }}</span>
        </div>
      </section>

      <!-- ── SECTION : Organisation ──────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label"><span class="section-dot" />Organisation</h3>

        <!-- Société -->
        <div class="field-group">
          <label class="field-label">Société <span class="required-star">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1
                   1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm0 6h2v2H7v-2zm4
                   0h2v2h-2v-2z" clip-rule="evenodd" />
            </svg>
            <select
              :value="modelValue.idSociete ?? ''"
              class="field-input field-input--icon field-select"
              :class="{ 'field-input--error': errors?.idSociete }"
              @change="patch('idSociete', Number(($event.target as HTMLSelectElement).value) || null)"
            >
              <option value="" disabled>Sélectionner une société…</option>
              <option
                v-for="s in societes"
                :key="s.idSociete"
                :value="s.idSociete"
              >
                {{ s.nomSociete }}
              </option>
            </select>
          </div>
          <span v-if="errors?.idSociete" class="field-error-text">{{ errors.idSociete }}</span>
        </div>
      </section>

      <!-- ── Actions ────────────────────────────────────────── -->
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="loading">
          <span class="btn-inner">
            <svg v-if="loading" class="btn-icon btn-icon--spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"
                stroke-dasharray="32" stroke-dashoffset="12" />
            </svg>
            <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414
                   0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1
                   1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {{ loading ? 'Enregistrement…' : "Créer l'Utilisateur" }}
          </span>
        </button>
        <button type="button" class="btn btn--outline" :disabled="loading" @click="emit('cancel')">
          Annuler
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Societe } from '@/types/utilisateurs'

export interface UtilisateurFormData {
  nom:        string
  prenom:     string
  role:       string
  email:      string
  motDePasse: string
  idSociete:  number | null
}

export interface UtilisateurFormErrors {
  nom?:        string
  prenom?:     string
  role?:       string
  email?:      string
  motDePasse?: string
  idSociete?:  string
}

const props = withDefaults(
  defineProps<{
    modelValue: UtilisateurFormData
    loading?:   boolean
    errors?:    UtilisateurFormErrors
    societes?:  Societe[]
  }>(),
  { loading: false, errors: () => ({}), societes: () => [] }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: UtilisateurFormData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const showPassword = ref(false)

function patch<K extends keyof UtilisateurFormData>(key: K, value: UtilisateurFormData[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.utilisateur-form-card {
  --clr-primary:       #5b21b6;
  --clr-primary-light: #7c3aed;
  --clr-primary-bg:    #f5f3ff;
  --clr-border:        #ddd6fe;
  --clr-border-focus:  #7c3aed;
  --clr-text:          #1e1b4b;
  --clr-muted:         #6b7280;
  --clr-error:         #dc2626;
  --clr-error-bg:      #fef2f2;
  --radius-sm:         8px;
  --radius-md:         12px;
  --radius-lg:         16px;
  --shadow-card:       0 4px 24px rgba(91, 33, 182, 0.10),
                       0 1px 4px rgba(0, 0, 0, 0.04);
  --transition:        0.18s ease;

  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px 36px 28px;
  max-width: 620px;
  width: 100%;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--clr-border);
}

/* Header */
.form-header {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 28px; padding-bottom: 20px;
  border-bottom: 1px solid var(--clr-border);
}
.header-icon {
  flex-shrink: 0; width: 44px; height: 44px;
  background: var(--clr-primary-bg);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: var(--clr-primary);
}
.header-icon svg { width: 22px; height: 22px; }
.form-title  { font-size: 17px; font-weight: 700; color: var(--clr-text); margin: 0 0 2px; letter-spacing: -.01em; }
.form-subtitle { font-size: 13px; color: var(--clr-muted); margin: 0; }

/* Body */
.form-body    { display: flex; flex-direction: column; gap: 24px; }
.form-section { display: flex; flex-direction: column; gap: 14px; }

.section-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--clr-primary); margin: 0;
}
.section-dot {
  display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--clr-primary-light);
}

/* Row 2 colonnes */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* Fields */
.field-group  { display: flex; flex-direction: column; gap: 5px; }
.field-label  { font-size: 13px; font-weight: 600; color: var(--clr-text); }
.required-star { color: var(--clr-error); margin-left: 2px; }

.field-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--clr-border);
  border-radius: var(--radius-sm);
  font-size: 14px; color: var(--clr-text);
  background: #fff; outline: none;
  box-sizing: border-box;
  transition: border-color var(--transition), box-shadow var(--transition);
  font-family: inherit;
}
.field-input::placeholder { color: #a1a1aa; }
.field-input:focus {
  border-color: var(--clr-border-focus);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}
.field-input--error { border-color: var(--clr-error) !important; background: var(--clr-error-bg); }
.field-input--error:focus { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12) !important; }
.field-error-text { font-size: 12px; color: var(--clr-error); }

.input-wrapper { position: relative; }
.input-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%);
  width: 15px; height: 15px; color: #a1a1aa;
  pointer-events: none; transition: color var(--transition);
}
.field-input--icon  { padding-left: 38px; }
.field-input--password { padding-right: 40px; }
.input-wrapper:focus-within .input-icon { color: var(--clr-primary-light); }

/* Select */
.field-select { appearance: none; cursor: pointer; }

/* Toggle mot de passe */
.password-toggle {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  padding: 4px; color: #a1a1aa;
  display: flex; align-items: center;
  transition: color var(--transition);
}
.password-toggle:hover { color: var(--clr-primary-light); }
.password-toggle svg   { width: 16px; height: 16px; }

/* Actions */
.form-actions { display: flex; gap: 12px; padding-top: 8px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 22px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 600;
  cursor: pointer; border: none;
  transition: all var(--transition);
  font-family: inherit; white-space: nowrap;
}
.btn--primary {
  flex: 1;
  background: linear-gradient(135deg, var(--clr-primary-light) 0%, var(--clr-primary) 100%);
  color: #fff; box-shadow: 0 2px 8px rgba(91, 33, 182, 0.28);
}
.btn--primary:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(91, 33, 182, 0.36); transform: translateY(-1px); }
.btn--primary:active:not(:disabled){ transform: translateY(0); box-shadow: 0 2px 6px rgba(91, 33, 182, .22); }
.btn--outline {
  background: transparent; color: var(--clr-muted);
  border: 1.5px solid var(--clr-border);
}
.btn--outline:hover:not(:disabled) { border-color: #c4b5fd; color: var(--clr-primary); background: var(--clr-primary-bg); }
.btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.btn-inner { display: flex; align-items: center; gap: 8px; }
.btn-icon  { width: 16px; height: 16px; flex-shrink: 0; }
.btn-icon--spin { animation: spin .8s linear infinite; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .utilisateur-form-card { padding: 20px 18px; border-radius: 0; border-left: none; border-right: none; box-shadow: none; }
  .field-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .btn--outline { order: 1; }
}
</style>