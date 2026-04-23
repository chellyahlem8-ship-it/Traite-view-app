// ── Types backend ────────────────────────────────────────────────

export type TypeTraite = 'fournisseur' | 'client';

/** Données du formulaire de création */
export interface TraiteFormData {
  typeTraite: TypeTraite;
  // Champs libres (plus de sélection depuis le backend)
  tireurNom: string;          // Nom du tiers (saisie libre)
  banqueNom: string;          // Nom de la banque (saisie libre)
  rib: string;                // RIB (saisie libre)
  montantTotal: number;
  nombreTraites: number;
  lieu: string;
  beneficiaire: string;
}

/** Une traite individuelle dans la série (côté frontend) */
export interface TraiteItem {
  id: string;
  index: number;
  totalDansSerie: number;
  numero: string;
  typeTraite: TypeTraite;
  montant: number;
  montantLettres: string;
  dateEmission: string;       // YYYY-MM-DD (today)
  dateEcheance: string;       // YYYY-MM-DD (éditable)
  lieu: string;
  beneficiaire: string;
  tireurNom: string;
  banqueNom: string;
  rib: string;
}

/** Payload envoyé au backend (une traite à la fois) */
export interface SaveTraitePayload {
  montant: number;
  type_traite: TypeTraite;
  date_emission: string;
  date_echeance: string;
  tireur_nom: string;
  banque_nom: string;
  rib: string;
  statuts_traites_id?: number;
}

/** Statut traite depuis le backend */
export interface StatutTraite {
  id: number;
  statut: string;
}
