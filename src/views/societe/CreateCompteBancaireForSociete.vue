<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- Loader -->
      <div v-if="loadingSociete" class="loader-wrapper">
        <div class="spinner"></div>
        <span>Chargement de la société…</span>
      </div>

      <template v-else>
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <button class="breadcrumb-link" @click="router.push({ name: 'Societe' })">← Retour à la société</button>
        </div>

        <!-- Toast succès -->
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

        <!-- Modal ajout banque -->
        <Transition name="modal-fade">
          <div v-if="showAddBanque" class="modal-overlay" @click.self="showAddBanque = false">
            <div class="modal-card">
              <div class="modal-header">
                <div class="modal-icon">🏦</div>
                <div>
                  <h3 class="modal-title">Ajouter une nouvelle banque</h3>
                  <p class="modal-subtitle">Elle sera ajoutée à la liste de sélection.</p>
                </div>
                <button class="modal-close" @click="showAddBanque = false">✕</button>
              </div>
              <div class="modal-body">
                <div class="field-group">
                  <label class="field-label">Nom de la banque <span class="required-star">*</span></label>
                  <input
                    v-model="newBanqueName"
                    type="text"
                    class="field-input"
                    :class="{ 'field-input--error': newBanqueError }"
                    placeholder="Ex : Crédit Agricole France, HSBC…"
                    @keydown.enter="handleAddBanque"
                    ref="newBanqueInput"
                  />
                  <span v-if="newBanqueError" class="field-error-text">{{ newBanqueError }}</span>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn--primary" :disabled="addingBanque" @click="handleAddBanque">
                  <span v-if="addingBanque" class="btn-spinner"></span>
                  {{ addingBanque ? 'Ajout…' : '✓ Ajouter la banque' }}
                </button>
                <button class="btn btn--secondary" @click="showAddBanque = false">Annuler</button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Panel formulaire -->
        <div class="cb-panel">
          <div class="cb-panel-header">
            <div class="header-icon">🏦</div>
            <div>
              <h2 class="cb-panel-title">Nouveau Compte Bancaire</h2>
              <p class="cb-panel-subtitle">
                Pour la société : <strong>{{ societeName }}</strong>
              </p>
            </div>
          </div>

          <div class="cb-form">
            <!-- RIB -->
            <div class="field-group">
              <label class="field-label">RIB <span class="required-star">*</span></label>
              <input
                v-model="cbForm.rib"
                type="text"
                inputmode="numeric"
                class="field-input field-input--mono"
                :class="{ 'field-input--error': cbErrors.rib }"
                placeholder="XX XXXX XXXXXXXXXXXXXXXX"
                @input="onRibInput"
                @keydown="onRibKeydown"
              />
              <span v-if="cbErrors.rib" class="field-error-text">{{ cbErrors.rib }}</span>
              <template v-else>
                <div class="rib-progress">
                  <div
                    class="rib-progress-bar"
                    :class="ribProgressClass"
                    :style="{ width: ribProgressWidth }"
                  ></div>
                </div>
                <span class="field-hint">{{ ribDigitCount }}/20 chiffres — les espaces sont autorisés</span>
              </template>
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
              <div class="label-row">
                <label class="field-label">Banque <span class="required-star">*</span></label>
                <button type="button" class="add-banque-link" @click="openAddBanque">
                  + Banque introuvable ? Ajouter
                </button>
              </div>
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

            <!-- Titulaire (non modifiable) -->
            <div class="field-group">
              <label class="field-label">Titulaire</label>
              <div class="field-fixed">
                <span class="fixed-badge fixed-badge--societe">Société</span>
                <span class="fixed-name">{{ societeName }}</span>
              </div>
              <span class="field-hint">Le titulaire est défini automatiquement.</span>
            </div>

            <div class="cb-form-actions">
              <button class="btn btn--primary" :disabled="cbLoading" @click="handleCreateCB">
                <span v-if="cbLoading" class="btn-spinner"></span>
                {{ cbLoading ? 'Création…' : '✓ Créer le compte bancaire' }}
              </button>
              <button class="btn btn--secondary" @click="router.push({ name: 'Societe' })">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { societeApi } from '@/api/societe.api'
import { banquesApi } from '@/api/banques.api'
import { comptesBancairesApi } from '@/api/comptesBancaires.api'
import type { Banque } from '@/types/banques'

const router    = useRouter()
const route     = useRoute()
const societeId = Number(route.params.societeId)

const societeName    = ref('')
const loadingSociete = ref(false)

const banques        = ref<Banque[]>([])
const loadingBanques = ref(false)

const cbForm    = reactive({ rib: '', adresse_agence: '', banque_id: '' as number | '' })
const cbErrors  = reactive<{ rib?: string; adresse_agence?: string; banque_id?: string }>({})
const cbLoading = ref(false)
const cbSuccess = ref(false)
const cbError   = ref<string | null>(null)

// ── Modal ajout banque ───────────────────────────────────────────────
const showAddBanque  = ref(false)
const newBanqueName  = ref('')
const newBanqueError = ref('')
const addingBanque   = ref(false)
const newBanqueInput = ref<HTMLInputElement | null>(null)

function openAddBanque() {
  newBanqueName.value  = ''
  newBanqueError.value = ''
  showAddBanque.value  = true
  nextTick(() => newBanqueInput.value?.focus())
}

async function handleAddBanque() {
  newBanqueError.value = ''
  if (!newBanqueName.value.trim()) {
    newBanqueError.value = 'Le nom de la banque est requis.'
    return
  }
  addingBanque.value = true
  try {
    const res = await banquesApi.create({ nomBanque: newBanqueName.value.trim() })
    banques.value.push(res.data)
    cbForm.banque_id = res.data.id
    showAddBanque.value = false
  } catch {
    newBanqueError.value = 'Erreur lors de la création de la banque.'
  } finally {
    addingBanque.value = false
  }
}

// ── RIB helpers ──────────────────────────────────────────────────────
const ribDigitCount = computed(() => cbForm.rib.replace(/\D/g, '').length)
const ribProgressWidth = computed(() => `${(ribDigitCount.value / 20) * 100}%`)
const ribProgressClass = computed(() => {
  const n = ribDigitCount.value
  if (n === 20) return 'rib-progress-bar--complete'
  if (n >= 10)  return 'rib-progress-bar--mid'
  return 'rib-progress-bar--low'
})

function onRibKeydown(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (allowed.includes(e.key)) return
  if (ribDigitCount.value >= 20 && /^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

function onRibInput() {
  const digits = cbForm.rib.replace(/\D/g, '').slice(0, 20)
  let formatted = digits
  if (digits.length > 2)  formatted = digits.slice(0, 2) + ' ' + digits.slice(2)
  if (digits.length > 6)  formatted = formatted.slice(0, 7) + ' ' + digits.slice(6)
  cbForm.rib = formatted
}

onMounted(async () => {
  loadingSociete.value = true
  loadingBanques.value = true
  try {
    const [societeRes, banquesRes] = await Promise.all([
      societeApi.getOne(societeId),
      banquesApi.getAll(),
    ])
    societeName.value = societeRes.data.raisonSociale
    banques.value     = banquesRes.data
  } catch {
    cbError.value = 'Impossible de charger les données.'
  } finally {
    loadingSociete.value = false
    loadingBanques.value = false
  }
})

function validateCB(): boolean {
  Object.keys(cbErrors).forEach(k => { delete cbErrors[k as keyof typeof cbErrors] })
  const ribDigits = cbForm.rib.replace(/\D/g, '')
  if (!ribDigits) {
    cbErrors.rib = 'Le RIB est requis.'
  } else if (ribDigits.length !== 20) {
    cbErrors.rib = `Le RIB doit contenir exactement 20 chiffres (${ribDigits.length}/20 saisis).`
  }
  if (!cbForm.adresse_agence.trim()) cbErrors.adresse_agence = "L'adresse de l'agence est requise."
  if (!cbForm.banque_id) cbErrors.banque_id = 'Veuillez sélectionner une banque.'
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
      titulaire_type: 'App\\Models\\Societe',
      titulaire_id:   societeId,
    })
    cbSuccess.value = true
    setTimeout(() => { router.push({ name: 'Societe' }) }, 2000)
  } catch (e: unknown) {
    cbError.value = e instanceof Error ? e.message : 'Erreur lors de la création du compte bancaire.'
  } finally {
    cbLoading.value = false
  }
}
</script>

<style scoped>
.page-layout { display: flex; min-height: 100vh; background: #f8f7ff; }
.page-content { flex: 1; margin-left: 240px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 40px 24px; gap: 16px; overflow-y: auto; }

.breadcrumb { width: 100%; max-width: 580px; }
.breadcrumb-link { background: none; border: none; cursor: pointer; color: #7c3aed; font-size: 14px; font-weight: 600; font-family: 'Outfit', sans-serif; padding: 0; }
.breadcrumb-link:hover { text-decoration: underline; }

.loader-wrapper { display: flex; align-items: center; gap: 12px; color: #7c3aed; font-size: 14px; }
.spinner { width: 24px; height: 24px; border: 3px solid #ede9fe; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; max-width: 580px; width: 100%; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.toast--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
.toast-close { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: 0.6; font-size: 12px; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(15,10,40,0.45); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(91,33,182,0.18); padding: 32px 36px; max-width: 460px; width: 100%; display: flex; flex-direction: column; gap: 20px; }
.modal-header { display: flex; align-items: flex-start; gap: 14px; }
.modal-icon { font-size: 30px; margin-top: 2px; }
.modal-title { font-size: 17px; font-weight: 700; color: #1e1b4b; margin: 0 0 3px; font-family: 'Outfit', sans-serif; }
.modal-subtitle { font-size: 13px; color: #6b7280; margin: 0; font-family: 'Outfit', sans-serif; }
.modal-close { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 16px; color: #9ca3af; padding: 4px 8px; border-radius: 8px; line-height: 1; }
.modal-close:hover { background: #f5f3ff; color: #7c3aed; }
.modal-body { display: flex; flex-direction: column; gap: 14px; }
.modal-footer { display: flex; gap: 10px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.96); }

.cb-panel { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(109,40,217,0.1); padding: 36px 40px; max-width: 580px; width: 100%; display: flex; flex-direction: column; gap: 24px; }
.cb-panel-header { display: flex; align-items: center; gap: 16px; }
.header-icon { font-size: 36px; }
.cb-panel-title { font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.cb-panel-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0; font-family: 'Outfit', sans-serif; }

.cb-form { display: flex; flex-direction: column; gap: 18px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }

.label-row { display: flex; align-items: center; justify-content: space-between; }
.add-banque-link { background: none; border: none; cursor: pointer; color: #7c3aed; font-size: 12px; font-weight: 600; font-family: 'Outfit', sans-serif; padding: 0; text-decoration: underline; text-underline-offset: 2px; }
.add-banque-link:hover { color: #5b21b6; }

.field-label { font-size: 13px; font-weight: 600; color: #374151; font-family: 'Outfit', sans-serif; }
.required-star { color: #ef4444; margin-left: 2px; }
.field-input { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'Outfit', sans-serif; color: #1f2937; background: #fff; transition: border-color 0.2s; outline: none; width: 100%; }
.field-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
.field-input--error { border-color: #ef4444 !important; }
.field-input--mono { font-family: 'Courier New', monospace; letter-spacing: 1px; }
.field-error-text { font-size: 12px; color: #ef4444; font-family: 'Outfit', sans-serif; }
.field-hint { font-size: 12px; color: #9ca3af; font-family: 'Outfit', sans-serif; }

.rib-progress { height: 4px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
.rib-progress-bar { height: 100%; border-radius: 99px; transition: width 0.2s ease, background-color 0.3s ease; }
.rib-progress-bar--low      { background: #f87171; }
.rib-progress-bar--mid      { background: #fbbf24; }
.rib-progress-bar--complete { background: #22c55e; }

.field-fixed { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1.5px solid #e9e5f5; border-radius: 10px; background: #faf9ff; }
.fixed-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
.fixed-badge--societe { background: #fce7f3; color: #9d174d; }
.fixed-name { font-size: 14px; font-weight: 600; color: #1e1b4b; font-family: 'Outfit', sans-serif; }

.cb-form-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Outfit', sans-serif; }
.btn--primary { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; box-shadow: 0 3px 10px rgba(109,40,217,0.3); }
.btn--primary:hover:not([disabled]) { opacity: 0.9; transform: translateY(-1px); }
.btn--primary[disabled] { opacity: 0.55; cursor: not-allowed; }
.btn--secondary { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
.btn--secondary:hover { background: #ede9fe; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }

@media (max-width: 768px) { .page-content { margin-left: 0; padding: 80px 16px 24px; } }
</style>