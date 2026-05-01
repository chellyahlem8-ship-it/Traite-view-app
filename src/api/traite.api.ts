import type { SaveTraitePayload, Tier, CompteBancaire, StatutTraite } from '@/types/traite.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
  return localStorage.getItem('traity_token');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }
  return response.json();
}

/** Enregistre une seule traite (le backend attend une traite à la fois) */
export async function saveTraite(payload: SaveTraitePayload): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/traites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

/** Récupère la liste des tiers */
export async function fetchTiers(): Promise<{ success: boolean; data: Tier[] }> {
  const response = await fetch(`${API_BASE_URL}/tiers`, {
    method: 'GET',
    headers: authHeaders()
  });
  return handleResponse(response);
}

/** Récupère les comptes bancaires (optionnellement filtrés par titulaire) */
export async function fetchComptesBancaires(tierId?: number): Promise<{ success: boolean; data: CompteBancaire[] }> {
  const url = tierId
    ? `${API_BASE_URL}/comptes-bancaires?titulaire_id=${tierId}`
    : `${API_BASE_URL}/comptes-bancaires`;
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  return handleResponse(response);
}

/** Récupère les statuts de traite */
export async function fetchStatuts(): Promise<{ success: boolean; data: StatutTraite[] }> {
  const response = await fetch(`${API_BASE_URL}/statuts`, {
    method: 'GET',
    headers: authHeaders()
  });
  return handleResponse(response);
}

/** Récupère la liste des traites */
export async function fetchTraites(): Promise<{ success: boolean; data: any[] }> {
  const response = await fetch(`${API_BASE_URL}/traites`, {
    method: 'GET',
    headers: authHeaders()
  });
  return handleResponse(response);
}