/**
 * apiClient.ts
 * ─────────────────────────────────────────────────────────────
 * Client HTTP centralisé basé sur fetch (sans axios).
 * Toutes les requêtes authentifiées passent par ce fichier.
 * Il ajoute automatiquement :
 *   - Content-Type: application/json
 *   - Authorization: Bearer <token> (si connecté)
 * ─────────────────────────────────────────────────────────────
 */

// L'URL de base pointe vers votre backend Laravel.
// Dans votre fichier .env Vite (à la racine frontend), mettez :
//   VITE_API_URL=http://localhost:8000/api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ─── Clé localStorage pour le token JWT ──────────────────────
const TOKEN_KEY = 'traity_token'

// ─── Récupérer le token stocké ────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// ─── Construire les headers communs ───────────────────────────
function buildHeaders(withAuth = true): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (withAuth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ─── Gestionnaire de réponse générique ────────────────────────
// Lance une erreur avec le message du serveur si la réponse n'est pas OK.
// L'erreur porte `.status` et `.errors` pour le traitement fin côté composant.
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const err: any = new Error(
      data.message || JSON.stringify(data.errors) || 'Erreur serveur'
    )
    err.status = res.status
    err.errors = data.errors || null   // ← utile pour les erreurs 422 Laravel
    throw err
  }
  return data as T
}

// ─── Méthodes HTTP ────────────────────────────────────────────

/** GET /api/<endpoint> */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  let url = `${BASE_URL}/${cleanEndpoint}`

  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      )
    ).toString()
    url += `?${qs}`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<T>(res)
}

/** POST /api/<endpoint>
 *  withAuth = false  →  requête publique (signup, login, forgot…)
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  withAuth = true
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: buildHeaders(withAuth),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

/** PUT /api/<endpoint>/<id> */
export async function apiPut<T>(
  endpoint: string,
  id: number | string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

/** DELETE /api/<endpoint>/<id> */
export async function apiDelete<T>(
  endpoint: string,
  id: number | string
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })
  return handleResponse<T>(res)
}