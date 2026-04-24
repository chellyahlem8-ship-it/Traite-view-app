<template>
<Sidebar />
  <div class="create-banque-page">
    
    <!-- ── Toast success ──────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="showSuccessToast" class="toast toast--success">
        <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0
               00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414
               1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd" />
        </svg>
        <span>Banque créée avec succès !</span>
      </div>
    </Transition>

    <!-- ── Toast erreur générale ──────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="generalError" class="toast toast--error">
        <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2
               0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1
               1 0 00-1-1z"
            clip-rule="evenodd" />
        </svg>
        <span>{{ generalError }}</span>
      </div>
    </Transition>

    <!-- ── Formulaire présentationnel ─────────────────────────────── -->
    <FormCreerBanque
      v-model="formData"
      :loading="loading"
      :errors="errors"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import FormCreerBanque from '@/components/FormCreerBanque.vue'
import type { BanqueFormData, BanqueFormErrors } from '@/components/FormCreerBanque.vue'
import { useBanques } from '@/composables/useBanques'

const router = useRouter()

// ── Composable (toute la logique métier) ──────────────────────────────
const {
  formState,
  errors: rawErrors,
  loading,
  success,
  generalError,
  createBanque,
  resetForm,
} = useBanques()

// ── Bridge formState (reactive) ↔ v-model (objet plat) ───────────────
/**
 * Le composant présentationnel travaille avec un objet immutable via v-model.
 * On synchronise depuis/vers le reactive formState du composable.
 */
const formData = computed<BanqueFormData>({
  get: () => ({
    nomBanque: formState.nomBanque,
  }),
  set: (val: BanqueFormData) => {
    formState.nomBanque = val.nomBanque
  },
})

/** Cast transparent pour satisfaire le typage strict du composant UI */
const errors = computed<BanqueFormErrors>(() => rawErrors)

// ── Toast success (auto-dismiss après 3 s) ────────────────────────────
const showSuccessToast = computed(() => success.value)

watch(success, (val) => {
  if (val) {
    setTimeout(() => resetForm(), 3000)
  }
})

// ── Handlers ──────────────────────────────────────────────────────────
async function handleSubmit() {
  await createBanque()
}

function handleCancel() {
  router.back()
}
</script>

<style scoped>
.create-banque-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #f8f7ff;
  position: relative;
}

/* ── Toasts ────────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-width: 360px;
}

.toast--success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.toast--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* ── Transition toast ─────────────────────────────────────────────── */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

/* ── Responsive ───────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .create-banque-page {
    padding: 0;
    background: #fff;
    justify-content: flex-start;
  }

  .toast {
    top: 12px;
    right: 12px;
    left: 12px;
    max-width: unset;
  }
}
</style>