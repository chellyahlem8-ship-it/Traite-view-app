<template>
  <!-- ═══════════════════════════════════════════════════════════
       CreateTier.vue — Composant conteneur (smart component)
       ✅ Contient toute la logique métier : API, store, validation
       ✅ Passe les données et handlers à <TierForm /> via props/emits
       ✅ TierForm reste 100% présentationnel
       ═══════════════════════════════════════════════════════════ -->
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- ── Notifications globales (succès / erreur) ─────────── -->
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

      <!-- ── Composant UI (100% présentationnel) ──────────────── -->
      <!--
        v-model           → synchronise formState ↔ TierForm
        :typesTiers       → liste chargée depuis l'API
        :loadingTypes     → état de chargement du select
        :loading          → état de soumission
        :errors           → erreurs de validation champ par champ
        @submit           → déclenche createTier()
        @cancel           → déclenche resetForm()
      -->
      <TierForm
        v-model="formState"
        :types-tiers="typesTiers"
        :loading-types="loadingTypes"
        :loading="loading"
        :errors="errors"
        @submit="handleSubmit"
        @cancel="resetForm"
      />

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TierForm from '@/components/FormCreerTier.vue'
import type { TierFormData, TypeTierOption, TierFormErrors } from '@/components/FormCreerTier.vue'
import { tiersApi, typesTiersApi } from '@/api/tiers.api'
import { useAuthStore } from '@/stores/auth.store'

// ── Auth Store — récupère l'idSociete de l'utilisateur connecté ──
const authStore = useAuthStore()
const currentSocieteId = authStore.user?.idSociete ?? 0

// ── État du formulaire (v-model vers TierForm) ───────────────────
const formState = ref<TierFormData>({
  raison_sociale:  '',
  email:           '',
  adresse:         '',
  num_tel:         '',
  types_tiers_id:  '',
  // idSociete est un champ métier géré ici, pas dans le formulaire UI
})

// ── Erreurs de validation (passées à TierForm via :errors) ───────
const errors = reactive<TierFormErrors>({})

// ── Types de tiers — chargés depuis l'API au montage ─────────────
const typesTiers   = ref<TypeTierOption[]>([])
const loadingTypes = ref(false)

// ── États de soumission ───────────────────────────────────────────
const loading      = ref(false)
const success      = ref(false)
const generalError = ref<string | null>(null)

// ── Chargement des types de tiers depuis GET /api/types-tiers ────
// Alimenté le <select> de TierForm via la prop :typesTiers
onMounted(async () => {
  loadingTypes.value = true
  try {
    const res = await typesTiersApi.getAll()
    typesTiers.value = res.data.map((t: any) => ({ id: t.id, label: t.type }))  // [{ id: 1, type: 'Client' }, ...]
  } catch {
    generalError.value = 'Impossible de charger les types de tiers.'
  } finally {
    loadingTypes.value = false
  }
})

// ── Validation locale ────────────────────────────────────────────
function validate(): boolean {
  // Réinitialiser les erreurs
  Object.keys(errors).forEach((k) => {delete errors[k as keyof TierFormErrors]})

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

// ── Soumission (POST /api/tiers) ─────────────────────────────────
// handleSubmit est appelé par l'emit @submit de TierForm
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
      idSociete:       currentSocieteId,  // injecté ici, pas dans le formulaire UI
    }

    const res = await tiersApi.create(payload)
    success.value = true

    // Optionnel : émettre vers un parent ou router
    // emit('created', res.data)

    resetForm()

    // Masquer le message de succès après 4s
    setTimeout(() => { success.value = false }, 4000)
  } catch (e: unknown) {
    generalError.value = e instanceof Error
      ? e.message
      : 'Une erreur est survenue lors de la création.'
  } finally {
    loading.value = false
  }
}

// ── Réinitialisation (déclenché par @cancel de TierForm) ─────────
function resetForm() {
  formState.value = {
    raison_sociale: '',
    email:          '',
    adresse:        '',
    num_tel:        '',
    types_tiers_id: '',
  }
  Object.keys(errors).forEach((k) => {delete errors[k as keyof TierFormErrors]})
  generalError.value = null
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

.toast--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.toast--success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

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

/* ── Transitions ─────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-content {
    margin-left: 0;
    padding: 80px 16px 24px;
  }
}
@media (max-width: 600px) {
  .page-content {
    padding: 80px 0 24px;
  }
}
</style>