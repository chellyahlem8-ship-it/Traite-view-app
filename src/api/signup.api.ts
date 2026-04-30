// ─────────────────────────────────────────────
// signup.api.ts
// ─────────────────────────────────────────────
import type { SignupPayload, SignupResponse, Pack } from '@/types/signup.types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erreur serveur')
  return data as T
}

export const signupApi = {
  /**
   * Récupère la liste des packs disponibles depuis l'API.
   */
  async getPacks(): Promise<Pack[]> {
    const res = await fetch(`${BASE_URL}/packs`, {
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<Pack[]>(res)
  },

  /**
   * Soumet la demande d'inscription avec le pack et la méthode de paiement choisis.
   * Le compte sera créé en statut "en attente" — l'admin doit valider.
   */
  async register(payload: SignupPayload): Promise<SignupResponse> {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<SignupResponse>(res)
  },
}