import { ref, reactive } from 'vue'
import { banquesApi } from '@/api/banques.api'

interface FormErrors {
  nomBanque?: string
}

export function useBanques() {
  const loading      = ref(false)
  const success      = ref(false)
  const generalError = ref<string | null>(null)
  const errors       = reactive<FormErrors>({})

  const formState = reactive({
    nomBanque: '',
  })

  // ── Helpers ────────────────────────────────────────────────

  const clearErrors = () => {
    ;(Object.keys(errors) as Array<keyof FormErrors>).forEach((key) => {
      delete errors[key]
    })
    generalError.value = null
  }

  // ── Validation ─────────────────────────────────────────────

  const validate = (): boolean => {
    clearErrors()
    let isValid = true

    if (!formState.nomBanque.trim()) {
      errors.nomBanque = 'Le nom de la banque est requis.'
      isValid = false
    }

    return isValid
  }

  // ── Création ───────────────────────────────────────────────

  const createBanque = async () => {
    if (!validate()) return

    loading.value      = true
    success.value      = false
    generalError.value = null

    try {
      const payload = {
        nomBanque: formState.nomBanque.trim(),
      }

      await banquesApi.create(payload)
      success.value = true
    } catch (err: unknown) {
      success.value = false

      const e = err as { message?: string; errors?: Record<string, string[]> }

      if (e?.message) {
        generalError.value = e.message
        if (e.errors) {
          if (e.errors.nomBanque) errors.nomBanque = e.errors.nomBanque[0]
        }
      } else {
        generalError.value = 'Erreur technique inconnue.'
      }
    } finally {
      loading.value = false
    }
  }

  // ── Reset ──────────────────────────────────────────────────

  const resetForm = () => {
    formState.nomBanque = ''
    clearErrors()
    success.value = false
  }

  return {
    formState,
    errors,
    loading,
    success,
    generalError,
    createBanque,
    resetForm,
  }
}