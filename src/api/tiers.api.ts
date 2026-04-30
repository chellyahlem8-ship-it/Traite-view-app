import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import type { Tier, TypeTier, TierPayload } from '../types/tiers'  // ✅ import depuis tiers.ts

export const typesTiersApi = {
  async getAll(): Promise<{ success: boolean; data: TypeTier[] }> {
    return apiGet('types-tiers')
  },

  async search(search: string): Promise<{ success: boolean; data: TypeTier[] }> {
    return apiGet('types-tiers', { search })
  },

  async create(payload: { type: string }): Promise<{ success: boolean; message: string; data: TypeTier }> {
    return apiPost('types-tiers', payload)
  },

  async update(id: number, payload: { type: string }): Promise<{ success: boolean; message: string; data: TypeTier }> {
    return apiPut('types-tiers', id, payload)
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('types-tiers', id)
  },
}

export const tiersApi = {
  async getAll(filters?: {
    idSociete?: number
    types_tiers_id?: number
    search?: string
  }): Promise<{ success: boolean; data: Tier[] }> {
    return apiGet('tiers', filters as Record<string, string | number | boolean>)
  },

  async getByType(types_tiers_id: number, idSociete?: number): Promise<Tier[]> {
    const params: Record<string, number> = { types_tiers_id }
    if (idSociete) params.idSociete = idSociete
    const res = await apiGet<{ success: boolean; data: Tier[] }>('tiers', params)
    return res.data
  },

  async getOne(id: number): Promise<{ success: boolean; data: Tier }> {
    return apiGet(`tiers/${id}`)
  },

  async create(payload: TierPayload): Promise<{ success: boolean; message: string; data: Tier }> {
    return apiPost('tiers', payload)
  },

  async update(id: number, payload: Partial<TierPayload>): Promise<{ success: boolean; message: string; data: Tier }> {
    return apiPut('tiers', id, payload)
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('tiers', id)
  },
}

export type { Tier, TypeTier, TierPayload }  // ✅ ré-exporte pour que le composant puisse importer depuis tiers.api.ts