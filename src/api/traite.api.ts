import type { SaveTraitePayload, Tier, CompteBancaire, StatutTraite } from '@/types/traite.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
  return localStorage.getItem('traity_token');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

/** Crée une traite — statuts_traites_id ajouté automatiquement par le backend */
export async function saveTraite(payload: SaveTraitePayload): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/traites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

/** Récupère la liste des traites avec leurs relations */
export async function fetchTraites(params?: {
  statuts_traites_id?: number
  type_traite?: string
  comptes_bancaires_id?: number
  montant_min?: number
  montant_max?: number
  date_echeance_debut?: string
  date_echeance_fin?: string
}): Promise<{ success: boolean; data: any[] }> {
  const url = new URL(`${API_BASE_URL}/traites`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.append(k, String(v));
    });
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: authHeaders()
  });
  return handleResponse(response);
}

/** Met à jour le statut d'une traite — persiste en base */
export async function updateTraiteStatut(
  traitId: number,
  statutId: number
): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`${API_BASE_URL}/traites/${traitId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ statuts_traites_id: statutId })
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

/** Récupère les comptes bancaires */
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
  const response = await fetch(`${API_BASE_URL}/statuts-traites`, {
    method: 'GET',
    headers: authHeaders()
  });
  return handleResponse(response);
}

/** Crée un nouveau statut de traite */
export async function createStatut(statut: string): Promise<{ success: boolean; data: StatutTraite }> {
  const response = await fetch(`${API_BASE_URL}/statuts-traites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ statut })
  });
  return handleResponse(response);
}

/** Annule une traite */
export async function cancelTraite(id: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/traites/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  return handleResponse(response);
}

/** Supprime une traite */
export async function deleteTraite(id: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/traites/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse(response);
}