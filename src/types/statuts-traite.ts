export interface StatutTraite {
  id: number;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStatutTraitePayload {
  statut: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}