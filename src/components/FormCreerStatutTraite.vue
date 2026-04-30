<template>
  <div class="statut-form-card">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="form-header">
      <div class="header-icon">
        <!-- Icône "tag / statut" -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010
               2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4
               0 014-4z" />
        </svg>
      </div>
      <div>
        <h2 class="form-title">Nouveau Statut Traité</h2>
        <p class="form-subtitle">Enregistrez un statut de traitement.</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="emit('submit')">

      <!-- ── SECTION : Identité ─────────────────────────────── -->
      <section class="form-section">
        <h3 class="section-label">
          <span class="section-dot" />
          Identité
        </h3>

        <!-- Libellé du statut -->
        <div class="field-group">
          <label class="field-label">
            Libellé du Statut <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0
                   01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0
                   013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1
                   1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd" />
            </svg>
            <input
              :value="modelValue.statut"
              type="text"
              class="field-input field-input--icon"
              :class="{ 'field-input--error': errors?.statut }"
              placeholder="Ex : Traité, En attente, Rejeté…"
              @input="patch('statut', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <span v-if="errors?.statut" class="field-error-text">
            {{ errors.statut }}
          </span>
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
                   1 0 011.414 0z"
                clip-rule="evenodd" />
            </svg>
            {{ loading ? 'Enregistrement…' : 'Créer le Statut' }}
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
export interface StatutTraiteFormData {
  statut: string
}

export interface StatutTraiteFormErrors {
  statut?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: StatutTraiteFormData
    loading?: boolean
    errors?: StatutTraiteFormErrors
  }>(),
  {
    loading: false,
    errors: () => ({}),
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: StatutTraiteFormData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

function patch<K extends keyof StatutTraiteFormData>(key: K, value: StatutTraiteFormData[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
/* ── Variables ─────────────────────────────────────────────────── */
.statut-form-card {
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

/* ── Header ────────────────────────────────────────────────────── */
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

/* ── Body / Sections ───────────────────────────────────────────── */
.form-body { display: flex; flex-direction: column; gap: 24px; }
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
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--clr-primary-light);
}

/* ── Fields ────────────────────────────────────────────────────── */
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 13px; font-weight: 600; color: var(--clr-text); }
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
.field-input--error {
  border-color: var(--clr-error) !important;
  background: var(--clr-error-bg);
}
.field-input--error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12) !important;
}
.field-error-text { font-size: 12px; color: var(--clr-error); }

.input-wrapper { position: relative; }
.input-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  width: 15px; height: 15px;
  color: #a1a1aa;
  pointer-events: none;
  transition: color var(--transition);
}
.field-input--icon { padding-left: 38px; }
.input-wrapper:focus-within .input-icon { color: var(--clr-primary-light); }

/* ── Boutons ───────────────────────────────────────────────────── */
.form-actions { display: flex; gap: 12px; padding-top: 8px; }

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
.btn-inner { display: flex; align-items: center; gap: 8px; }
.btn-icon { width: 16px; height: 16px; flex-shrink: 0; }
.btn-icon--spin { animation: spin 0.8s linear infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .statut-form-card {
    padding: 20px 18px;
    border-radius: 0;
    border-left: none; border-right: none;
    box-shadow: none;
  }
  .form-actions { flex-direction: column; }
  .btn--outline  { order: 1; }
}
</style>