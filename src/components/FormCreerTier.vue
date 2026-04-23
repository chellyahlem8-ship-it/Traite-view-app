<template>
  <div class="tier-form-card">

    <div class="form-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div>
        <h2 class="form-title">Nouveau Tiers</h2>
        <p class="form-subtitle">Enregistrez un client, fournisseur ou partenaire.</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="$emit('submit')">

      <!-- ── SECTION : Identité ───────────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label">
          <span class="section-dot" />
          Identité
        </h3>

        <!-- Raison sociale -->
        <div class="field-group">
          <label class="field-label">
            Raison Sociale <span class="required-star">*</span>
          </label>
          <input
            :value="modelValue.raison_sociale"
            type="text"
            class="field-input"
            :class="{ 'field-input--error': errors?.raison_sociale }"
            placeholder="Ex : Société XYZ SARL"
            @input="emit('update:modelValue', { ...modelValue, raison_sociale: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="errors?.raison_sociale" class="field-error-text">
            {{ errors.raison_sociale }}
          </span>
        </div>

        <!-- Type de tiers (SELECT dynamique) -->
        <div class="field-group">
          <label class="field-label">
            Type de Tiers <span class="required-star">*</span>
          </label>
          <div class="select-wrapper">
            <select
              :value="modelValue.types_tiers_id"
              class="field-input field-input--select"
              :class="{ 'field-input--error': errors?.types_tiers_id }"
              :disabled="loadingTypes"
              @change="emit('update:modelValue', { ...modelValue, types_tiers_id: Number(($event.target as HTMLSelectElement).value) })"
            >
              <option value="" disabled>
                {{ loadingTypes ? 'Chargement des types...' : '-- Sélectionner un type --' }}
              </option>
              <option v-for="t in typesTiers" :key="t.id" :value="t.id">
                {{ t.type }}
              </option>
            </select>
            <!-- Icône chevron du select -->
            <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
            <!-- Spinner si chargement -->
            <svg v-if="loadingTypes" class="select-spinner" viewBox="0 0 24 24" fill="none">
              <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
              <path class="spinner-arc" stroke="currentColor" stroke-width="3" stroke-linecap="round"
                d="M12 2a10 10 0 0110 10" />
            </svg>
          </div>
          <span v-if="errors?.types_tiers_id" class="field-error-text">
            {{ errors.types_tiers_id }}
          </span>
        </div>
      </section>

      <!-- ── SECTION : Coordonnées ───────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label">
          <span class="section-dot" />
          Coordonnées
        </h3>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label">
            Email <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input
              :value="modelValue.email"
              type="email"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.email }"
              placeholder="contact@exemple.com"
              @input="emit('update:modelValue', { ...modelValue, email: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <span v-if="errors?.email" class="field-error-text">{{ errors.email }}</span>
        </div>

        <!-- Adresse -->
        <div class="field-group">
          <label class="field-label">
            Adresse <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd" />
            </svg>
            <input
              :value="modelValue.adresse"
              type="text"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.adresse }"
              placeholder="Rue, Ville, Code postal"
              @input="emit('update:modelValue', { ...modelValue, adresse: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <span v-if="errors?.adresse" class="field-error-text">{{ errors.adresse }}</span>
        </div>

        <!-- Téléphone -->
        <div class="field-group">
          <label class="field-label">
            Téléphone <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <input
              :value="modelValue.num_tel"
              type="tel"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.num_tel }"
              placeholder="Ex : 71 234 567"
              @input="emit('update:modelValue', { ...modelValue, num_tel: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <span v-if="errors?.num_tel" class="field-error-text">{{ errors.num_tel }}</span>
        </div>
      </section>

      <!-- ── ACTIONS ──────────────────────────────────────────── -->
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="loading">
          <span class="btn-inner">
            <!-- Spinner loading -->
            <svg v-if="loading" class="btn-icon btn-icon--spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12" />
            </svg>
            <!-- Icône check au repos -->
            <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd" />
            </svg>
            {{ loading ? 'Enregistrement...' : 'Créer le Tiers' }}
          </span>
        </button>

        <button
          type="button"
          class="btn btn--outline"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          Annuler
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
// ── Types locaux (peuvent être importés depuis un types.ts partagé) ──
export interface TypeTierOption {
  id: number
  type: string
}

export interface TierFormData {
  raison_sociale: string
  email: string
  adresse: string
  num_tel: string | number
  types_tiers_id: number | ''
  [key: string]: unknown  // extensible pour d'autres champs métier
}

export interface TierFormErrors {
  raison_sociale?: string
  email?: string
  adresse?: string
  num_tel?: string
  types_tiers_id?: string
  [key: string]: string | undefined
}

// ── Props ────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  /** Données du formulaire liées via v-model */
  modelValue: TierFormData
  /** Liste des types de tiers chargée par le parent */
  typesTiers?: TypeTierOption[]
  /** true pendant le chargement des types (désactive le select) */
  loadingTypes?: boolean
  /** true pendant la soumission (désactive le bouton) */
  loading?: boolean
  /** Erreurs de validation par champ, gérées par le parent */
  errors?: TierFormErrors
}>(), {
  typesTiers: () => [],
  loadingTypes: false,
  loading: false,
  errors: () => ({})
})

// ── Emits ────────────────────────────────────────────────────────────
const emit = defineEmits<{
  /** Propagation du v-model vers le parent */
  (e: 'update:modelValue', value: TierFormData): void
  /** Soumission du formulaire */
  (e: 'submit'): void
  /** Annulation / réinitialisation */
  (e: 'cancel'): void
}>()
</script>

<style scoped>
/* ── Variables ──────────────────────────────────────────────────── */
.tier-form-card {
  --clr-primary:       #5b21b6;
  --clr-primary-light: #7c3aed;
  --clr-primary-bg:    #f5f3ff;
  --clr-border:        #ddd6fe;
  --clr-border-focus:  #7c3aed;
  --clr-text:          #1e1b4b;
  --clr-muted:         #6b7280;
  --clr-error:         #dc2626;
  --clr-error-bg:      #fef2f2;
  --clr-success:       #059669;
  --radius-sm:         8px;
  --radius-md:         12px;
  --radius-lg:         16px;
  --shadow-card:       0 4px 24px rgba(91, 33, 182, 0.10), 0 1px 4px rgba(0,0,0,0.04);
  --transition:        0.18s ease;

  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px 36px 28px;
  max-width: 580px;
  width: 100%;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--clr-border);
}

/* ── Header ─────────────────────────────────────────────────────── */
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

/* ── Sections ───────────────────────────────────────────────────── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

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

/* ── Fields ─────────────────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--clr-text);
}

.required-star {
  color: var(--clr-error);
  margin-left: 2px;
}

/* Input base */
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

.field-input--error {
  border-color: var(--clr-error) !important;
  background: var(--clr-error-bg);
}

.field-input--error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12) !important;
}

.field-error-text {
  font-size: 12px;
  color: var(--clr-error);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Input avec icône ─────────────────────────── */
.input-wrapper {
  position: relative;
}

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

.field-input--icon {
  padding-left: 38px;
}

.input-wrapper:focus-within .input-icon {
  color: var(--clr-primary-light);
}

/* Select ────────────────────────────────────── */
.select-wrapper {
  position: relative;
}

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
.spinner-arc   { opacity: 1; }

/* ── Buttons ─────────────────────────────────────────────────────── */
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

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.btn-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-icon--spin {
  animation: spin 0.8s linear infinite;
}

/* ── Animations ─────────────────────────────────────────────────── */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .tier-form-card {
    padding: 20px 18px 20px;
    border-radius: var(--radius-md);
    border-left: none;
    border-right: none;
    border-radius: 0;
    box-shadow: none;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn--outline {
    order: 1;
  }
}
</style>