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

  // ── Sociétés pour le <select> ─────────────────────────────────
  // Gère les deux clés possibles du backend: nomSociete / raisonSociale
  async getSocietes(): Promise<Societe[]> {
    const res = await apiGet<unknown>('societes')

    let list: unknown[] = []
    if (Array.isArray(res)) {
      list = res
    } else if (res && typeof res === 'object') {
      const r = res as Record<string, unknown>
      if (Array.isArray(r.data))      list = r.data
      else if (Array.isArray(r.societes)) list = r.societes
    }

    return list.map((item: unknown) => {
      const s = item as Record<string, unknown>
      return {
        idSociete:    (s.idSociete ?? s.id) as number,
        nomSociete:   (s.nomSociete    ?? s.raisonSociale ?? '') as string,
        raisonSociale:(s.raisonSociale ?? s.nomSociete    ?? '') as string,
      } as Societe
    })
  },
}