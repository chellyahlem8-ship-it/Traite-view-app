/** Données du formulaire de création */
export interface TraiteFormData {
  fournisseur: string;      // Le tiré (celui qui paie)
  client: string;           // Le tireur (celui qui émet)
  banque: string;
  rib: string;
  montantTotal: number;
  nombreTraitess: number;
  dateEcheance: string;     // ISO date string
  lieu: string;
  beneficiaire: string;
}

/** Une traite individuelle générée */
export interface Traite {
  id: string;
  numero: string;
  fournisseur: string;
  client: string;
  banque: string;
  rib: string;
  montant: number;
  montantLettres: string;
  dateEmission: string;
  dateEcheance: string;
  lieu: string;
  beneficiaire: string;
  index: number;            // Position dans la série (0-based)
  totalDansSerie: number;   // Nombre total dans la série
}

/** Payload envoyé au backend pour sauvegarde */
export interface SaveTraitessPayload {
  traitess: Omit<Traite, 'id' | 'montantLettres'>[];
}

/** Réponse du backend */
export interface TraiteApiResponse {
  success: boolean;
  message: string;
  data?: {
    traitess: Traite[];
    reference: string;
  };
}

/** Positions des champs sur le template de traite (en %) */
export interface TraiteFieldPositions {
  numero: { top: string; right: string };
  tireur: { top: string; left: string };
  tire: { top: string; left: string };
  banque: { top: string; left: string };
  rib: { top: string; left: string };
  montantChiffres: { top: string; right: string };
  montantLettres: { top: string; left: string; width: string };
  dateEcheance: { top: string; right: string };
  lieu: { top: string; left: string };
  dateEmission: { top: string; left: string };
  beneficiaire: { top: string; left: string };
  signature: { bottom: string; right: string };
}