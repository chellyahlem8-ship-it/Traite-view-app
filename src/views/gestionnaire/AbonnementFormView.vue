<template>
  <div class="page-content">

    <!-- ── Toasts ────────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div v-if="generalError" class="toast toast--error" role="alert">
        <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0
               00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414
               1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414
               10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586
               8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ generalError }}</span>
        <button class="toast-close" @click="generalError = null">✕</button>
      </div>
    </Transition>

    <Transition name="slide-down">
      <div v-if="success" class="toast toast--success" role="status">
        <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0
               00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414
               1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>{{ isEdit ? 'Abonnement modifié' : 'Abonnement créé' }} avec succès !</span>
      </div>
    </Transition>

    <!-- ── Loader initial ─────────────────────────────────────── -->
    <div v-if="loadingInit" class="loader-center">
      <div class="spinner" />
      <span>Chargement de l'abonnement…</span>
    </div>

    <!-- ── Carte formulaire ───────────────────────────────────── -->
    <div v-else class="abonnement-form-card">

      <!-- Header -->
      <div class="form-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0
                 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 class="form-title">{{ isEdit ? "Modifier l'abonnement" : 'Nouvel abonnement' }}</h2>
          <p class="form-subtitle">
            {{ isEdit ? 'Mettez à jour les informations.' : "Remplissez les informations de l'abonnement." }}
          </p>
        </div>
      </div>

      <form class="form-body" novalidate @submit.prevent="handleSubmit">

        <!-- ── Section : Contrat ───────────────────────────── -->
        <section class="form-section">
          <h3 class="section-label">
            <span class="section-dot" /> Contrat
          </h3>

          <div class="field-row">

            <!-- Société -->
            <div class="field-group">
              <label class="field-label">
                Société <span class="required-star">*</span>
              </label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1
                       1 0 01-1-1V4zm3 1h6v4H7V5zm0 6h2v2H7v-2zm4 0h2v2h-2v-2z"
                    clip-rule="evenodd" />
                </svg>
                <select
                  v-model="form.idSociete"
                  class="field-input field-input--icon field-select"
                  :class="{ 'field-input--error': errors.idSociete }"
                >
                  <option value="">Sélectionner une société…</option>
                  <option v-for="s in societes" :key="s.idSociete" :value="s.idSociete">
                    {{ s.nomSociete }}
                  </option>
                </select>
              </div>
              <span v-if="errors.idSociete" class="field-error-text">{{ errors.idSociete }}</span>
            </div>

            <!-- Tarif -->
            <div class="field-group">
              <label class="field-label">
                Tarif <span class="required-star">*</span>
              </label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414
                       0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0
                       .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd" />
                </svg>
                <select
                  v-model="form.idTarif"
                  class="field-input field-input--icon field-select"
                  :class="{ 'field-input--error': errors.idTarif }"
                >
                  <option value="">Sélectionner un tarif…</option>
                  <option v-for="t in tarifs" :key="t.idTarif" :value="t.idTarif">
                    {{ t.nomTarif }}
                  </option>
                </select>
              </div>
              <span v-if="errors.idTarif" class="field-error-text">{{ errors.idTarif }}</span>
            </div>
          </div>

          <!-- Durée -->
          <div class="field-group">
            <label class="field-label">Durée <span class="required-star">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0
                     10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0
                     101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <select
                v-model="form.duree"
                class="field-input field-input--icon field-select"
                :class="{ 'field-input--error': errors.duree }"
              >
                <option value="">Sélectionner une durée…</option>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="semestriel">Semestriel</option>
                <option value="annuel">Annuel</option>
                <option value="biennal">Biennal (2 ans)</option>
              </select>
            </div>
            <span v-if="errors.duree" class="field-error-text">{{ errors.duree }}</span>
          </div>
        </section>

        <!-- ── Section : Période ───────────────────────────── -->
        <section class="form-section">
          <h3 class="section-label">
            <span class="section-dot" /> Période
          </h3>

          <div class="field-row">

            <!-- Date début -->
            <div class="field-group">
              <label class="field-label">
                Date de début <span class="required-star">*</span>
              </label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002
                       2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2
                       0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0
                       100-2H6z" clip-rule="evenodd" />
                </svg>
                <input
                  v-model="form.dateDebut"
                  type="date"
                  class="field-input field-input--icon"
                  :class="{ 'field-input--error': errors.dateDebut }"
                />
              </div>
              <span v-if="errors.dateDebut" class="field-error-text">{{ errors.dateDebut }}</span>
            </div>

            <!-- Date fin -->
            <div class="field-group">
              <label class="field-label">
                Date de fin <span class="required-star">*</span>
              </label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002
                       2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2
                       0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0
                       100-2H6z" clip-rule="evenodd" />
                </svg>
                <input
                  v-model="form.dateFin"
                  type="date"
                  class="field-input field-input--icon"
                  :class="{ 'field-input--error': errors.dateFin }"
                  :min="form.dateDebut || undefined"
                />
              </div>
              <span v-if="errors.dateFin" class="field-error-text">{{ errors.dateFin }}</span>
              <span v-if="dureeCalculee" class="field-hint">⏱ {{ dureeCalculee }}</span>
            </div>
          </div>
        </section>

        <!-- ── Actions ─────────────────────────────────────── -->
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
              {{ loading ? 'Enregistrement…' : (isEdit ? 'Enregistrer les modifications' : "Créer l'abonnement") }}
            </span>
          </button>
          <button type="button" class="btn btn--outline" :disabled="loading" @click="goBack">
            Annuler
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAbonnementForm } from '@/composables/useAbonnements'
import type { AbonnementFormData, Societe, Tarif } from '@/composables/useAbonnements'

const router = useRouter()
const route  = useRoute()

// ── Mode création / édition (route unifiée) ───────────────────
const isEdit = computed(() => !!route.params.id)
const abonId = computed(() => Number(route.params.id))

// ── Composable ────────────────────────────────────────────────
const {
  loading, success, generalError, errors,
  createAbonnement, updateAbonnement, fetchOne, fetchSocietesEtTarifs,
} = useAbonnementForm()

// ── Formulaire ────────────────────────────────────────────────
const form = reactive<AbonnementFormData>({
  dateDebut: '', dateFin: '', duree: '', idSociete: '', idTarif: '',
})

const societes    = ref<Societe[]>([])
const tarifs      = ref<Tarif[]>([])
const loadingInit = ref(false)

// ── Aperçu durée calculée ─────────────────────────────────────
const dureeCalculee = computed((): string | null => {
  if (!form.dateDebut || !form.dateFin) return null
  const d1 = new Date(form.dateDebut)
  const d2 = new Date(form.dateFin)
  if (d2 <= d1) return null
  const jours = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  if (jours >= 365) return `${Math.round(jours / 365)} an(s)`
  if (jours >= 30)  return `${Math.round(jours / 30)} mois`
  return `${jours} jour(s)`
})

// ── Chargement initial ────────────────────────────────────────
onMounted(async () => {
  loadingInit.value = true
  try {
    const { societes: s, tarifs: t } = await fetchSocietesEtTarifs()
    societes.value = s
    tarifs.value   = t

    if (isEdit.value) {
      const ab = await fetchOne(abonId.value)
      form.dateDebut = ab.dateDebut?.substring(0, 10) ?? ''
      form.dateFin   = ab.dateFin?.substring(0, 10)   ?? ''
      form.duree     = ab.duree     ?? ''
      form.idSociete = ab.idSociete ?? ''
      form.idTarif   = ab.idTarif   ?? ''
    }
  } catch (e: unknown) {
    generalError.value = e instanceof Error ? e.message : 'Impossible de charger les données.'
  } finally {
    loadingInit.value = false
  }
})

// ── Soumission ────────────────────────────────────────────────
async function handleSubmit(): Promise<void> {
  const ok = isEdit.value
    ? await updateAbonnement(abonId.value, form)
    : await createAbonnement(form)
  if (ok) setTimeout(() => router.push({ name: 'AbonnementsListView' }), 1500)
}
function goBack(): void { router.push({ name: 'AbonnementsListView' }) }
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
* { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

/* ── Page ────────────────────────────────────────────────────── */
.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 24px;
  gap: 16px;
  min-height: 100%;

  @media (max-width: 768px) { padding: 24px 16px; }
}

/* ── Loader ──────────────────────────────────────────────────── */
.loader-center {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 80px;
  color: #7c3aed;
  font-size: 14px;
}
.spinner {
  width: 24px; height: 24px;
  border: 3px solid #ede9fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Carte ───────────────────────────────────────────────────── */
.abonnement-form-card {
  --clr-primary:       #5b21b6;
  --clr-primary-light: #7c3aed;
  --clr-primary-bg:    #f5f3ff;
  --clr-border:        #ddd6fe;
  --clr-border-focus:  #7c3aed;
  --clr-text:          #1e1b4b;
  --clr-muted:         #6b7280;
  --clr-error:         #dc2626;
  --clr-error-bg:      #fef2f2;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
  --shadow-card: 0 4px 24px rgba(91,33,182,.10), 0 1px 4px rgba(0,0,0,.04);
  --transition: .18s ease;

  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px 36px 28px;
  max-width: 620px;
  width: 100%;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--clr-border);
}

/* ── Header ──────────────────────────────────────────────────── */
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
  width: 44px; height: 44px;
  background: var(--clr-primary-bg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clr-primary);
  svg { width: 22px; height: 22px; }
}
.form-title    { font-size: 17px; font-weight: 700; color: var(--clr-text); margin: 0 0 2px; }
.form-subtitle { font-size: 13px; color: var(--clr-muted); margin: 0; }

/* ── Corps ───────────────────────────────────────────────────── */
.form-body    { display: flex; flex-direction: column; gap: 24px; }
.form-section { display: flex; flex-direction: column; gap: 14px; }

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--clr-primary);
  margin: 0;
}
.section-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--clr-primary-light);
}

.field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
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
  transition: border-color var(--transition), box-shadow var(--transition);
  font-family: inherit;

  &::placeholder { color: #a1a1aa; }
  &:focus {
    border-color: var(--clr-border-focus);
    box-shadow: 0 0 0 3px rgba(124,58,237,.12);
  }
  &--error {
    border-color: var(--clr-error) !important;
    background: var(--clr-error-bg);
    &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,.12) !important; }
  }
  &--icon { padding-left: 38px; }
}

.input-wrapper { position: relative; }
.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px; height: 15px;
  color: #a1a1aa;
  pointer-events: none;
  transition: color var(--transition);
}
.input-wrapper:focus-within .input-icon { color: var(--clr-primary-light); }
.field-select { appearance: none; cursor: pointer; }
.field-error-text { font-size: 12px; color: var(--clr-error); }
.field-hint       { font-size: 12px; color: var(--clr-primary); font-weight: 500; }

/* ── Actions ─────────────────────────────────────────────────── */
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

  &--primary {
    flex: 1;
    background: linear-gradient(135deg, var(--clr-primary-light) 0%, var(--clr-primary) 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(91,33,182,.28);
    &:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(91,33,182,.36); transform: translateY(-1px); }
  }
  &--outline {
    background: transparent;
    color: var(--clr-muted);
    border: 1.5px solid var(--clr-border);
    &:hover:not(:disabled) { border-color: #c4b5fd; color: var(--clr-primary); background: var(--clr-primary-bg); }
  }
  &:disabled { opacity: .55; cursor: not-allowed; transform: none; }
}
.btn-inner { display: flex; align-items: center; gap: 8px; }
.btn-icon  { width: 16px; height: 16px; flex-shrink: 0; }
.btn-icon--spin { animation: spin .8s linear infinite; }

/* ── Toasts ──────────────────────────────────────────────────── */
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  max-width: 580px;
  width: 100%;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);

  &--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  &--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
}
.toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: .6;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover { opacity: 1; background: rgba(0,0,0,.06); }
}

.slide-down-enter-active,
.slide-down-leave-active { transition: all .25s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }

@media (max-width: 600px) {
  .abonnement-form-card { padding: 20px 18px; border-radius: 0; border-left: none; border-right: none; box-shadow: none; }
  .field-row    { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .btn--outline { order: 1; }
}
</style>