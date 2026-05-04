<template>
  <div class="tier-form-card">
    <div class="form-header">
      <div class="form-header-icon">🏢</div>
      <div>
        <h1 class="form-title">Nouvelle société</h1>
        <p class="form-subtitle">Renseignez les informations de la société</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="$emit('submit')">

      <!-- Raison sociale -->
      <div class="field-group">
        <label class="field-label" for="raisonSociale">
          Raison sociale <span class="required-star">*</span>
        </label>
        <input
          id="raisonSociale"
          :value="modelValue.raisonSociale"
          type="text"
          class="field-input"
          :class="{ 'field-input--error': errors.raisonSociale }"
          placeholder="Ex : Société Tunisienne de Commerce"
          maxlength="100"
          @input="emit('update:modelValue', { ...modelValue, raisonSociale: ($event.target as HTMLInputElement).value })"
        />
        <span v-if="errors.raisonSociale" class="field-error-text">{{ errors.raisonSociale }}</span>
      </div>

      <!-- Email -->
      <div class="field-group">
        <label class="field-label" for="email">
          Email <span class="required-star">*</span>
        </label>
        <input
          id="email"
          :value="modelValue.email"
          type="email"
          class="field-input"
          :class="{ 'field-input--error': errors.email }"
          placeholder="contact@societe.tn"
          @input="emit('update:modelValue', { ...modelValue, email: ($event.target as HTMLInputElement).value })"
        />
        <span v-if="errors.email" class="field-error-text">{{ errors.email }}</span>
      </div>

      <!-- Adresse -->
      <div class="field-group">
        <label class="field-label" for="adresse">
          Adresse <span class="required-star">*</span>
        </label>
        <input
          id="adresse"
          :value="modelValue.adresse"
          type="text"
          class="field-input"
          :class="{ 'field-input--error': errors.adresse }"
          placeholder="Ex : Avenue Habib Bourguiba, Tunis"
          maxlength="100"
          @input="emit('update:modelValue', { ...modelValue, adresse: ($event.target as HTMLInputElement).value })"
        />
        <span v-if="errors.adresse" class="field-error-text">{{ errors.adresse }}</span>
      </div>

      <!-- Téléphone -->
      <div class="field-group">
        <label class="field-label" for="telephone">
          Téléphone <span class="required-star">*</span>
        </label>
        <input
          id="telephone"
          :value="modelValue.telephone"
          type="text"
          inputmode="numeric"
          class="field-input field-input--mono"
          :class="{ 'field-input--error': errors.telephone }"
          placeholder="XX XXX XXX"
          maxlength="8"
          @input="emit('update:modelValue', { ...modelValue, telephone: ($event.target as HTMLInputElement).value })"
        />
        <span v-if="errors.telephone" class="field-error-text">{{ errors.telephone }}</span>
        <span v-else class="field-hint">8 chiffres</span>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Création en cours…' : '✓ Créer la société' }}
        </button>
        <button type="button" class="btn btn--secondary" @click="$emit('cancel')">
          Annuler
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FormCreerSociete' })

export interface SocieteFormData {
  raisonSociale: string
  email:         string
  adresse:       string
  telephone:     string
}

export interface SocieteFormErrors {
  raisonSociale?: string
  email?:         string
  adresse?:       string
  telephone?:     string
}

const props = defineProps<{
  modelValue: SocieteFormData
  loading:    boolean
  errors:     SocieteFormErrors
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: SocieteFormData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()
</script>

<style scoped>
/* ── Card ──────────────────────────────────────────────────────── */
.tier-form-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(109, 40, 217, 0.1);
  padding: 36px 40px;
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Header ─────────────────────────────────────────────────────── */
.form-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.form-header-icon {
  font-size: 32px;
  line-height: 1;
}
.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
  font-family: 'Outfit', sans-serif;
}
.form-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0;
  font-family: 'Outfit', sans-serif;
}

/* ── Body ───────────────────────────────────────────────────────── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Fields ─────────────────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  font-family: 'Outfit', sans-serif;
}
.required-star { color: #ef4444; margin-left: 2px; }

.field-input {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  color: #1f2937;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
}
.field-input--error { border-color: #ef4444 !important; }
.field-input--mono  { font-family: 'Courier New', monospace; letter-spacing: 1px; }

.field-error-text { font-size: 12px; color: #ef4444; font-family: 'Outfit', sans-serif; }
.field-hint       { font-size: 12px; color: #9ca3af; font-family: 'Outfit', sans-serif; }

/* ── Actions ────────────────────────────────────────────────────── */
.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* ── Buttons ─────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
}
.btn--primary {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  box-shadow: 0 3px 10px rgba(109, 40, 217, 0.3);
}
.btn--primary:hover:not([disabled]) { opacity: 0.9; transform: translateY(-1px); }
.btn--primary[disabled]             { opacity: 0.55; cursor: not-allowed; }
.btn--secondary {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}
.btn--secondary:hover { background: #ede9fe; }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .tier-form-card { border-radius: 0; padding: 24px 16px; }
}
</style>