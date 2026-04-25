<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- ── Toasts ─────────────────────────────────────────────── -->
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
          <span>Tiers modifié avec succès !</span>
        </div>
      </Transition>

      <!-- ── Loader initial ────────────────────────────────────── -->
      <div v-if="loadingTier" class="loader-center">
        <div class="spinner"></div>
        <span>Chargement du tiers…</span>
      </div>

      <!-- ── Formulaire de modification ────────────────────────── -->
      <TierForm
        v-else
        v-model="formState"
        :types-tiers="typesTiers"
        :loading-types="loadingTypes"
        :loading="loading"
        :errors="errors"
        mode="edit"
        @submit="handleSubmit"
        @cancel="goBack"
      />

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import TierForm from '@/components/FormCreerTier.vue'
import type { TierFormData, TypeTierOption, TierFormErrors } from '@/components/FormCreerTier.vue'
import { tiersApi, typesTiersApi } from '@/api/tiers.api'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route  = useRoute()
const authStore = useAuthStore()

const tierId = Number(route.params.id)
const currentSocieteId = authStore.user?.idSociete ?? 0

// ── États ─────────────────────────────────────────────────────
const formState = ref<TierFormData>({
  raison_sociale: '',
  email: '',
  adresse: '',
  num_tel: '',
  types_tiers_id: '',
})

const errors        = reactive<TierFormErrors>({})
const typesTiers    = ref<TypeTierOption[]>([])
const loadingTypes  = ref(false)
const loadingTier   = ref(false)
const loading       = ref(false)
const success       = ref(false)
const generalError  = ref<string | null>(null)

// ── Chargement des données initiales ─────────────────────────
onMounted(async () => {
  loadingTier.value  = true
  loadingTypes.value = true

  try {
    // Charger en parallèle : les types de tiers + le tiers à modifier
    const [typesRes, tierRes] = await Promise.all([
      typesTiersApi.getAll(),
      tiersApi.getOne(tierId),
    ])

    // Remplir le select des types
    typesTiers.value = typesRes.data.map((t: any) => ({ id: t.id, label: t.type }))

    // Pré-remplir le formulaire avec les données du tiers
    const t = tierRes.data
    formState.value = {
      raison_sociale: t.raison_sociale,
      email:          t.email,
      adresse:        t.adresse,
      num_tel:        String(t.num_tel),
      types_tiers_id: String(t.types_tiers_id),
    }
  } catch {
    generalError.value = 'Impossible de charger les données du tiers.'
  } finally {
    loadingTier.value  = false
    loadingTypes.value = false
  }
})

// ── Validation ────────────────────────────────────────────────
function validate(): boolean {
  Object.keys(errors).forEach(k => { delete errors[k as keyof TierFormErrors] })

  const f = formState.value

  if (!f.raison_sociale.trim()) {
    errors.raison_sociale = 'La raison sociale est obligatoire.'
  }

  if (!f.email.trim()) {
    errors.email = "L'email est obligatoire."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    errors.email = "Format d'email invalide."
  }

  if (!f.adresse.trim()) {
    errors.adresse = "L'adresse est obligatoire."
  }

  const tel = String(f.num_tel).replace(/\s/g, '')
  if (!tel) {
    errors.num_tel = 'Le téléphone est obligatoire.'
  } else if (!/^\d{8,}$/.test(tel)) {
    errors.num_tel = 'Le téléphone doit contenir au moins 8 chiffres.'
  }

  if (!f.types_tiers_id) {
    errors.types_tiers_id = 'Veuillez sélectionner un type de tiers.'
  }

  return Object.keys(errors).length === 0
}

// ── Soumission (PUT /api/tiers/:id) ──────────────────────────
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

    await tiersApi.update(tierId, payload)
    success.value = true

    // Rediriger vers la liste après 1.5s
    setTimeout(() => {
      router.push({ name: 'Tiers' })
    }, 1500)
  } catch (e: unknown) {
    generalError.value = e instanceof Error
      ? e.message
      : 'Une erreur est survenue lors de la modification.'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'Tiers' })
}
</script>

<style scoped>
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

/* Loader */
.loader-center {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 80px;
  color: #7c3aed;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ede9fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Toasts */
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
  font-family: 'Outfit', sans-serif;
}

.toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.toast--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }

.toast-icon  { width: 18px; height: 18px; flex-shrink: 0; }

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}
.toast-close:hover { opacity: 1; background: rgba(0,0,0,0.06); }

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }
</style>