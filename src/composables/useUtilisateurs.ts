import { ref, reactive, onMounted } from 'vue'
import { utilisateursApi } from '@/api/utilisateurs.api'
import type { Utilisateur, Societe } from '@/types/utilisateurs'

export { getSocieteName } from '@/types/utilisateurs'

interface FormErrors {
  nom?: string
  prenom?: string
  role?: string
  email?: string
  motDePasse?: string
  idSociete?: string
}

export function useUtilisateurs() {
  const loading        = ref(false)
  const success        = ref(false)
  const generalError   = ref<string | null>(null)
  const errors         = reactive<FormErrors>({})
  const societes       = ref<Societe[]>([])
  const utilisateurs   = ref<Utilisateur[]>([])

  const formState = reactive({
    nom:        '',
    prenom:     '',
    role:       '',
    email:      '',
    motDePasse: '',
    idSociete:  null as number | null,
  })

  // ── Chargement des sociétés (pour le select) ───────────────
  onMounted(async () => {
    try {
      societes.value = await utilisateursApi.getSocietes()
    } catch {
      generalError.value = 'Impossible de charger les sociétés.'
    }
  })

  // ── Liste des utilisateurs ─────────────────────────────────
  const fetchUtilisateurs = async () => {
    loading.value      = true
    generalError.value = null
    try {
      const res = await utilisateursApi.getAll()
      utilisateurs.value = (res as any).data ?? res
    } catch (err: unknown) {
      generalError.value = (err as any)?.message ?? 'Impossible de charger les utilisateurs.'
    } finally {
      loading.value = false
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  const clearErrors = () => {
    ;(Object.keys(errors) as Array<keyof FormErrors>).forEach((k) => delete errors[k])
    generalError.value = null
  }

  // ── Validation ─────────────────────────────────────────────
  const validate = (requirePassword = true): boolean => {
    clearErrors()
    let ok = true
    if (!formState.nom.trim())    { errors.nom    = 'Le nom est requis.'    ; ok = false }
    if (!formState.prenom.trim()) { errors.prenom = 'Le prénom est requis.' ; ok = false }
    if (!formState.role.trim())   { errors.role   = 'Le rôle est requis.'   ; ok = false }
    if (!formState.email.trim()) {
      errors.email = "L'email est requis." ; ok = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = "L'email n'est pas valide." ; ok = false
    }
    if (requirePassword) {
      if (!formState.motDePasse) {
        errors.motDePasse = 'Le mot de passe est requis.' ; ok = false
      } else if (formState.motDePasse.length < 6) {
        errors.motDePasse = 'Minimum 6 caractères.' ; ok = false
      }
    }
    if (!formState.idSociete) {
      errors.idSociete = 'La société est requise.' ; ok = false
    }
    return ok
  }

  // ── Création ───────────────────────────────────────────────
  const createUtilisateur = async () => {
    if (!validate(true)) return
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
      generalError.value = e?.message ?? 'Erreur technique inconnue.'
      if (e?.errors) {
        if (e.errors.nom)        errors.nom        = e.errors.nom[0]
        if (e.errors.prenom)     errors.prenom     = e.errors.prenom[0]
        if (e.errors.role)       errors.role       = e.errors.role[0]
        if (e.errors.email)      errors.email      = e.errors.email[0]
        if (e.errors.motDePasse) errors.motDePasse = e.errors.motDePasse[0]
        if (e.errors.idSociete)  errors.idSociete  = e.errors.idSociete[0]
      }
    } finally {
      loading.value = false
    }
  }

  // ── Mise à jour ────────────────────────────────────────────
  const updateUtilisateur = async (id: number) => {
    if (!validate(false)) return
    loading.value      = true
    success.value      = false
    generalError.value = null
    const payload: Record<string, unknown> = {
      nom:       formState.nom.trim(),
      prenom:    formState.prenom.trim(),
      role:      formState.role.trim(),
      email:     formState.email.trim(),
      idSociete: formState.idSociete!,
    }
    if (formState.motDePasse) payload.motDePasse = formState.motDePasse
    try {
      await utilisateursApi.update(id, payload as any)
      success.value = true
    } catch (err: unknown) {
      generalError.value = (err as any)?.message ?? 'Erreur technique inconnue.'
    } finally {
      loading.value = false
    }
  }

  // ── Suppression ────────────────────────────────────────────
  const deleteUtilisateur = async (id: number) => {
    loading.value      = true
    generalError.value = null
    try {
      await utilisateursApi.delete(id)
      utilisateurs.value = utilisateurs.value.filter(u => u.idUtilisateur !== id)
    } catch (err: unknown) {
      generalError.value = (err as any)?.message ?? 'Impossible de supprimer.'
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

  // ── Pré-remplissage pour édition ───────────────────────────
  const fillForm = (u: Utilisateur) => {
    formState.nom        = u.nom
    formState.prenom     = u.prenom
    formState.role       = u.role
    formState.email      = u.email
    formState.motDePasse = ''
    formState.idSociete  = u.idSociete ?? null
  }

  return {
    formState, errors, loading, success, generalError,
    societes, utilisateurs,
    createUtilisateur, updateUtilisateur, deleteUtilisateur,
    fetchUtilisateurs, resetForm, fillForm,
  }
}