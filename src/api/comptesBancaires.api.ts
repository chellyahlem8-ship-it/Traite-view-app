/**
 * comptesBancaires.api.ts
 * ─────────────────────────────────────────────────────────────
 * Toutes les requêtes liées aux Comptes Bancaires.
 * Le token JWT est ajouté automatiquement par apiClient.ts.
 * ─────────────────────────────────────────────────────────────
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import type { CompteBancaire, CreateCompteBancairePayload } from '@/types/comptesBancaires'

export type { CompteBancaire }

export interface CompteBancairePayload extends CreateCompteBancairePayload {}

export const comptesBancairesApi = {
  /**
   * GET /api/comptes-bancaires
   */
  async getAll(): Promise<{ success: boolean; data: CompteBancaire[] }> {
    return apiGet('comptes-bancaires')
  },

  /**
   * GET /api/comptes-bancaires/:id
   */
  async getOne(id: number): Promise<{ success: boolean; data: CompteBancaire }> {
    return apiGet(`comptes-bancaires/${id}`)
  },

  /**
   * POST /api/comptes-bancaires
   */
  async create(
    payload: CompteBancairePayload
  ): Promise<{ success: boolean; message: string; data: CompteBancaire }> {
    return apiPost('comptes-bancaires', payload)
  },

  /**
   * PUT /api/comptes-bancaires/:id
   */
  async update(
    id: number,
    payload: Partial<CompteBancairePayload>
  ): Promise<{ success: boolean; message: string; data: CompteBancaire }> {
    return apiPut('comptes-bancaires', id, payload)
  },

  /**
   * DELETE /api/comptes-bancaires/:id
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('comptes-bancaires', id)
  },
}