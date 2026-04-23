/**
 * tiers.api.ts
 * ─────────────────────────────────────────────────────────────
 * Toutes les requêtes liées aux Tiers et aux TypesTiers.
 * Ces routes sont protégées par JWT → le token est ajouté
 * automatiquement par apiClient.ts.
 * ─────────────────────────────────────────────────────────────
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'

// ── Types ──────────────────────────────────────────────────────

export interface TypeTier {
  id: number
  type: string       // ex : "client", "fournisseur", "banque"
  created_at?: string
  updated_at?: string
}

export interface Tier {
  id: number
  raison_sociale: string
  email: string
  adresse: string
  num_tel: number
  types_tiers_id: number
  idSociete: number
  type_tiers?: TypeTier     // relation eager-loaded par Laravel
  created_at?: string
  updated_at?: string
}

export interface TierPayload {
  raison_sociale: string
  email: string
  adresse: string
  num_tel: number
  types_tiers_id: number
  idSociete: number
}

// ── TypesTiers API ─────────────────────────────────────────────

export const typesTiersApi = {
  /** GET /api/types-tiers — liste tous les types */
  async getAll(): Promise<{ success: boolean; data: TypeTier[] }> {
    return apiGet('types-tiers')
  },

  /** GET /api/types-tiers?search=client */
  async search(search: string): Promise<{ success: boolean; data: TypeTier[] }> {
    return apiGet('types-tiers', { search })
  },

  /** POST /api/types-tiers */
  async create(payload: { type: string }): Promise<{ success: boolean; message: string; data: TypeTier }> {
    return apiPost('types-tiers', payload)
  },

  /** PUT /api/types-tiers/:id */
  async update(id: number, payload: { type: string }): Promise<{ success: boolean; message: string; data: TypeTier }> {
    return apiPut('types-tiers', id, payload)
  },

  /** DELETE /api/types-tiers/:id */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('types-tiers', id)
  },
}

// ── Tiers API ──────────────────────────────────────────────────

export const tiersApi = {
  /**
   * GET /api/tiers
   * Paramètres optionnels de filtre :
   *   - idSociete     : filtrer par société
   *   - types_tiers_id: filtrer par type (ex: id du type "client")
   *   - search        : recherche par raison_sociale
   */
  async getAll(filters?: {
    idSociete?: number
    types_tiers_id?: number
    search?: string
  }): Promise<{ success: boolean; data: Tier[] }> {
    return apiGet('tiers', filters as Record<string, string | number | boolean>)
  },

  /**
   * Récupérer uniquement les tiers d'un type donné.
   * Exemple : getByType(2) → tous les "fournisseurs"
   * Utilisé pour remplir un <select> filtré.
   */
  async getByType(types_tiers_id: number, idSociete?: number): Promise<Tier[]> {
    const params: Record<string, number> = { types_tiers_id }
    if (idSociete) params.idSociete = idSociete
    const res = await apiGet<{ success: boolean; data: Tier[] }>('tiers', params)
    return res.data
  },

  /** GET /api/tiers/:id */
  async getOne(id: number): Promise<{ success: boolean; data: Tier }> {
    return apiGet(`tiers/${id}`)
  },

  /** POST /api/tiers — crée un tiers et l'enregistre en BDD */
  async create(payload: TierPayload): Promise<{ success: boolean; message: string; data: Tier }> {
    return apiPost('tiers', payload)
  },

  /** PUT /api/tiers/:id */
  async update(id: number, payload: Partial<TierPayload>): Promise<{ success: boolean; message: string; data: Tier }> {
    return apiPut('tiers', id, payload)
  },

  /** DELETE /api/tiers/:id */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('tiers', id)
  },
}