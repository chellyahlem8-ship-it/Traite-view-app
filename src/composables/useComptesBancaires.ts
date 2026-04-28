import { ref, reactive, onMounted, watch } from 'vue'
import { comptesBancairesApi } from '@/api/comptesBancaires.api'
import { banquesApi } from '@/api/banques.api'
import { tiersApi } from '@/api/tiers.api'
import { apiGet } from '@/api/apiClient'
import type { Banque } from '@/types/banques'

export interface SelectOption {
  id: number
  label: string
}

export const TITULAIRE_TYPES = [
  { value: 'App\\Models\\Tier',    label: 'Tiers'   },
  { value: 'App\\Models\\Societe', label: 'Société' },
] as const

interface FormErrors {
  rib?:            string
  adresse_agence?: string
  banque_id?:      string
  titulaire_id?:   string
  titulaire_type?: string
}

export function useComptesBancaires() {
  const loading       = ref(false)
  const success       = ref(false)
  const generalError  = ref<string | null>(null)
  const errors        = reactive<FormErrors>({})

  const banques           = ref<Banque[]>([])
  const loadingBanques    = ref(false)
  const titulaires        = ref<SelectOption[]>([])
  const loadingTitulaires = ref(false)

  const formState = reactive({
    rib:            '',
    adresse_agence: '',
    banque_id:      '' as number | '',
    titulaire_type: '',
    titulaire_id:   '' as number | '',
  })

  onMounted(async () => {
    loadingBanques.value = true
    try {
      const res = await banquesApi.getAll()
      banques.value = res.data
    } catch {
      generalError.value = 'Impossible de charger les banques.'
    } finally {
      loadingBanques.value = false
    }
  })

  watch(
    () => formState.titulaire_type,
    async (type) => {
      formState.titulaire_id = ''
      titulaires.value       = []

      if (!type) return

      loadingTitulaires.value = true
      generalError.value      = null

      try {
        if (type === 'App\\Models\\Tier') {
          const res = await tiersApi.getAll()
          titulaires.value = res.data.map((t) => ({
            id:    t.id,
            label: t.raison_sociale,
          }))
        } else if (type === 'App\\Models\\Societe') {
          // ✅ FIX : SocieteController retourne un tableau direct (pas { success, data })
          // et le champ s'appelle raisonSociale (pas nom_societe)
          const res = await apiGet<any>('societes')
          const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
          titulaires.value = list.map((s: any) => ({
            id:    s.idSociete ?? s.id,
            label: s.raisonSociale ?? s.nom_societe ?? '—',
          }))
        }
      } catch {
        generalError.value = 'Impossible de charger les titulaires.'
      } finally {
        loadingTitulaires.value = false
      }
    }
  )

  const clearErrors = () => {
    ;(Object.keys(errors) as Array<keyof FormErrors>).forEach((key) => {
      delete errors[key]
    })
    generalError.value = null
  }

  const validate = (): boolean => {
    clearErrors()
    let isValid = true

    if (!formState.rib.trim()) {
      errors.rib = 'Le RIB est requis.'
      isValid = false
    }
    if (!formState.adresse_agence.trim()) {
      errors.adresse_agence = "L'adresse de l'agence est requise."
      isValid = false
    }
    if (!formState.banque_id) {
      errors.banque_id = 'Veuillez sélectionner une banque.'
      isValid = false
    }
    if (!formState.titulaire_type) {
      errors.titulaire_type = 'Veuillez sélectionner un type de titulaire.'
      isValid = false
    }
    if (!formState.titulaire_id) {
      errors.titulaire_id = 'Veuillez sélectionner un titulaire.'
      isValid = false
    }

    return isValid
  }

  const createCompteBancaire = async () => {
    if (!validate()) return

    loading.value      = true
    success.value      = false
    generalError.value = null

    try {
      const payload = {
        rib:            formState.rib.trim(),
        adresse_agence: formState.adresse_agence.trim(),
        banque_id:      Number(formState.banque_id),
        titulaire_type: formState.titulaire_type,
        titulaire_id:   Number(formState.titulaire_id),
      }
      await comptesBancairesApi.create(payload)
      success.value = true
    } catch (err: unknown) {
      success.value = false
      const e = err as { message?: string; errors?: Record<string, string[]> }
      if (e?.message) {
        generalError.value = e.message
        if (e.errors) {
          if (e.errors.rib)            errors.rib            = e.errors.rib[0]
          if (e.errors.adresse_agence) errors.adresse_agence = e.errors.adresse_agence[0]
          if (e.errors.banque_id)      errors.banque_id      = e.errors.banque_id[0]
          if (e.errors.titulaire_type) errors.titulaire_type = e.errors.titulaire_type[0]
          if (e.errors.titulaire_id)   errors.titulaire_id   = e.errors.titulaire_id[0]
        }
      } else {
        generalError.value = 'Erreur technique inconnue.'
      }
    } finally {
      loading.value = false
    }
  }

  const resetForm = () => {
    formState.rib            = ''
    formState.adresse_agence = ''
    formState.banque_id      = ''
    formState.titulaire_type = ''
    formState.titulaire_id   = ''
    titulaires.value         = []
    clearErrors()
    success.value = false
  }

  return {
    formState,
    errors,
    loading,
    success,
    generalError,
    banques,
    loadingBanques,
    titulaires,
    loadingTitulaires,
    createCompteBancaire,
    resetForm,
  }
}