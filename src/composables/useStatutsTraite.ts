import { ref, reactive } from 'vue'
import { statutsTraiteApi } from '@/api/statuts-traite.api'

interface FormErrors {
  statut?: string
}

export function useStatutsTraite() {
  const loading      = ref(false)
  const success      = ref(false)
  const generalError = ref<string | null>(null)
  const errors       = reactive<FormErrors>({})

  const formState = reactive({
    statut: '',
  })

  const clearErrors = () => {
    ;(Object.keys(errors) as Array<keyof FormErrors>).forEach((key) => {
      delete errors[key]
    })
    generalError.value = null
  }

  const validate = (): boolean => {
    clearErrors()
    let isValid = true

    if (!formState.statut.trim()) {
      errors.statut = 'Le libellé du statut est requis.'
      isValid = false
    }

    return isValid
  }

  const createStatutTraite = async () => {
    if (!validate()) return

    loading.value      = true
    success.value      = false
    generalError.value = null

    try {
      await statutsTraiteApi.create({
        statut: formState.statut.trim(),
      })
      success.value = true
    } catch (err: unknown) {
      success.value = false
      const e = err as { message?: string; errors?: Record<string, string[]> }

      if (e?.message) {
        generalError.value = e.message
        if (e.errors?.statut) errors.statut = e.errors.statut[0]
      } else {
        generalError.value = 'Erreur technique inconnue.'
      }
    } finally {
      loading.value = false
    }
  }

  const resetForm = () => {
    formState.statut = ''
    clearErrors()
    success.value = false
  }

  return {
    formState,
    errors,
    loading,
    success,
    generalError,
    createStatutTraite,
    resetForm,
  }
}