import type { CompteBancaire } from './comptesBancaires'

export interface Tier {
  id: number;
  raison_sociale: string;
  email: string;
  adresse: string;
  num_tel: number;
  types_tiers_id: number;
  idSociete: number;
  created_at?: string;
  type_tiers?: { id: number; type: string };
  comptes_bancaires?: CompteBancaire[];
}

export interface CreateTierPayload {
  raison_sociale: string;
  email: string;
  adresse: string;
  num_tel: number;
  types_tiers_id: number;
  idSociete: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}