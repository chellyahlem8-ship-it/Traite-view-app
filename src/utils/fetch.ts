import type { ApiError } from '@/types/tiers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Récupération du token (depuis localStorage ou store)
  const token = localStorage.getItem('traity__token');

  // CORRECTION ICI :
  // On change le type de 'headers' de 'HeadersInit' vers 'Record<string, string>'.
  // Cela permet d'assigner des valeurs via la notation crochet ['Authorization'] sans erreur.
  // On caste 'options.headers' pour s'assurer que le spread fonctionne correctement.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Ajout du Authorization si le token existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Gestion des erreurs HTTP (4xx, 5xx)
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: 'Une erreur réseau est survenue.'
      }));
      throw errorData;
    }

    return response.json();
  } catch (error) {
    // Si c'est une erreur qu'on a lancé manuellement (Laravel validation), on la relance
    if (error instanceof Object && 'message' in error) {
      throw error;
    }
    // Sinon (erreur réseau pure)
    throw { message: 'Impossible de contacter le serveur.' };
  }
}