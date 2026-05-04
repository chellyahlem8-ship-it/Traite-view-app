import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import type { Societe, SocietePayload } from '../types/societes'

export const societesApi = {
  async getAll(): Promise<{ success: boolean; data: Societe[] }> {
    return apiGet('societes')
  },

  async getOne(id: number): Promise<{ success: boolean; data: Societe }> {
    return apiGet(`societes/${id}`)
  },

  async create(payload: SocietePayload): Promise<{ success: boolean; message: string; data: Societe }> {
    return apiPost('societes', payload)
  },

  async update(id: number, payload: Partial<SocietePayload>): Promise<{ success: boolean; message: string; data: Societe }> {
    return apiPut('societes', id, payload)
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('societes', id)
  },
}

export type { Societe, SocietePayload }