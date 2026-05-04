// composables/useAbonnements.ts
import { ref, reactive, computed } from 'vue'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface Societe {
  idSociete: number
  raisonSociale: string
}

export interface Tarif {
  idTarif: number
  nom: string
  prix?: number
}

export interface Abonnement {
  idAbonnement: number
  dateDebut: string
  dateFin: string
  duree: string
  idSociete: number
  idTarif: number
  societe?: Societe
  tarif?: Tarif
  isActif: boolean
  isExpire: boolean
  joursRestants: number
}

export interface AbonnementPayload {
  dateDebut: string
  dateFin:   string
  duree:     string
  idSociete: number
  idTarif:   number
}

/** État du formulaire — les selects lient des string */
export interface AbonnementFormData {
  dateDebut: string
  dateFin:   string
  duree:     string
  idSociete: number | string
  idTarif:   number | string
}

export interface AbonnementFormErrors {
  dateDebut?: string
  dateFin?:   string
  duree?:     string
  idSociete?: string
  idTarif?:   string
}

export interface AbonnementStats {
  total:   number
  actifs:  number
  expires: number
}

// ═══════════════════════════════════════════════════════════════
// UTILITAIRE FETCH PARTAGÉ
// ═══════════════════════════════════════════════════════════════

function getToken(): string | undefined {
  return localStorage.getItem('traity_token') ?? undefined
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res  = await fetch(url, { headers, ...options })
  const data = await res.json()
  if (!res.ok) throw new Error((data as { message?: string }).message ?? `Erreur ${res.status}`)
  return data as T
}

// ═══════════════════════════════════════════════════════════════
// useAbonnements — liste, suppression, stats
// ═══════════════════════════════════════════════════════════════

export function useAbonnements() {
  const abonnements = ref<Abonnement[]>([])
  const abonnement  = ref<Abonnement | null>(null)
  const societes    = ref<Societe[]>([])
  const tarifs      = ref<Tarif[]>([])
  const loading     = ref<boolean>(false)
  const error       = ref<string | null>(null)
  const success     = ref<string | null>(null)

  const stats = computed<AbonnementStats>(() => ({
    total:   abonnements.value.length,
    actifs:  abonnements.value.filter(a => a.isActif).length,
    expires: abonnements.value.filter(a => a.isExpire).length,
  }))

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true; error.value = null; success.value = null
    try   { return await fn() }
    catch (err) { error.value = (err as Error).message ?? 'Erreur inattendue.'; throw err }
    finally { loading.value = false }
  }

  const fetchAbonnements  = () => run(async () => { abonnements.value = await apiFetch<Abonnement[]>(`${BASE_URL}/abonnements`) })
  const fetchAbonnement   = (id: number | string) => run(async () => { abonnement.value = await apiFetch<Abonnement>(`${BASE_URL}/abonnements/${id}`) })
  const fetchSocietes     = async () => { societes.value = await apiFetch<Societe[]>(`${BASE_URL}/societes`) }
  const fetchTarifs       = async () => { tarifs.value   = await apiFetch<Tarif[]>(`${BASE_URL}/tarifs`) }

  async function createAbonnement(payload: AbonnementPayload): Promise<Abonnement> {
    return run(async () => {
      const data = await apiFetch<{ message: string; abonnement: Abonnement }>(`${BASE_URL}/abonnements`, { method: 'POST', body: JSON.stringify(payload) })
      success.value = data.message; return data.abonnement
    })
  }

  async function updateAbonnement(id: number | string, payload: Partial<AbonnementPayload>): Promise<Abonnement> {
    return run(async () => {
      const data = await apiFetch<{ message: string; abonnement: Abonnement }>(`${BASE_URL}/abonnements/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
      success.value = data.message; return data.abonnement
    })
  }

  async function deleteAbonnement(id: number | string): Promise<void> {
    await run(async () => {
      const data = await apiFetch<{ message: string }>(`${BASE_URL}/abonnements/${id}`, { method: 'DELETE' })
      success.value = data.message
      abonnements.value = abonnements.value.filter(a => a.idAbonnement !== Number(id))
    })
  }

  function formatDate(d: string | null | undefined): string {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR')
  }
  type StatusClass = 'badge-actif' | 'badge-expire' | 'badge-pending'
  function statusClass(a: Abonnement): StatusClass {
    return a.isActif ? 'badge-actif' : a.isExpire ? 'badge-expire' : 'badge-pending'
  }
  function statusLabel(a: Abonnement): string {
    return a.isActif ? 'Actif' : a.isExpire ? 'Expiré' : 'En attente'
  }

  return {
    abonnements, abonnement, societes, tarifs, loading, error, success, stats,
    fetchAbonnements, fetchAbonnement, createAbonnement, updateAbonnement, deleteAbonnement,
    fetchSocietes, fetchTarifs, formatDate, statusClass, statusLabel,
  }
}

// ═══════════════════════════════════════════════════════════════
// useAbonnementForm — formulaire create / edit avec validation
// ═══════════════════════════════════════════════════════════════

export function useAbonnementForm() {
  const loading      = ref<boolean>(false)
  const success      = ref<boolean>(false)
  const generalError = ref<string | null>(null)
  const errors       = reactive<AbonnementFormErrors>({})

  function clearErrors(): void {
    ;(Object.keys(errors) as Array<keyof AbonnementFormErrors>).forEach(k => delete errors[k])
  }

  function buildPayload(form: AbonnementFormData): AbonnementPayload {
    return {
      dateDebut: form.dateDebut,
      dateFin:   form.dateFin,
      duree:     form.duree,
      idSociete: Number(form.idSociete),
      idTarif:   Number(form.idTarif),
    }
  }

  function validate(form: AbonnementFormData): boolean {
    clearErrors()
    if (!form.idSociete) errors.idSociete = 'Veuillez sélectionner une société.'
    if (!form.idTarif)   errors.idTarif   = 'Veuillez sélectionner un tarif.'
    if (!form.duree)     errors.duree     = 'Veuillez sélectionner une durée.'
    if (!form.dateDebut) errors.dateDebut = 'La date de début est obligatoire.'
    if (!form.dateFin)   errors.dateFin   = 'La date de fin est obligatoire.'
    if (form.dateDebut && form.dateFin && form.dateFin <= form.dateDebut)
      errors.dateFin = 'La date de fin doit être postérieure à la date de début.'
    return Object.keys(errors).length === 0
  }

  async function fetchOne(id: number): Promise<Abonnement> {
    return apiFetch<Abonnement>(`${BASE_URL}/abonnements/${id}`)
  }

  async function fetchSocietesEtTarifs(): Promise<{ societes: Societe[]; tarifs: Tarif[] }> {
  const [resSocietes, resTarifs] = await Promise.all([
    apiFetch<{ success: boolean; data: Societe[] }>(`${BASE_URL}/societes`),
    apiFetch<{ success: boolean; data: Tarif[] }>(`${BASE_URL}/tarifs`),
  ])
  return {
    societes: resSocietes.data,
    tarifs:   resTarifs.data,
  }
}

  async function createAbonnement(form: AbonnementFormData): Promise<boolean> {
    if (!validate(form)) return false
    loading.value = true; generalError.value = null; success.value = false
    try {
      await apiFetch<unknown>(`${BASE_URL}/abonnements`, { method: 'POST', body: JSON.stringify(buildPayload(form)) })
      success.value = true; return true
    } catch (err) {
      generalError.value = (err as Error).message ?? 'Erreur lors de la création.'; return false
    } finally { loading.value = false }
  }

  async function updateAbonnement(id: number, form: AbonnementFormData): Promise<boolean> {
    if (!validate(form)) return false
    loading.value = true; generalError.value = null; success.value = false
    try {
      await apiFetch<unknown>(`${BASE_URL}/abonnements/${id}`, { method: 'PUT', body: JSON.stringify(buildPayload(form)) })
      success.value = true; return true
    } catch (err) {
      generalError.value = (err as Error).message ?? 'Erreur lors de la mise à jour.'; return false
    } finally { loading.value = false }
  }

  return {
    loading, success, generalError, errors,
    fetchOne, fetchSocietesEtTarifs, createAbonnement, updateAbonnement,
  }
}