import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Traite, TraiteFormData } from '@/types/traite.types';
import { montantEnLettres } from '@/utils/numberToWords';

/** Génère un numéro de traite formaté */
function generateNumero(index: number, total: number): string {
  const year = new Date().getFullYear();
  const seq = String(index + 1).padStart(4, '0');
  return `TRA-${year}-${seq}`;
}

/** Calcule les dates d'échéance réparties entre aujourd'hui et la date cible */
function computeEcheanceDates(
  dateEcheanceCible: string,
  count: number
): string[] {
  const today = new Date();
  const target = new Date(dateEcheanceCible);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.max(diffMs / (1000 * 60 * 60 * 24), 0);
  const interval = count > 1 ? diffDays / (count - 1) : 0;

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today.getTime() + interval * i * (1000 * 60 * 60 * 24));
    return date.toISOString().split('T')[0];
  });
}

export const useTraiteStore = defineStore('traite', () => {
  // ─── State ───────────────────────────────────
  const formData = ref<TraiteFormData>({
    fournisseur: '',
    client: '',
    banque: '',
    rib: '',
    montantTotal: 0,
    nombreTraitess: 1,
    dateEcheance: '',
    lieu: '',
    beneficiaire: ''
  });

  const generatedTraitess = ref<Traite[]>([]);
  const currentPreviewIndex = ref(0);
  const isSaving = ref(false);
  const saveError = ref<string | null>(null);
  const saveSuccess = ref(false);

  // ─── Getters ─────────────────────────────────
  const currentTraite = computed<Traite | null>(() => {
    return generatedTraitess.value[currentPreviewIndex.value] ?? null;
  });

  const totalTraitess = computed(() => generatedTraitess.value.length);

  const canGenerate = computed(() => {
    const f = formData.value;
    return (
      f.fournisseur.trim() !== '' &&
      f.client.trim() !== '' &&
      f.banque.trim() !== '' &&
      f.rib.trim() !== '' &&
      f.montantTotal > 0 &&
      f.nombreTraitess >= 1 &&
      f.dateEcheance !== '' &&
      f.lieu.trim() !== '' &&
      f.beneficiaire.trim() !== ''
    );
  });

  const montantParTraite = computed(() => {
    if (formData.value.nombreTraitess < 1 || formData.value.montantTotal <= 0) return 0;
    return formData.value.montantTotal / formData.value.nombreTraitess;
  });

  // ─── Actions ─────────────────────────────────

  /** Met à jour un champ du formulaire */
  function updateField<K extends keyof TraiteFormData>(field: K, value: TraiteFormData[K]): void {
    formData.value[field] = value;
    // Si on change le nombre, régénérer automatiquement si déjà généré
    if (field === 'nombreTraitess' && generatedTraitess.value.length > 0) {
      generateTraitess();
    }
  }

  /** Génère les N traites à partir du formulaire */
  function generateTraitess(): void {
    const f = formData.value;
    const n = f.nombreTraitess;
    const montantUnitaire = f.montantTotal / n;
    const dates = computeEcheanceDates(f.dateEcheance, n);
    const today = new Date().toISOString().split('T')[0];

    generatedTraitess.value = Array.from({ length: n }, (_, i) => ({
      id: crypto.randomUUID(),
      numero: generateNumero(i, n),
      fournisseur: f.fournisseur,
      client: f.client,
      banque: f.banque,
      rib: f.rib,
      montant: Math.round(montantUnitaire * 1000) / 1000,
      montantLettres: montantEnLettres(montantUnitaire),
      dateEmission: today,
      dateEcheance: dates[i],
      lieu: f.lieu,
      beneficiaire: f.beneficiaire,
      index: i,
      totalDansSerie: n
    }));

    currentPreviewIndex.value = 0;
  }

  /** Navigation entre les traites générées */
  function goToTraite(index: number): void {
    if (index >= 0 && index < totalTraitess.value) {
      currentPreviewIndex.value = index;
    }
  }

  function nextTraite(): void {
    if (currentPreviewIndex.value < totalTraitess.value - 1) {
      currentPreviewIndex.value++;
    }
  }

  function prevTraite(): void {
    if (currentPreviewIndex.value > 0) {
      currentPreviewIndex.value--;
    }
  }

  /** Réinitialise tout */
  function reset(): void {
    formData.value = {
      fournisseur: '',
      client: '',
      banque: '',
      rib: '',
      montantTotal: 0,
      nombreTraitess: 1,
      dateEcheance: '',
      lieu: '',
      beneficiaire: ''
    };
    generatedTraitess.value = [];
    currentPreviewIndex.value = 0;
    saveError.value = null;
    saveSuccess.value = false;
  }

  /** Sauvegarde via l'API */
  async function saveToBackend(): Promise<void> {
    isSaving.value = true;
    saveError.value = null;
    saveSuccess.value = false;

    try {
      const { saveTraitess } = await import('@/api/traite.api');
      const payload = {
        traitess: generatedTraitess.value.map(({ id, montantLettres, ...rest }) => rest)
      };
      await saveTraitess(payload);
      saveSuccess.value = true;
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
      isSaving.value = false;
    }
  }

  return {
    // State
    formData,
    generatedTraitess,
    currentPreviewIndex,
    isSaving,
    saveError,
    saveSuccess,
    // Getters
    currentTraite,
    totalTraitess,
    canGenerate,
    montantParTraite,
    // Actions
    updateField,
    generateTraitess,
    goToTraite,
    nextTraite,
    prevTraite,
    reset,
    saveToBackend
  };
});