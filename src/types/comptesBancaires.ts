export interface CompteBancaire {
  id: number
  rib: string
  adresse_agence: string
  banque_id: number
  titulaire_id: number
  titulaire_type: string // 'App\\Models\\Tiers' | 'App\\Models\\Societe'
  banque?: { id: number; nomBanque: string }
  titulaire?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface CreateCompteBancairePayload {
  rib: string
  adresse_agence: string
  banque_id: number
  titulaire_id: number
  titulaire_type: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}