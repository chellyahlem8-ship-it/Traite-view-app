const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'traity_token'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

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

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const err: any = new Error(
      data.message || JSON.stringify(data.errors) || 'Erreur serveur'
    )
    err.status = res.status
    err.errors = data.errors || null
    throw err
  }
  return data as T
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  let url = `${BASE_URL}/${cleanEndpoint}`
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString()
    url += `?${qs}`
  }
  const res = await fetch(url, { method: 'GET', headers: buildHeaders() })
  return handleResponse<T>(res)
}

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