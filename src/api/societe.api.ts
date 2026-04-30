import { apiGet } from './apiClient'

export interface Societe {
  id: number
  nom_societe: string
  email?: string
  adresse?: string
  telephone?: string
  matricule_fiscale?: string
  created_at?: string
  updated_at?: string
}

export const societeApi = {
  /**
   * GET /api/societes/:id
   * Récupère les informations d'une société par son ID.
   */
  async getOne(id: number): Promise<{ success: boolean; data: Societe }> {
    return apiGet(`societes/${id}`)
  },

  /**
   * GET /api/societes
   * Liste toutes les sociétés (utile pour les selects).
   */
  async getAll(): Promise<{ success: boolean; data: Societe[] }> {
    return apiGet('societes')
  },
}
