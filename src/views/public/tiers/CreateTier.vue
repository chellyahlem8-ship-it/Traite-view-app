<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- ── Notifications globales ─────────── -->
      <Transition name="slide-down">
        <div v-if="generalError" class="toast toast--error" role="alert">
          <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
          <span>{{ generalError }}</span>
          <button class="toast-close" @click="generalError = null">✕</button>
        </div>
      </Transition>

      <Transition name="slide-down">
        <div v-if="success" class="toast toast--success" role="status">
          <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd" />
          </svg>
          <span>Tiers créé avec succès !</span>
        </div>
      </Transition>

      <!-- ── Formulaire tiers ──────────────── -->
      <TierForm
        v-if="!tiersCreated"
        v-model="formState"
        :types-tiers="typesTiers"
        :loading-types="loadingTypes"
        :loading="loading"
        :errors="errors"
        @submit="handleSubmit"
        @cancel="resetForm"
      />

      <!-- ── Section après création : proposition compte bancaire ── -->
      <div v-if="tiersCreated && !showCompteBancaireForm" class="post-create-panel">
        <div class="post-create-icon">✅</div>
        <h2 class="post-create-title">Tiers "{{ createdTierName }}" créé avec succès !</h2>
        <p class="post-create-subtitle">Voulez-vous ajouter un compte bancaire à ce tiers maintenant ?</p>
        <div class="post-create-actions">
          <button class="btn btn--primary" @click="showCompteBancaireForm = true">
            🏦 Créer un compte bancaire à ce tiers
          </button>
          <button class="btn btn--secondary" @click="goToTiers">
            Non, retourner à la liste des tiers
          </button>
        </div>
      </div>

      <!-- ── Formulaire compte bancaire inline ── -->
      <div v-if="tiersCreated && showCompteBancaireForm" class="cb-panel">
        <div class="cb-panel-header">
          <h2 class="cb-panel-title">🏦 Nouveau compte bancaire</h2>
          <p class="cb-panel-subtitle">
            Titulaire : <strong>{{ createdTierName }}</strong> (Tiers)
          </p>
        </div>

        <!-- Toast CB succès -->
        <Transition name="slide-down">
          <div v-if="cbSuccess" class="toast toast--success">
            <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Compte bancaire créé avec succès !</span>
          </div>
        </Transition>
        <Transition name="slide-down">
          <div v-if="cbError" class="toast toast--error">
            <span>{{ cbError }}</span>
            <button class="toast-close" @click="cbError = null">✕</button>
          </div>
        </Transition>

        <div class="cb-form">
          <!-- RIB -->
          <div class="field-group">
            <label class="field-label">RIB <span class="required-star">*</span></label>
            <input
              v-model="cbForm.rib"
              type="text"
              inputmode="numeric"
              maxlength="24"
              class="field-input field-input--mono"
              :class="{ 'field-input--error': cbErrors.rib }"
              placeholder="XX XXXX XXXXXXXXXXXXXXXX"
            />
            <span v-if="cbErrors.rib" class="field-error-text">{{ cbErrors.rib }}</span>
            <span v-else class="field-hint">20 chiffres</span>
          </div>

          <!-- Adresse agence -->
          <div class="field-group">
            <label class="field-label">Adresse de l'agence <span class="required-star">*</span></label>
            <input
              v-model="cbForm.adresse_agence"
              type="text"
              class="field-input"
              :class="{ 'field-input--error': cbErrors.adresse_agence }"
              placeholder="Ex : Avenue Habib Bourguiba, Tunis"
            />
            <span v-if="cbErrors.adresse_agence" class="field-error-text">{{ cbErrors.adresse_agence }}</span>
          </div>

          <!-- Banque -->
          <div class="field-group">
            <label class="field-label">Banque <span class="required-star">*</span></label>
            <select
              v-model="cbForm.banque_id"
              class="field-input"
              :class="{ 'field-input--error': cbErrors.banque_id }"
            >
              <option value="">{{ loadingBanques ? 'Chargement…' : '-- Sélectionner une banque --' }}</option>
              <option v-for="b in banques" :key="b.id" :value="b.id">{{ b.nomBanque }}</option>
            </select>
            <span v-if="cbErrors.banque_id" class="field-error-text">{{ cbErrors.banque_id }}</span>
          </div>

          <!-- Titulaire (fixe, non modifiable) -->
          <div class="field-group">
            <label class="field-label">Titulaire</label>
            <div class="field-fixed">
              <span class="fixed-badge fixed-badge--tier">Tiers</span>
              <span class="fixed-name">{{ createdTierName }}</span>
            </div>
          </div>

          <div class="cb-form-actions">
            <button class="btn btn--primary" :disabled="cbLoading" @click="handleCreateCB">
              <span v-if="cbLoading" class="btn-spinner"></span>
              {{ cbLoading ? 'Création…' : '✓ Créer le compte bancaire' }}
            </button>
            <button class="btn btn--secondary" @click="goToTiers">
              Terminer et retourner à la liste
            </button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import TierForm from '@/components/FormCreerTier.vue'
import type { TierFormData, TypeTierOption, TierFormErrors } from '@/components/FormCreerTier.vue'
import { tiersApi, typesTiersApi } from '@/api/tiers.api'
import { comptesBancairesApi } from '@/api/comptesBancaires.api'
import { banquesApi } from '@/api/banques.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Banque } from '@/types/banques'

const router = useRouter()
const authStore = useAuthStore()
const currentSocieteId = authStore.user?.idSociete ?? 0

// ── État formulaire tiers ────────────────────────────────────────────
const formState = ref<TierFormData>({
  raison_sociale:  '',
  email:           '',
  adresse:         '',
  num_tel:         '',
  types_tiers_id:  '',
})

const errors       = reactive<TierFormErrors>({})
const typesTiers   = ref<TypeTierOption[]>([])
const loadingTypes = ref(false)
const loading      = ref(false)
const success      = ref(false)
const generalError = ref<string | null>(null)

// ── État post-création ──────────────────────────────────────────────
const tiersCreated          = ref(false)
const createdTierId         = ref<number | null>(null)
const createdTierName       = ref('')
const showCompteBancaireForm = ref(false)

// ── État formulaire compte bancaire ──────────────────────────────────
const cbForm = reactive({
  rib:            '',
  adresse_agence: '',
  banque_id:      '' as number | '',
})
const cbErrors  = reactive<{ rib?: string; adresse_agence?: string; banque_id?: string }>({})
const cbLoading = ref(false)
const cbSuccess = ref(false)
const cbError   = ref<string | null>(null)
const banques         = ref<Banque[]>([])
const loadingBanques  = ref(false)

onMounted(async () => {
  loadingTypes.value = true
  loadingBanques.value = true
  try {
    const [typesRes, banquesRes] = await Promise.all([
      typesTiersApi.getAll(),
      banquesApi.getAll(),
    ])
    typesTiers.value = typesRes.data.map((t: any) => ({ id: t.id, label: t.type }))
    banques.value = banquesRes.data
  } catch {
    generalError.value = 'Impossible de charger les données.'
  } finally {
    loadingTypes.value = false
    loadingBanques.value = false
  }
})

// ── Validation tiers ─────────────────────────────────────────────────
function validate(): boolean {
  Object.keys(errors).forEach((k) => { delete errors[k as keyof TierFormErrors] })
  const f = formState.value
  if (!f.raison_sociale.trim()) errors.raison_sociale = 'La raison sociale est obligatoire.'
  if (!f.email.trim()) {
    errors.email = "L'email est obligatoire."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    errors.email = "Format d'email invalide."
  }
  if (!f.adresse.trim()) errors.adresse = "L'adresse est obligatoire."
  const tel = String(f.num_tel).replace(/\s/g, '')
  if (!tel) {
    errors.num_tel = 'Le téléphone est obligatoire.'
  } else if (!/^\d{8,}$/.test(tel)) {
    errors.num_tel = 'Le téléphone doit contenir au moins 8 chiffres.'
  }
  if (!f.types_tiers_id) errors.types_tiers_id = 'Veuillez sélectionner un type de tiers.'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  generalError.value = null
  success.value      = false
  if (!validate()) return
  loading.value = true
  try {
    const payload = {
      raison_sociale:  formState.value.raison_sociale,
      email:           formState.value.email,
      adresse:         formState.value.adresse,
      num_tel:         Number(formState.value.num_tel),
      types_tiers_id:  Number(formState.value.types_tiers_id),
      idSociete:       currentSocieteId,
    }
    const res = await tiersApi.create(payload)
    success.value = true
    createdTierId.value   = res.data.id
    createdTierName.value = res.data.raison_sociale
    tiersCreated.value    = true
    setTimeout(() => { success.value = false }, 4000)
  } catch (e: unknown) {
    generalError.value = e instanceof Error ? e.message : 'Une erreur est survenue lors de la création.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formState.value = { raison_sociale: '', email: '', adresse: '', num_tel: '', types_tiers_id: '' }
  Object.keys(errors).forEach((k) => { delete errors[k as keyof TierFormErrors] })
  generalError.value = null
}

// ── Création compte bancaire ────────────────────────────────────────
function validateCB(): boolean {
  Object.keys(cbErrors).forEach(k => { delete cbErrors[k as keyof typeof cbErrors] })
  const ribDigits = cbForm.rib.replace(/\D/g, '')
  if (!ribDigits) { cbErrors.rib = 'Le RIB est requis.' }
  else if (ribDigits.length !== 20) { cbErrors.rib = `Le RIB doit contenir exactement 20 chiffres (${ribDigits.length}/20 saisis).` }
  if (!cbForm.adresse_agence.trim()) { cbErrors.adresse_agence = "L'adresse de l'agence est requise." }
  if (!cbForm.banque_id) { cbErrors.banque_id = 'Veuillez sélectionner une banque.' }
  return Object.keys(cbErrors).length === 0
}

async function handleCreateCB() {
  if (!validateCB()) return
  cbLoading.value = true
  cbError.value   = null
  cbSuccess.value = false
  try {
    await comptesBancairesApi.create({
      rib:            cbForm.rib.replace(/\D/g, ''),
      adresse_agence: cbForm.adresse_agence.trim(),
      banque_id:      Number(cbForm.banque_id),
      titulaire_type: 'App\\Models\\Tier',
      titulaire_id:   createdTierId.value!,
    })
    cbSuccess.value = true
    setTimeout(() => { router.push({ name: 'Tiers' }) }, 2000)
  } catch (e: unknown) {
    cbError.value = e instanceof Error ? e.message : 'Erreur lors de la création du compte bancaire.'
  } finally {
    cbLoading.value = false
  }
}

function goToTiers() {
  router.push({ name: 'Tiers' })
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────── */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f7ff;
}

.page-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 24px;
  gap: 16px;
  overflow-y: auto;
}

/* ── Toasts ─────────────────────────────────────────────────────── */
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.toast--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
.toast-close { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: 0.6; font-size: 12px; padding: 2px 6px; border-radius: 4px; }
.toast-close:hover { opacity: 1; background: rgba(0,0,0,0.06); }

/* ── Post-create panel ───────────────────────────────────────────── */
.post-create-panel {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(109, 40, 217, 0.1);
  padding: 48px 40px;
  max-width: 560px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.post-create-icon { font-size: 48px; }
.post-create-title { font-size: 22px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.post-create-subtitle { font-size: 15px; color: #6b7280; margin: 0; font-family: 'Outfit', sans-serif; }

.post-create-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

/* ── Compte bancaire panel ───────────────────────────────────────── */
.cb-panel {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(109, 40, 217, 0.1);
  padding: 36px 40px;
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cb-panel-header { display: flex; flex-direction: column; gap: 4px; }
.cb-panel-title { font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.cb-panel-subtitle { font-size: 14px; color: #6b7280; margin: 0; font-family: 'Outfit', sans-serif; }

.cb-form { display: flex; flex-direction: column; gap: 18px; }

.field-group { display: flex; flex-direction: column; gap: 6px; }
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
  transition: border-color 0.2s;
  outline: none;
  width: 100%;
}
.field-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08); }
.field-input--error { border-color: #ef4444 !important; }
.field-input--mono { font-family: 'Courier New', monospace; letter-spacing: 1px; }

.field-error-text { font-size: 12px; color: #ef4444; font-family: 'Outfit', sans-serif; }
.field-hint { font-size: 12px; color: #9ca3af; font-family: 'Outfit', sans-serif; }

/* Titulaire fixe */
.field-fixed {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid #e9e5f5;
  border-radius: 10px;
  background: #faf9ff;
}
.fixed-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  font-family: 'Outfit', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.fixed-badge--tier { background: #ede9fe; color: #6d28d9; }
.fixed-name { font-size: 14px; font-weight: 600; color: #1e1b4b; font-family: 'Outfit', sans-serif; }

.cb-form-actions {
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

  &--primary {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    box-shadow: 0 3px 10px rgba(109, 40, 217, 0.3);
    &:hover:not([disabled]) { opacity: 0.9; transform: translateY(-1px); }
    &[disabled] { opacity: 0.55; cursor: not-allowed; }
  }
  &--secondary {
    background: #f5f3ff;
    color: #6d28d9;
    border: 1px solid #ddd6fe;
    &:hover { background: #ede9fe; }
  }
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ─────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-content { margin-left: 0; padding: 80px 16px 24px; }
}
@media (max-width: 600px) {
  .page-content { padding: 80px 0 24px; }
  .cb-panel, .post-create-panel { border-radius: 0; padding: 24px 16px; }
}
</style>