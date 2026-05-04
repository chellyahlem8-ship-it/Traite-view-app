<template>
  <div class="page-layout">
    <Sidebar />
    <main class="page-main">
      <div class="edit-container">

        <!-- Header -->
        <div class="page-header">
          <button class="btn-back" @click="router.push({ name: 'Traites' })">
            <svg viewBox="0 0 20 20" fill="currentColor" class="back-icon">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
            Retour à la liste
          </button>
          <h1 class="page-title">Modifier la traite <span class="traite-id">#{{ id }}</span></h1>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-wrap">
          <div class="spinner"></div>
          <p>Chargement de la traite…</p>
        </div>

        <!-- Error state -->
        <div v-else-if="loadError" class="alert alert-error">
          <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {{ loadError }}
        </div>

        <!-- Edit form -->
        <form v-else-if="traite" class="edit-form" @submit.prevent="handleSave">

          <!-- Info non modifiable -->
          <div class="form-section">
            <h3 class="section-title">Informations (non modifiables)</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Type</span>
                <span class="info-value">
                  <span :class="['badge', traite.type_traite === 'client' ? 'badge-client' : 'badge-fourn']">
                    {{ traite.type_traite === 'client' ? 'Client' : 'Fournisseur' }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Numéro</span>
                <span class="info-value mono">#{{ traite.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date d'émission</span>
                <span class="info-value">{{ formatDate(traite.date_emission) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tireur</span>
                <span class="info-value">{{ traite.tireur?.raison_sociale ?? '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Champs modifiables -->
          <div class="form-section">
            <h3 class="section-title">Champs modifiables</h3>

            <div class="field-row">
              <!-- Montant -->
              <div class="field-group">
                <label class="field-label">Montant (DT) <span class="required">*</span></label>
                <input
                  type="number"
                  class="field-input"
                  v-model.number="formData.montant"
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                />
                <p v-if="fieldErrors.montant" class="field-error">{{ fieldErrors.montant }}</p>
              </div>

              <!-- Date d'échéance -->
              <div class="field-group">
                <label class="field-label">Date d'échéance <span class="required">*</span></label>
                <input
                  type="date"
                  class="field-input"
                  v-model="formData.date_echeance"
                  :min="traite.date_emission"
                />
                <p v-if="fieldErrors.date_echeance" class="field-error">{{ fieldErrors.date_echeance }}</p>
              </div>
            </div>

            <!-- Statut -->
            <div class="field-group">
              <label class="field-label">Statut <span class="required">*</span></label>
              <div class="select-wrapper">
                <select class="field-select" v-model.number="formData.statuts_traites_id" :disabled="loadingStatuts">
                  <option value="">{{ loadingStatuts ? 'Chargement…' : '— Sélectionner un statut —' }}</option>
                  <option v-for="st in statuts" :key="st.id" :value="st.id">{{ st.statut }}</option>
                </select>
                <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p v-if="fieldErrors.statuts_traites_id" class="field-error">{{ fieldErrors.statuts_traites_id }}</p>
            </div>
          </div>

          <!-- Feedback messages -->
          <Transition name="fade">
            <div v-if="saveError" class="alert alert-error">⚠ {{ saveError }}</div>
          </Transition>
          <Transition name="fade">
            <div v-if="saveSuccess" class="alert alert-success">✓ Traite modifiée avec succès !</div>
          </Transition>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'Traites' })">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <svg v-if="saving" class="btn-icon spin" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
              </svg>
              {{ saving ? 'Enregistrement…' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

const props = defineProps<{ id: string | number }>()
const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function getToken(): string | null { return localStorage.getItem('traity_token') }
function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── State ──────────────────────────────────────────────────────────────────
interface StatutTraite { id: number; statut: string }
interface TireurInfo   { id: number; raison_sociale: string }
interface TraiteDetail {
  id: number
  montant: number
  type_traite: 'client' | 'fournisseur'
  date_emission: string
  date_echeance: string
  statuts_traites_id: number
  tireur?: TireurInfo | null
  statutTraite?: { id: number; statut: string } | null
  statut_traite?: { id: number; statut: string } | null
}

const traite       = ref<TraiteDetail | null>(null)
const statuts      = ref<StatutTraite[]>([])
const loading      = ref(false)
const loadError    = ref<string | null>(null)
const loadingStatuts = ref(false)
const saving       = ref(false)
const saveError    = ref<string | null>(null)
const saveSuccess  = ref(false)

const formData = reactive({
  montant:             0,
  date_echeance:       '',
  statuts_traites_id:  null as number | null,
})

const fieldErrors = reactive({
  montant:            '',
  date_echeance:      '',
  statuts_traites_id: '',
})

// ── Load traite ────────────────────────────────────────────────────────────
async function loadTraite(): Promise<void> {
  loading.value  = true
  loadError.value = null
  try {
    const res = await fetch(`${API_BASE_URL}/traites/${props.id}`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data: TraiteDetail = json.data ?? json

    traite.value = data

    // Pré-remplir le formulaire avec les valeurs actuelles
    formData.montant            = data.montant
    formData.date_echeance      = data.date_echeance?.split('T')[0] ?? ''
    formData.statuts_traites_id = data.statuts_traites_id ?? null
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : 'Impossible de charger la traite.'
  } finally {
    loading.value = false
  }
}

// ── Load statuts ───────────────────────────────────────────────────────────
async function loadStatuts(): Promise<void> {
  loadingStatuts.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/statuts-traites`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    statuts.value = json.data ?? json ?? []
  } catch {
    statuts.value = []
  } finally {
    loadingStatuts.value = false
  }
}

// ── Validation ─────────────────────────────────────────────────────────────
function validate(): boolean {
  fieldErrors.montant            = ''
  fieldErrors.date_echeance      = ''
  fieldErrors.statuts_traites_id = ''
  let ok = true

  if (!formData.montant || formData.montant <= 0) {
    fieldErrors.montant = 'Le montant doit être supérieur à 0.'
    ok = false
  }
  if (!formData.date_echeance) {
    fieldErrors.date_echeance = "La date d'échéance est requise."
    ok = false
  }
  if (!formData.statuts_traites_id) {
    fieldErrors.statuts_traites_id = 'Veuillez sélectionner un statut.'
    ok = false
  }
  return ok
}

// ── Save ───────────────────────────────────────────────────────────────────
async function handleSave(): Promise<void> {
  if (!validate()) return

  saving.value    = true
  saveError.value = null
  saveSuccess.value = false

  try {
    const payload = {
      montant:             formData.montant,
      date_echeance:       formData.date_echeance,
      statuts_traites_id:  formData.statuts_traites_id,
    }

    const res = await fetch(`${API_BASE_URL}/traites/${props.id}`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur serveur' }))
      throw new Error(err.message || `Erreur ${res.status}`)
    }

    saveSuccess.value = true
    setTimeout(() => {
      router.push({ name: 'Traites' })
    }, 1200)
  } catch (e: unknown) {
    saveError.value = e instanceof Error ? e.message : 'Erreur inconnue lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d: string): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(() => {
  loadTraite()
  loadStatuts()
})
</script>

<style scoped lang="scss">
.page-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f3ff;
}

.page-main {
  flex: 1;
  padding: 32px 24px;
  overflow-y: auto;
}

.edit-container {
  max-width: 700px;
  margin: 0 auto;
}

// ── Header ────────────────────────────────────────────────────────────────
.page-header {
  margin-bottom: 28px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  color: #6d28d9;
  font-weight: 600;
  padding: 0;
  margin-bottom: 12px;
  transition: opacity 0.15s;
  &:hover { opacity: 0.75; }
}

.back-icon { width: 16px; height: 16px; }

.page-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e1b4b;
  margin: 0;
}

.traite-id {
  color: #7c3aed;
}

// ── Form sections ─────────────────────────────────────────────────────────
.edit-form {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #e9e5f5;
  padding: 28px 28px 24px;
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.07);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #7c3aed;
  margin: 0 0 4px;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #e9e5f5;
}

// ── Info grid ─────────────────────────────────────────────────────────────
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: #faf9ff;
  border: 1px solid #e9e5f5;
  border-radius: 8px;
  padding: 10px 12px;
}

.info-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.info-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e1b4b;
  &.mono { font-family: 'Courier New', monospace; }
}

// ── Badges ────────────────────────────────────────────────────────────────
.badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-client { background: #dbeafe; color: #1d4ed8; }
.badge-fourn  { background: #fce7f3; color: #be185d; }

// ── Fields ────────────────────────────────────────────────────────────────
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4b5563;
}

.required { color: #dc2626; margin-left: 2px; }

.field-input {
  padding: 9px 12px;
  border: 1.5px solid #d1c7f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.88rem;
  color: #1e1b4b;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fff;
  &:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
}

.field-error {
  font-size: 0.7rem;
  color: #dc2626;
  margin: 0;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  padding: 9px 36px 9px 12px;
  border: 1.5px solid #d1c7f0;
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 0.88rem;
  color: #1e1b4b;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus   { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
  &:disabled { background: #f5f3ff; color: #9ca3af; cursor: not-allowed; }
}

.select-chevron {
  position: absolute;
  right: 10px;
  width: 16px;
  height: 16px;
  color: #7c3aed;
  pointer-events: none;
}

// ── Alerts ────────────────────────────────────────────────────────────────
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
}

.alert-error   { background: #fef2f2; border: 1px solid rgba(220,38,38,.2); color: #b91c1c; }
.alert-success { background: #ecfdf5; border: 1px solid rgba(5,150,105,.2); color: #065f46; }
.alert-icon    { width: 16px; height: 16px; flex-shrink: 0; }

// ── Actions ───────────────────────────────────────────────────────────────
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1.5px solid #e9e5f5;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 22px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.btn-primary {
  background: #7c3aed;
  color: #fff;
  &:hover:not(:disabled) { background: #6d28d9; }
}

.btn-secondary {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1.5px solid #e9e5f5;
  &:hover:not(:disabled) { background: #ede9fe; border-color: #7c3aed; }
}

.btn-icon { width: 16px; height: 16px; }

// ── Loading ───────────────────────────────────────────────────────────────
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 60px 0;
  color: #6b7280;
  font-size: 0.88rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e9e5f5;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Transitions ───────────────────────────────────────────────────────────
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

// ── Responsive ────────────────────────────────────────────────────────────
@media (max-width: 640px) {
  .field-row  { grid-template-columns: 1fr; }
  .info-grid  { grid-template-columns: 1fr; }
  .page-main  { padding: 16px 12px; }
  .edit-form  { padding: 18px 16px; }
  .form-actions { flex-direction: column-reverse; }
  .btn { justify-content: center; }
}
</style>