/**
 * banques.api.ts
 * ─────────────────────────────────────────────────────────────
 * Toutes les requêtes liées aux Banques.
 * Le token JWT est ajouté automatiquement par apiClient.ts.
 * ─────────────────────────────────────────────────────────────
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import type { Banque, CreateBanquePayload } from '@/types/banques'

export type { Banque }

export interface BanquePayload extends CreateBanquePayload {}

export const banquesApi = {
  /**
   * GET /api/banques
   * Retourne la liste de toutes les banques.
   */
  async getAll(): Promise<{ success: boolean; data: Banque[] }> {
    return apiGet('banques')
  },

  /**
   * GET /api/banques/:id
   */
  async getOne(id: number): Promise<{ success: boolean; data: Banque }> {
    return apiGet(`banques/${id}`)
  },

  /**
   * POST /api/banques
   * Crée une nouvelle banque.
   */
  async create(
    payload: BanquePayload
  ): Promise<{ success: boolean; message: string; data: Banque }> {
    return apiPost('banques', payload)
  },

  /**
   * PUT /api/banques/:id
   */
  async update(
    id: number,
    payload: Partial<BanquePayload>
  ): Promise<{ success: boolean; message: string; data: Banque }> {
    return apiPut('banques', id, payload)
  },

  /**
   * DELETE /api/banques/:id
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('banques', id)
  },
}