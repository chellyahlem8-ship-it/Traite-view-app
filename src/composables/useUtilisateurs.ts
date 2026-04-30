import { ref, reactive, onMounted } from 'vue'
import { utilisateursApi } from '@/api/utilisateurs.api'
import type { Societe } from '@/types/utilisateurs'

interface FormErrors {
  nom?: string
  prenom?: string
  role?: string
  email?: string
  motDePasse?: string
  idSociete?: string
}

export function useUtilisateurs() {
  const loading      = ref(false)
  const success      = ref(false)
  const generalError = ref<string | null>(null)
  const errors       = reactive<FormErrors>({})
  const societes     = ref<Societe[]>([])

  const formState = reactive({
    nom:        '',
    prenom:     '',
    role:       '',
    email:      '',
    motDePasse: '',
    idSociete:  null as number | null,
  })

  // ── Chargement des sociétés ────────────────────────────────
  onMounted(async () => {
    try {
      societes.value = await utilisateursApi.getSocietes()
    } catch {
      generalError.value = 'Impossible de charger les sociétés.'
    }
  })

  // ── Helpers ────────────────────────────────────────────────
  const clearErrors = () => {
    ;(Object.keys(errors) as Array<keyof FormErrors>).forEach((k) => delete errors[k])
    generalError.value = null
  }

  // ── Validation ─────────────────────────────────────────────
  const validate = (): boolean => {
    clearErrors()
    let ok = true

    if (!formState.nom.trim()) {
      errors.nom = 'Le nom est requis.' ; ok = false
    }
    if (!formState.prenom.trim()) {
      errors.prenom = 'Le prénom est requis.' ; ok = false
    }
    if (!formState.role.trim()) {
      errors.role = 'Le rôle est requis.' ; ok = false
    }
    if (!formState.email.trim()) {
      errors.email = "L'email est requis." ; ok = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = "L'email n'est pas valide." ; ok = false
    }
    if (!formState.motDePasse) {
      errors.motDePasse = 'Le mot de passe est requis.' ; ok = false
    } else if (formState.motDePasse.length < 6) {
      errors.motDePasse = 'Minimum 6 caractères.' ; ok = false
    }
    if (!formState.idSociete) {
      errors.idSociete = 'La société est requise.' ; ok = false
    }

    return ok
  }

  // ── Création ───────────────────────────────────────────────
  const createUtilisateur = async () => {
    if (!validate()) return

    loading.value      = true
    success.value      = false
    generalError.value = null

    try {
      await utilisateursApi.create({
        nom:        formState.nom.trim(),
        prenom:     formState.prenom.trim(),
        role:       formState.role.trim(),
        email:      formState.email.trim(),
        motDePasse: formState.motDePasse,
        idSociete:  formState.idSociete!,
      })
      success.value = true
    } catch (err: unknown) {
      success.value = false
      const e = err as { message?: string; errors?: Record<string, string[]> }

      if (e?.message) {
        generalError.value = e.message
        if (e.errors) {
          if (e.errors.nom)        errors.nom        = e.errors.nom[0]
          if (e.errors.prenom)     errors.prenom     = e.errors.prenom[0]
          if (e.errors.role)       errors.role       = e.errors.role[0]
          if (e.errors.email)      errors.email      = e.errors.email[0]
          if (e.errors.motDePasse) errors.motDePasse = e.errors.motDePasse[0]
          if (e.errors.idSociete)  errors.idSociete  = e.errors.idSociete[0]
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
    formState.nom        = ''
    formState.prenom     = ''
    formState.role       = ''
    formState.email      = ''
    formState.motDePasse = ''
    formState.idSociete  = null
    clearErrors()
    success.value = false
  }

  return {
    formState, errors, loading, success,
    generalError, societes,
    createUtilisateur, resetForm,
  }
}