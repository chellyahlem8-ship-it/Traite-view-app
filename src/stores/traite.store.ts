import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TraiteItem, TraiteFormData, StatutTraite } from '@/types/traite.types';
import { montantEnLettres } from '@/utils/numberToWords';

// ─── Helpers ─────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function generateNumero(index: number, total: number): string {
  const year = new Date().getFullYear();
  const seq = String(index + 1).padStart(4, '0');
  const totalStr = String(total).padStart(2, '0');
  return `TRA-${year}-${seq}/${totalStr}`;
}

// ─── Store ───────────────────────────────────────────────────────

export const useTraiteStore = defineStore('traite', () => {

  // ── State: formulaire principal ──
  const formData = ref<TraiteFormData>({
    typeTraite: 'fournisseur',
    tireurNom: '',
    banqueNom: '',
    rib: '',
    montantTotal: 0,
    nombreTraites: 1,
    lieu: '',
    beneficiaire: ''
  });

  // ── State: traites générées ──
  const generatedTraites = ref<TraiteItem[]>([]);
  const currentPreviewIndex = ref(0);

  // ── State: sauvegarde ──
  const isSaving = ref(false);
  const saveError = ref<string | null>(null);
  const saveSuccess = ref(false);

  // ─── Getters ─────────────────────────────────────────────────

  const currentTraite = computed<TraiteItem | null>(
    () => generatedTraites.value[currentPreviewIndex.value] ?? null
  );

  const totalTraites = computed(() => generatedTraites.value.length);

  const canGenerate = computed(() => {
    const f = formData.value;
    return (
      f.tireurNom.trim() !== '' &&
      f.banqueNom.trim() !== '' &&
      f.rib.trim() !== '' &&
      f.montantTotal > 0 &&
      f.nombreTraites >= 1 &&
      f.lieu.trim() !== '' &&
      f.beneficiaire.trim() !== ''
    );
  });

  const montantParTraite = computed(() => {
    if (formData.value.nombreTraites < 1 || formData.value.montantTotal <= 0) return 0;
    return formData.value.montantTotal / formData.value.nombreTraites;
  });

  // ─── Actions: formulaire ──────────────────────────────────────

  function updateField<K extends keyof TraiteFormData>(field: K, value: TraiteFormData[K]): void {
    (formData.value as any)[field] = value;
  }

  // ─── Actions: génération ──────────────────────────────────────

  function generateTraites(): void {
    if (!canGenerate.value) return;

    const f = formData.value;
    const n = f.nombreTraites;
    const today = todayStr();

    const montantUnitaire = Math.floor((f.montantTotal / n) * 1000) / 1000;
    const montantDerniere = Math.round((f.montantTotal - montantUnitaire * (n - 1)) * 1000) / 1000;

    generatedTraites.value = Array.from({ length: n }, (_, i) => ({
      id: crypto.randomUUID(),
      index: i,
      totalDansSerie: n,
      numero: generateNumero(i, n),
      typeTraite: f.typeTraite,
      montant: i === n - 1 ? montantDerniere : montantUnitaire,
      montantLettres: montantEnLettres(i === n - 1 ? montantDerniere : montantUnitaire),
      dateEmission: today,
      dateEcheance: '',
      lieu: f.lieu,
      beneficiaire: f.beneficiaire,
      tireurNom: f.tireurNom,
      banqueNom: f.banqueNom,
      rib: f.rib
    }));

    currentPreviewIndex.value = 0;
  }

  function updateTraiteField(index: number, field: 'montant' | 'dateEcheance', value: string | number): void {
    if (!generatedTraites.value[index]) return;
    const traite = { ...generatedTraites.value[index] };

    if (field === 'montant') {
      traite.montant = Math.round(Number(value) * 1000) / 1000;
      traite.montantLettres = montantEnLettres(traite.montant);
    } else {
      traite.dateEcheance = String(value);
    }

    generatedTraites.value = generatedTraites.value.map((t, i) => i === index ? traite : t);
  }

  // ─── Actions: navigation ──────────────────────────────────────

  function goToTraite(index: number): void {
    if (index >= 0 && index < totalTraites.value) {
      currentPreviewIndex.value = index;
    }
  }

  function nextTraite(): void {
    if (currentPreviewIndex.value < totalTraites.value - 1) {
      currentPreviewIndex.value++;
    }
  }

  function prevTraite(): void {
    if (currentPreviewIndex.value > 0) {
      currentPreviewIndex.value--;
    }
  }

  // ─── Actions: réinitialisation ────────────────────────────────

  function reset(): void {
    formData.value = {
      typeTraite: 'fournisseur',
      tireurNom: '',
      banqueNom: '',
      rib: '',
      montantTotal: 0,
      nombreTraites: 1,
      lieu: '',
      beneficiaire: ''
    };
    generatedTraites.value = [];
    currentPreviewIndex.value = 0;
    saveError.value = null;
    saveSuccess.value = false;
  }

  // ─── Actions: sauvegarde ──────────────────────────────────────

  async function saveToBackend(): Promise<void> {
    isSaving.value = true;
    saveError.value = null;
    saveSuccess.value = false;

    const missingEcheance = generatedTraites.value.findIndex(t => !t.dateEcheance);
    if (missingEcheance !== -1) {
      saveError.value = `La date d'échéance est manquante pour la traite ${missingEcheance + 1}`;
      isSaving.value = false;
      return;
    }

    try {
      // Adaptez cette section selon votre API backend
      for (const traite of generatedTraites.value) {
        console.log('Saving traite:', traite);
        // await saveTraite({ ... })
      }
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 4000);
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Erreur inconnue lors de la sauvegarde';
    } finally {
      isSaving.value = false;
    }
  }

  // ─── Expose ──────────────────────────────────────────────────

  return {
    formData,
    generatedTraites,
    currentPreviewIndex,
    isSaving,
    saveError,
    saveSuccess,
    currentTraite,
    totalTraites,
    canGenerate,
    montantParTraite,
    updateField,
    generateTraites,
    updateTraiteField,
    goToTraite,
    nextTraite,
    prevTraite,
    reset,
    saveToBackend
  };
});