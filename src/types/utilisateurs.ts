export interface Utilisateur {
  idUtilisateur: number
  nom: string
  prenom: string
  role: string
  email: string
  idSociete: number
  societe?: { idSociete: number; nomSociete?: string; raisonSociale?: string }
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

// Accepte nomSociete OU raisonSociale selon ce que renvoie votre backend
export interface Societe {
  idSociete: number
  nomSociete?: string
  raisonSociale?: string
}

/** Retourne le nom lisible d'une société quelle que soit la clé utilisée */
export function getSocieteName(s: Societe): string {
  return s.nomSociete ?? s.raisonSociale ?? `Société #${s.idSociete}`
}