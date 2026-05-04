export interface Societe {
  idSociete:     number
  raisonSociale: string
  adresse:       string
  telephone:     number
  email:         string
  abonnements?:  Abonnement[]
  created_at?:   string
  updated_at?:   string
}

export interface Abonnement {
  id:         number
  idSociete:  number
  tarif?:     Tarif
  created_at?: string
  updated_at?: string
}

export interface Tarif {
  id:    number
  nom:   string
  prix:  number
}

export interface SocietePayload {
  raisonSociale: string
  adresse:       string
  telephone:     number
  email:         string
}