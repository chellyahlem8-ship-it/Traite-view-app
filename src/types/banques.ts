export interface Banque {
  id: number;
  nomBanque: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBanquePayload {
  nomBanque: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}