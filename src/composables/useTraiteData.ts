/**
 * useTraiteData.ts
 * Composable central — données réelles uniquement, jamais de mock
 */
import { ref, computed, type ComputedRef } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// ── Types ──────────────────────────────────────────────────────────────────
export interface TraiteRaw {
  id: number
  montant: number
  type_traite: 'client' | 'fournisseur'
  date_emission: string
  date_echeance: string
  statuts_traites_id?: number | null
  statut?: { id?: number; statut?: string } | string | null
  statut_label?: string
  tier_nom?: string
  banque_nom?: string
  tireur?: { raison_sociale?: string; nom?: string } | null
  tier?:   { raison_sociale?: string; nom?: string } | null
  tiers?:  { raison_sociale?: string; nom?: string } | null
  statutTraite?:  { id?: number; statut?: string } | null
  statut_traite?: { id?: number; statut?: string } | null
  compte_bancaire?:  { banque?: { nomBanque?: string; nom?: string } } | null
  comptes_bancaires?: { banque?: { nomBanque?: string; nom?: string } } | null
  compteBancaire?: { banque?: { nomBanque?: string; nom?: string } } | null
  banque?: { nomBanque?: string; nom?: string } | string | null
  [key: string]: unknown
}

export interface TraiteMapped extends TraiteRaw {
  statut_label: string   // libellé normalisé (minuscules, sans accents)
  statut_raw: string     // libellé original tel que retourné par l'API
  tier_nom: string
  banque_nom: string
  _statutId: number | null
}

interface WeekEntry  { label: string; client: number; fourn: number }
interface MonthEntry { m: string; client: number; fourn: number; payeeClient: number; payeeFourn: number }
interface TopEntity  { name: string; montant: number; count: number }
interface ForecastData {
  labels: string[]
  reel:   (number | null)[]   // traites déjà réglées (payées ou en caisse)
  prev:   (number | null)[]   // traites non réglées futures
}

// ── Auth ───────────────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('traity_token')
}
function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Normalisation du statut ────────────────────────────────────────────────
export function normalizeStatut(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function extractStatutRaw(t: TraiteRaw): string {
  const rel = (t.statutTraite ?? t.statut_traite) as { statut?: string } | null
  if (rel && typeof rel === 'object' && rel.statut) return rel.statut

  if (typeof t.statut === 'object' && t.statut !== null) {
    return (t.statut as { statut?: string }).statut ?? ''
  }
  if (typeof t.statut === 'string') return t.statut
  if (typeof t.statut_label === 'string') return t.statut_label
  return ''
}

/**
 * isRegle : traite effectivement réglée / encaissée
 * - Fournisseur → "Payée"
 * - Client      → "En caisse"
 * Les deux font sortir le montant de la trésorerie prévisionnelle
 * et entrer dans la trésorerie réelle.
 *
 * Règle de détection (normalisée, sans accents) :
 *   "payee"     → Payée         (fournisseur réglé)
 *   "en caisse" → En caisse     (client encaissé)
 *   "regle"     → alias payé
 *   "liquide"   → alias payé
 * Exclusions explicites : "impay", "non", "annul"
 */
export function isPaid(t: TraiteMapped | TraiteRaw): boolean {
  const raw = extractStatutRaw(t)
  const s   = normalizeStatut(raw || (t as TraiteMapped).statut_label || '')

  // Exclusions explicites (priorité haute)
  if (s.includes('impay'))  return false
  if (s.includes('non'))    return false
  if (s.includes('annul'))  return false

  // "En caisse" — statut de règlement pour les traites client
  if (s === 'en caisse' || s.includes('caisse')) return true

  // Variantes de "payé"
  return s.startsWith('pay') || s === 'regle' || s === 'liquide'
}

/**
 * isEnCaisse : statut spécifique "En caisse" (traites client encaissées)
 */
export function isEnCaisse(t: TraiteMapped | TraiteRaw): boolean {
  const s = normalizeStatut(extractStatutRaw(t) || (t as TraiteMapped).statut_label || '')
  return s === 'en caisse' || s.includes('caisse')
}

/**
 * isNonEchue : statut "Non échue" — traite en cours, pas encore à terme
 */
export function isNonEchue(t: TraiteMapped | TraiteRaw): boolean {
  const s = normalizeStatut(extractStatutRaw(t) || (t as TraiteMapped).statut_label || '')
  return s.includes('non') && s.includes('echu')
}

/**
 * isImpayee : statut "Impayée"
 */
export function isImpayee(t: TraiteMapped | TraiteRaw): boolean {
  const s = normalizeStatut(extractStatutRaw(t) || (t as TraiteMapped).statut_label || '')
  return s.includes('impay')
}

// ── Mapping API → TraiteMapped ─────────────────────────────────────────────
function mapTraite(t: TraiteRaw): TraiteMapped {
  const statutRaw = extractStatutRaw(t)

  let tierNom = ''
  if      (t.tireur && typeof t.tireur === 'object') tierNom = t.tireur.raison_sociale || t.tireur.nom || ''
  else if (t.tier   && typeof t.tier   === 'object') tierNom = t.tier.raison_sociale   || t.tier.nom   || ''
  else if (t.tiers  && typeof t.tiers  === 'object') tierNom = t.tiers.raison_sociale  || t.tiers.nom  || ''
  else if (typeof t.tier_nom === 'string')            tierNom = t.tier_nom

  let banqueNom = ''
  const cb = (t.compteBancaire ?? t.compte_bancaire ?? t.comptes_bancaires) as { banque?: { nomBanque?: string; nom?: string } } | null
  if (cb?.banque) {
    banqueNom = cb.banque.nomBanque || cb.banque.nom || ''
  } else if (t.banque && typeof t.banque === 'object') {
    banqueNom = (t.banque as { nomBanque?: string; nom?: string }).nomBanque || (t.banque as { nomBanque?: string; nom?: string }).nom || ''
  } else if (typeof t.banque === 'string') {
    banqueNom = t.banque
  } else if (typeof t.banque_nom === 'string') {
    banqueNom = t.banque_nom
  }

  const relObj = (t.statutTraite ?? t.statut_traite) as { id?: number } | null
  const _statutId =
    (relObj && typeof relObj === 'object' ? relObj.id : null) ??
    (typeof t.statut === 'object' && t.statut !== null ? (t.statut as { id?: number }).id : null) ??
    t.statuts_traites_id ??
    null

  return {
    ...t,
    statut_raw:   statutRaw,
    statut_label: normalizeStatut(statutRaw),
    tier_nom:     tierNom,
    banque_nom:   banqueNom,
    _statutId,
  }
}

// ── Composable ─────────────────────────────────────────────────────────────
export function useTraiteData() {
  const traites    = ref<TraiteMapped[]>([])
  const loading    = ref(false)
  const error      = ref('')
  const apiOk      = ref(true)

  async function load(): Promise<void> {
    loading.value = true
    error.value   = ''
    try {
      const res = await fetch(`${API_BASE}/traites`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      traites.value = ((json.data ?? json ?? []) as TraiteRaw[]).map(mapTraite)
      apiOk.value   = true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value   = msg
      apiOk.value   = false
      traites.value = []
      console.error('[useTraiteData] Erreur API:', msg)
    } finally {
      loading.value = false
    }
  }

  const sumArr = (arr: TraiteMapped[]) => arr.reduce((s, t) => s + Number(t.montant || 0), 0)

  /**
   * Trésorerie RÉELLE — uniquement les traites effectivement réglées :
   *   - type client   + statut "En caisse" → +montant (encaissement effectif)
   *   - type fourn    + statut "Payée"     → -montant (décaissement effectif)
   * Les traites "Non échue" ou "Impayée" ne sont PAS comptées ici.
   */
  const tresorerie = computed(() =>
    traites.value
      .filter(t => isPaid(t))
      .reduce((s, t) => {
        const m = Number(t.montant || 0)
        return s + (t.type_traite === 'client' ? m : -m)
      }, 0)
  )

  /**
   * Trésorerie PRÉVISIONNELLE — traites non encore réglées (Non échue)
   *   - type client   non réglé → +montant (à encaisser)
   *   - type fourn    non réglé → -montant (à payer)
   * Les impayées sont exclues (montant compromis).
   */
  const tresoreriePrev = computed(() =>
    traites.value
      .filter(t => isNonEchue(t))
      .reduce((s, t) => {
        const m = Number(t.montant || 0)
        return s + (t.type_traite === 'client' ? m : -m)
      }, 0)
  )

  // byMonth : traites non réglées par mois d'échéance
  function byMonth(): MonthEntry[] {
    const yr     = new Date().getFullYear()
    const labels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
    return labels.map((m, i): MonthEntry => {
      const duMois = traites.value.filter(t => {
        const d = new Date(t.date_echeance)
        return !isNaN(d.getTime()) && d.getMonth() === i && d.getFullYear() === yr
      })
      return {
        m,
        client:      sumArr(duMois.filter(t => t.type_traite === 'client'      && !isPaid(t))),
        fourn:       sumArr(duMois.filter(t => t.type_traite === 'fournisseur' && !isPaid(t))),
        payeeClient: sumArr(duMois.filter(t => t.type_traite === 'client'      && isPaid(t))),
        payeeFourn:  sumArr(duMois.filter(t => t.type_traite === 'fournisseur' && isPaid(t))),
      }
    })
  }

  function byWeek(): WeekEntry[] {
    const weeks: Record<string, { client: number; fourn: number }> = {}
    traites.value.forEach(t => {
      if (isPaid(t)) return
      const d = new Date(t.date_echeance)
      if (isNaN(d.getTime())) return
      const start = new Date(d)
      start.setDate(d.getDate() - d.getDay())
      const k = start.toISOString().split('T')[0]
      if (!weeks[k]) weeks[k] = { client: 0, fourn: 0 }
      const amt = Number(t.montant || 0)
      if (t.type_traite === 'client') weeks[k].client += amt
      else                            weeks[k].fourn  += amt
    })
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]): WeekEntry => {
        const d = new Date(k)
        return {
          label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          ...v,
        }
      })
  }

  function topEntities(type: 'client' | 'fournisseur', limit = 8): TopEntity[] {
    const map: Record<string, { montant: number; count: number }> = {}
    traites.value
      .filter(t => t.type_traite === type)
      .forEach(t => {
        const n = t.tier_nom || 'Inconnu'
        if (!map[n]) map[n] = { montant: 0, count: 0 }
        map[n].montant += Number(t.montant || 0)
        map[n].count   += 1
      })
    return Object.entries(map)
      .sort(([, a], [, b]) => b.montant - a.montant)
      .slice(0, limit)
      .map(([name, v]): TopEntity => ({ name, montant: Math.round(v.montant), count: v.count }))
  }

  function cashflowByDay(): Record<string, number> {
    const map: Record<string, number> = {}
    traites.value.forEach(t => {
      if (isPaid(t)) return
      const key = t.date_echeance?.split('T')[0]
      if (!key) return
      if (!map[key]) map[key] = 0
      const amt = Number(t.montant || 0)
      map[key] += t.type_traite === 'client' ? amt : -amt
    })
    return map
  }

  /**
   * forecastData :
   *   reel = traites réglées (Payée / En caisse) par mois
   *   prev = traites Non échues par mois (à venir)
   */
  const forecastData: ComputedRef<ForecastData> = computed(() => {
    const points: Record<string, { reel: number; prev: number }> = {}

    traites.value.forEach(t => {
      const key = t.date_echeance?.split('T')[0]
      if (!key) return
      const d = new Date(key)
      if (isNaN(d.getTime())) return
      const ym  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const amt = Number(t.montant || 0)
      const sign = t.type_traite === 'client' ? 1 : -1
      if (!points[ym]) points[ym] = { reel: 0, prev: 0 }
      if (isPaid(t))      points[ym].reel += amt * sign
      else if (isNonEchue(t)) points[ym].prev += amt * sign
      // impayées exclues des deux courbes (montant compromis)
    })

    const sorted = Object.entries(points).sort(([a], [b]) => a.localeCompare(b)).slice(-10)

    return {
      labels: sorted.map(([k]) => {
        const [y, mo] = k.split('-')
        return new Date(Number(y), Number(mo) - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      }),
      reel: sorted.map(([, v]) => v.reel !== 0 ? Math.round(v.reel) : null),
      prev: sorted.map(([, v]) => v.prev !== 0 ? Math.round(v.prev) : null),
    }
  })

  return {
    traites,
    loading,
    error,
    apiOk,
    load,
    tresorerie,
    tresoreriePrev,
    byMonth,
    byWeek,
    topEntities,
    cashflowByDay,
    forecastData,
    isPaid,
    isNonEchue,
    isImpayee,
    isEnCaisse,
    normalizeStatut,
    sum: sumArr,
  }
}