<template>
  <div class="compte-form-card">

    <!-- ── Header ──────────────────────────────────────────────── -->
    <div class="form-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 10h18M3 6h18M3 14h18M3 18h18
               M6 3v18M18 3v18" />
          <rect x="2" y="5" width="20" height="14" rx="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div>
        <h2 class="form-title">Nouveau Compte Bancaire</h2>
        <p class="form-subtitle">Associez un compte à une banque et un titulaire.</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="emit('submit')">

      <!-- ── SECTION : Informations du compte ──────────────────── -->
      <section class="form-section">
        <h3 class="section-label">
          <span class="section-dot" />
          Informations du compte
        </h3>

        <!-- RIB -->
        <div class="field-group">
          <label class="field-label">
            RIB <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fill-rule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0
                   110-2 1 1 0 010 2zm3-1a1 1 0 100 2h3a1 1 0 100-2H7z"
                clip-rule="evenodd" />
            </svg>
            <input
              :value="modelValue.rib"
              type="text"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.rib }"
              placeholder="Ex : 12 345 0012345678901 23"
              @input="patch('rib', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <span v-if="errors?.rib" class="field-error-text">{{ errors.rib }}</span>
        </div>

        <!-- Adresse agence -->
        <div class="field-group">
          <label class="field-label">
            Adresse de l'agence <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7
                   7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd" />
            </svg>
            <input
              :value="modelValue.adresse_agence"
              type="text"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.adresse_agence }"
              placeholder="Ex : Avenue Habib Bourguiba, Tunis"
              @input="patch('adresse_agence', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <span v-if="errors?.adresse_agence" class="field-error-text">
            {{ errors.adresse_agence }}
          </span>
        </div>
      </section>

      <!-- ── SECTION : Banque ───────────────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label">
          <span class="section-dot" />
          Banque
        </h3>

        <!-- Select Banque (dynamique) -->
        <div class="field-group">
          <label class="field-label">
            Banque <span class="required-star">*</span>
          </label>
          <div class="select-wrapper">
            <select
              :value="modelValue.banque_id"
              class="field-input field-input--select"
              :class="{ 'field-input--error': errors?.banque_id }"
              :disabled="loadingBanques"
              @change="patch('banque_id', Number(($event.target as HTMLSelectElement).value))"
            >
              <option value="" disabled>
                {{ loadingBanques ? 'Chargement des banques…' : '-- Sélectionner une banque --' }}
              </option>
              <option v-for="b in banques" :key="b.id" :value="b.id">
                {{ b.nomBanque }}
              </option>
            </select>
            <svg v-if="!loadingBanques" class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1
                   1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0
                   010-1.414z"
                clip-rule="evenodd" />
            </svg>
            <svg v-else class="select-spinner" viewBox="0 0 24 24" fill="none">
              <circle class="spinner-track" cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="3" />
              <path class="spinner-arc" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" d="M12 2a10 10 0 0110 10" />
            </svg>
          </div>
          <span v-if="errors?.banque_id" class="field-error-text">
            {{ errors.banque_id }}
          </span>
        </div>
      </section>

      <!-- ── SECTION : Titulaire ────────────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label">
          <span class="section-dot" />
          Titulaire
        </h3>

        <!-- Select type de titulaire (statique) -->
        <div class="field-group">
          <label class="field-label">
            Type de titulaire <span class="required-star">*</span>
          </label>
          <div class="select-wrapper">
            <select
              :value="modelValue.titulaire_type"
              class="field-input field-input--select"
              :class="{ 'field-input--error': errors?.titulaire_type }"
              @change="patch('titulaire_type', ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>-- Sélectionner un type --</option>
              <option
                v-for="t in TITULAIRE_TYPES"
                :key="t.value"
                :value="t.value"
              >
                {{ t.label }}
              </option>
            </select>
            <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1
                   1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0
                   010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <span v-if="errors?.titulaire_type" class="field-error-text">
            {{ errors.titulaire_type }}
          </span>
        </div>

        <!-- Select titulaire (dynamique, conditionnel) -->
        <div v-if="modelValue.titulaire_type" class="field-group">
          <label class="field-label">
            Titulaire <span class="required-star">*</span>
          </label>
          <div class="select-wrapper">
            <select
              :value="modelValue.titulaire_id"
              class="field-input field-input--select"
              :class="{ 'field-input--error': errors?.titulaire_id }"
              :disabled="loadingTitulaires"
              @change="patch('titulaire_id', Number(($event.target as HTMLSelectElement).value))"
            >
              <option value="" disabled>
                {{ loadingTitulaires ? 'Chargement…' : '-- Sélectionner un titulaire --' }}
              </option>
              <option
                v-for="t in titulaires"
                :key="t.id"
                :value="t.id"
              >
                {{ t.label }}
              </option>
            </select>
            <svg v-if="!loadingTitulaires" class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1
                   1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0
                   010-1.414z"
                clip-rule="evenodd" />
            </svg>
            <svg v-else class="select-spinner" viewBox="0 0 24 24" fill="none">
              <circle class="spinner-track" cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="3" />
              <path class="spinner-arc" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" d="M12 2a10 10 0 0110 10" />
            </svg>
          </div>
          <span v-if="errors?.titulaire_id" class="field-error-text">
            {{ errors.titulaire_id }}
          </span>
        </div>
      </section>

      <!-- ── Actions ────────────────────────────────────────────── -->
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
                   1 0 011.414 0z"
                clip-rule="evenodd" />
            </svg>
            {{ loading ? 'Enregistrement…' : 'Créer le Compte Bancaire' }}
          </span>
        </button>

        <button
          type="button"
          class="btn btn--outline"
          :disabled="loading"
          @click="emit('cancel')"
        >
          Annuler
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────
//  FormCreerCompteBancaire.vue  –  Composant 100 % présentationnel
//  ➜ Aucune logique API, aucun store, aucun onMounted
//  ➜ Toute la logique métier est gérée par le parent (CreateCompteBancaire.vue)
// ─────────────────────────────────────────────────────────────────────
import type { SelectOption } from '@/composables/useComptesBancaires'
import { TITULAIRE_TYPES } from '@/composables/useComptesBancaires'
import type { Banque } from '@/types/banques'

// ── Types exportés ────────────────────────────────────────────────────

export interface CompteBancaireFormData {
  rib:             string
  adresse_agence:  string
  banque_id:       number | ''
  titulaire_type:  string
  titulaire_id:    number | ''
}

export interface CompteBancaireFormErrors {
  rib?:             string
  adresse_agence?:  string
  banque_id?:       string
  titulaire_type?:  string
  titulaire_id?:    string
}

// ── Props ─────────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    modelValue:        CompteBancaireFormData
    loading?:          boolean
    errors?:           CompteBancaireFormErrors
    banques?:          Banque[]
    loadingBanques?:   boolean
    titulaires?:       SelectOption[]
    loadingTitulaires?: boolean
  }>(),
  {
    loading:           false,
    errors:            () => ({}),
    banques:           () => [],
    loadingBanques:    false,
    titulaires:        () => [],
    loadingTitulaires: false,
  }
)

// ── Emits ─────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'update:modelValue', value: CompteBancaireFormData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

// ── Helpers ───────────────────────────────────────────────────────────
function patch<K extends keyof CompteBancaireFormData>(
  key: K,
  value: CompteBancaireFormData[K]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
/* ── Variables ────────────────────────────────────────────────────────── */
.compte-form-card {
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
  max-width: 580px;
  width: 100%;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--clr-border);
}

/* ── Header ───────────────────────────────────────────────────────────── */
.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--clr-border);
}

.header-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: var(--clr-primary-bg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clr-primary);
}
.header-icon svg { width: 22px; height: 22px; }

.form-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--clr-text);
  margin: 0 0 2px;
  letter-spacing: -0.01em;
}

.form-subtitle {
  font-size: 13px;
  color: var(--clr-muted);
  margin: 0;
}

/* ── Body / Sections ──────────────────────────────────────────────────── */
.form-body    { display: flex; flex-direction: column; gap: 24px; }
.form-section { display: flex; flex-direction: column; gap: 14px; }

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--clr-primary);
  margin: 0;
}

.section-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--clr-primary-light);
}

/* ── Fields ───────────────────────────────────────────────────────────── */
.field-group   { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--clr-text);
}

.required-star { color: var(--clr-error); margin-left: 2px; }

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--clr-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--clr-text);
  background: #fff;
  outline: none;
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

/* Input avec icône ──────────────────────────────── */
.input-wrapper { position: relative; }

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: #a1a1aa;
  pointer-events: none;
  transition: color var(--transition);
}

.field-input--icon { padding-left: 38px; }
.input-wrapper:focus-within .input-icon { color: var(--clr-primary-light); }

/* Select ────────────────────────────────────────── */
.select-wrapper { position: relative; }

.field-input--select {
  appearance: none;
  padding-right: 38px;
  cursor: pointer;
}
.field-input--select:disabled {
  background: #f9f9fb;
  color: var(--clr-muted);
  cursor: not-allowed;
  opacity: 0.8;
}

.select-chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--clr-muted);
  pointer-events: none;
}

.select-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--clr-primary-light);
  animation: spin 0.8s linear infinite;
  pointer-events: none;
}
.spinner-track { opacity: 0.2; }

/* ── Boutons ──────────────────────────────────────────────────────────── */
.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition);
  font-family: inherit;
  white-space: nowrap;
}

.btn--primary {
  flex: 1;
  background: linear-gradient(135deg, var(--clr-primary-light) 0%, var(--clr-primary) 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(91, 33, 182, 0.28);
}
.btn--primary:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(91, 33, 182, 0.36);
  transform: translateY(-1px);
}
.btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(91, 33, 182, 0.22);
}

.btn--outline {
  background: transparent;
  color: var(--clr-muted);
  border: 1.5px solid var(--clr-border);
}
.btn--outline:hover:not(:disabled) {
  border-color: #c4b5fd;
  color: var(--clr-primary);
  background: var(--clr-primary-bg);
}

.btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-inner          { display: flex; align-items: center; gap: 8px; }
.btn-icon           { width: 16px; height: 16px; flex-shrink: 0; }
.btn-icon--spin     { animation: spin 0.8s linear infinite; }

/* ── Animations ───────────────────────────────────────────────────────── */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Responsive ───────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .compte-form-card {
    padding: 20px 18px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }
  .form-actions      { flex-direction: column; }
  .btn--outline      { order: 1; }
}
</style>