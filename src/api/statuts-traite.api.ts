import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import type { StatutTraite, CreateStatutTraitePayload } from '@/types/statuts-traite'

export type { StatutTraite }

export interface StatutTraitePayload extends CreateStatutTraitePayload {}

export const statutsTraiteApi = {
  async getAll(): Promise<{ success: boolean; data: StatutTraite[] }> {
    return apiGet('statuts-traites')
  },

  async getOne(id: number): Promise<{ success: boolean; data: StatutTraite }> {
    return apiGet(`statuts-traites/${id}`)
  },

  async create(
    payload: StatutTraitePayload
  ): Promise<{ success: boolean; message: string; data: StatutTraite }> {
    return apiPost('statuts-traites', payload)
  },

  async update(
    id: number,
    payload: Partial<StatutTraitePayload>
  ): Promise<{ success: boolean; message: string; data: StatutTraite }> {
    return apiPut('statuts-traites', id, payload)
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiDelete('statuts-traites', id)
  },
}