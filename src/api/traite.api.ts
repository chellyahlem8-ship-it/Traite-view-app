import type { SaveTraitessPayload, TraiteApiResponse } from '@/types/traite.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/** Récupère le token d'auth depuis le store ou le localStorage */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/** Headers communs pour les requêtes authentifiées */
function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

/** Enregistre un lot de traites auprès du backend */
export async function saveTraitess(payload: SaveTraitessPayload): Promise<TraiteApiResponse> {
  const response = await fetch(`${API_BASE_URL}/traites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}

/** Récupère la liste des traites existantes */
export async function fetchTraitess(): Promise<TraiteApiResponse> {
  const response = await fetch(`${API_BASE_URL}/traites`, {
    method: 'GET',
    headers: authHeaders()
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}