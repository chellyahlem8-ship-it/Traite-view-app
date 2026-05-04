// ─────────────────────────────────────────────
// signup.types.ts
// ─────────────────────────────────────────────

export interface SignupPayload {
  nom: string
  prenom: string
  email: string
  motDePasse: string
  confirmMotDePasse: string
  idPack: number
  methodePaiement: 'online' | 'virement'
}

export interface Pack {
  id: number
  nom: string
  description?: string
  prix: number
  devise: string
  periode?: string        // ex: 'mois', 'trim.', 'an'
  features?: string[]
  popular?: boolean
}

export interface SignupResponse {
  success: boolean
  message: string
}

export interface PaymentSimulationResponse {
  success: boolean
  transactionId: string
  message: string
}

export interface BankInfo {
  banque: string
  RIB: string
  beneficiaire: string
}