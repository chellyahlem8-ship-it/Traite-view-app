export interface Utilisateur {
  idUtilisateur: number
  nom: string
  prenom: string
  role: string
  email: string
  idSociete: number
  societe?: { idSociete: number; nomSociete: string }
  created_at?: string
  updated_at?: string
}

export interface CreateUtilisateurPayload {
  nom: string
  prenom: string
  role: string
  email: string
  motDePasse: string
  idSociete: number | null
}

export interface Societe {
  idSociete: number
  nomSociete: string
}