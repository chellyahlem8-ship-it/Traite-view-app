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
          <span>Société créée avec succès !</span>
        </div>
      </Transition>

      <!-- ── Formulaire société ──────────────── -->
      <SocieteForm
        v-if="!societeCreated"
        v-model="formState"
        :loading="loading"
        :errors="errors"
        @submit="handleSubmit"
        @cancel="resetForm"
      />

      <!-- ── Section après création ─────────── -->
      <div v-if="societeCreated" class="post-create-panel">
        <div class="post-create-icon">✅</div>
        <h2 class="post-create-title">Société "{{ createdSocieteName }}" créée avec succès !</h2>
        <p class="post-create-subtitle">La société a bien été enregistrée dans le système.</p>
        <div class="post-create-actions">
          <button class="btn btn--primary" @click="createAnother">
            🏢 Créer une autre société
          </button>
          <button class="btn btn--secondary" @click="goToSocietes">
            Ajouter un abonnement à  cette sociétés
          </button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import SocieteForm from '@/components/FormCreerSociete.vue'
import type { SocieteFormData, SocieteFormErrors } from '@/components/FormCreerSociete.vue'
import { societeApi } from '@/api/societe.api'

const router = useRouter()

// ── État formulaire ──────────────────────────────────────────────────
const formState = ref<SocieteFormData>({
  raisonSociale: '',
  email:         '',
  adresse:       '',
  telephone:     '',
})

const errors       = reactive<SocieteFormErrors>({})
const loading      = ref(false)
const success      = ref(false)
const generalError = ref<string | null>(null)

// ── État post-création ───────────────────────────────────────────────
const societeCreated    = ref(false)
const createdSocieteName = ref('')

// ── Validation ───────────────────────────────────────────────────────
function validate(): boolean {
  Object.keys(errors).forEach((k) => { delete errors[k as keyof SocieteFormErrors] })
  const f = formState.value

  if (!f.raisonSociale.trim())
    errors.raisonSociale = 'La raison sociale est obligatoire.'

  if (!f.email.trim()) {
    errors.email = "L'email est obligatoire."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    errors.email = "Format d'email invalide."
  }

  if (!f.adresse.trim())
    errors.adresse = "L'adresse est obligatoire."

  const tel = f.telephone.replace(/\D/g, '')
  if (!tel) {
    errors.telephone = 'Le téléphone est obligatoire.'
  } else if (tel.length !== 8) {
    errors.telephone = `Le téléphone doit contenir exactement 8 chiffres (${tel.length}/8 saisis).`
  }

  return Object.keys(errors).length === 0
}

// ── Soumission ───────────────────────────────────────────────────────
async function handleSubmit() {
  generalError.value = null
  success.value      = false
  if (!validate()) return

  loading.value = true
  try {
    const payload = {
      raisonSociale: formState.value.raisonSociale.trim(),
      email:         formState.value.email.trim(),
      adresse:       formState.value.adresse.trim(),
      telephone:     Number(formState.value.telephone.replace(/\D/g, '')),
    }
    const res = await societeApi.create(payload)
    success.value            = true
    createdSocieteName.value = res.data.raisonSociale
    societeCreated.value     = true
    setTimeout(() => { success.value = false }, 4000)
  } catch (e: unknown) {
    generalError.value =
      e instanceof Error ? e.message : 'Une erreur est survenue lors de la création.'
  } finally {
    loading.value = false
  }
}

// ── Réinitialisation ─────────────────────────────────────────────────
function resetForm() {
  formState.value = { raisonSociale: '', email: '', adresse: '', telephone: '' }
  Object.keys(errors).forEach((k) => { delete errors[k as keyof SocieteFormErrors] })
  generalError.value = null
}

function createAnother() {
  resetForm()
  societeCreated.value = false
}

function goToSocietes() {
  router.push({ name: 'AbonnementsCreate' })
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
.toast-close:hover { opacity: 1; background: rgba(0, 0, 0, 0.06); }

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
.post-create-icon     { font-size: 48px; }
.post-create-title    { font-size: 22px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.post-create-subtitle { font-size: 15px; color: #6b7280; margin: 0; font-family: 'Outfit', sans-serif; }
.post-create-actions  {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
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
.btn--secondary {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}
.btn--secondary:hover { background: #ede9fe; }

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
  .post-create-panel { border-radius: 0; padding: 24px 16px; }
}
</style>