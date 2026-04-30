import type { CompteBancaire } from './comptesBancaires'

export interface TypeTier {
  id: number
  type: string
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
  type_tiers?: TypeTier
  comptes_bancaires?: CompteBancaire[]
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

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}