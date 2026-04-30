import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import type { Utilisateur, CreateUtilisateurPayload, Societe } from '@/types/utilisateurs'

export type { Utilisateur }

export const utilisateursApi = {
  async getAll(): Promise<{ success: boolean; data: Utilisateur[] }> {
    return apiGet('utilisateurs')
  },

  async getOne(id: number): Promise<{ success: boolean; data: Utilisateur }> {
    return apiGet(`utilisateurs/${id}`)
  },

  async create(
    payload: CreateUtilisateurPayload
  ): Promise<{ message: string; utilisateur: Utilisateur }> {
    return apiPost('utilisateurs', payload)
  },

  async update(
    id: number,
    payload: Partial<CreateUtilisateurPayload>
  ): Promise<{ message: string; utilisateur: Utilisateur }> {
    return apiPut('utilisateurs', id, payload)
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiDelete('utilisateurs', id)
  },

  // Pour alimenter le <select> idSociete
  async getSocietes(): Promise<Societe[]> {
    const res = await apiGet('societes')
    return res.data ?? res
  },
}