import { apiGet, apiPost, apiPut } from './apiClient'

export interface Societe {
  idSociete: number
  raisonSociale: string
  adresse: string
  telephone: number
  email: string
  created_at?: string
  updated_at?: string
}

export interface SocietePayload {
  raisonSociale: string
  adresse?: string
  telephone?: number
  email?: string
}

// ─── Helper : normalise n'importe quelle forme de réponse ─────
// Gère { data: [...] }, { societe: {...} }, ou un tableau direct
function extractList(res: unknown): Societe[] {
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object') {
    const r = res as Record<string, unknown>
    if (Array.isArray(r.data))    return r.data as Societe[]
    if (Array.isArray(r.societes)) return r.societes as Societe[]
  }
  return []
}

function extractOne(res: unknown): Societe {
  if (res && typeof res === 'object') {
    const r = res as Record<string, unknown>
    if (r.data && typeof r.data === 'object') return r.data as Societe
    if (r.societe && typeof r.societe === 'object') return r.societe as Societe
  }
  return res as Societe
}

export const societeApi = {
  /**
   * GET /api/societes/:idSociete
   */
  async getOne(idSociete: number): Promise<{ success: boolean; data: Societe }> {
    const res = await apiGet<unknown>(`societes/${idSociete}`)
    return { success: true, data: extractOne(res) }
  },

  /**
   * GET /api/societes
   */
  async getAll(): Promise<{ success: boolean; data: Societe[] }> {
    const res = await apiGet<unknown>('societes')
    return { success: true, data: extractList(res) }
  },

  /**
   * POST /api/societes
   */
  async create(payload: SocietePayload): Promise<{ success: boolean; message: string; data: Societe }> {
    const res = await apiPost<unknown>('societes', payload)
    return { success: true, message: 'Société créée avec succès.', data: extractOne(res) }
  },

  /**
   * PUT /api/societes/:idSociete
   */
  async update(idSociete: number, payload: Partial<SocietePayload>): Promise<{ success: boolean; message: string; data: Societe }> {
    const res = await apiPut<unknown>('societes', idSociete, payload)
    return { success: true, message: 'Société mise à jour avec succès.', data: extractOne(res) }
  },
}