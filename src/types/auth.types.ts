export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  idUtilisateur: number
  nom: string
  prenom: string
  email: string
  role: string
  idSociete: number
}

export interface AuthResponse {
  success: boolean
  token: string
  token_type: string
  utilisateur: AuthUser
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string        // ← ajouté
  token: string
  new_password: string
  confirm_password: string
}

export interface ApiError {
  message: string
}