export type TypeTraite = 'fournisseur' | 'client';

export interface Societe {
  id?: number;
  idSociete?: number;
  raisonSociale: string;
  nom_societe?: string;
  adresse?: string;
  email?: string;
  telephone?: number;
}

export interface Tier {
  id: number;
  raison_sociale: string;
  email?: string;
  adresse?: string;
  num_tel?: number;
  types_tiers_id: number;
  idSociete: number;
  type_tiers?: { id: number; type: string };
  comptes_bancaires?: CompteBancaire[];
}

export interface CompteBancaire {
  id: number;
  rib: string;
  adresse_agence?: string;
  banque_id: number;
  titulaire_id: number;
  titulaire_type: string;
  banque?: { id: number; nomBanque: string };
}

export interface TraiteFormData {
  typeTraite: TypeTraite;
  tiersSelectionneId: number | null;
  compteBancaireId: number | null;
  tireurNom: string;
  tireurAdresse: string;
  tireNom: string;
  tireAdresse: string;
  banqueNom: string;
  rib: string;
  beneficiaire: string;
  montantTotal: number;
  nombreTraites: number;
  lieu: string;
}

export interface TraiteItem {
  id: string;
  index: number;
  totalDansSerie: number;
  numero: string;
  typeTraite: TypeTraite;
  montant: number;
  montantLettres: string;
  dateEmission: string;
  dateEcheance: string;
  lieu: string;
  beneficiaire: string;
  tireurNom: string;
  tireNom: string;
  banqueNom: string;
  rib: string;
}

/**
 * Payload envoyé au POST /api/traites
 * NE PAS inclure statuts_traites_id — le backend l'ajoute automatiquement en "Non échue"
 */
export interface SaveTraitePayload {
  montant: number;
  type_traite: TypeTraite;
  date_emission: string;
  date_echeance: string;
  comptes_bancaires_id: number;
  tireur_id: number;
  tireur_type: string;
}

export interface StatutTraite {
  id: number;
  statut: string;
}