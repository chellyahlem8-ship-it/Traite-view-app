import type { LoginPayload, AuthResponse, ResetPasswordPayload } from '@/types/auth.types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erreur serveur')
  return data as T
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        motDePasse: payload.password,
      }),
    })
    return handleResponse<AuthResponse>(res)
  },

  async forgotPassword(payload: { email: string }): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<{ message: string }>(res)
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<{ message: string }>(res)
  },

  async getMe(token: string): Promise<AuthResponse['utilisateur']> {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse<AuthResponse['utilisateur']>(res)
  },

  async logout(token: string): Promise<void> {
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
