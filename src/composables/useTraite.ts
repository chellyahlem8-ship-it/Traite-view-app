import { storeToRefs } from 'pinia';
import { useTraiteStore } from '@/stores/traite.store';
import type { TraiteFormData } from '@/types/traite.types';

export function useTraite() {
  const store = useTraiteStore();

  const {
    // Données de référence
    societe,
    loadingSociete,
    loadingTiers,
    loadingComptes,
    // Computed filtrés
    tiersFiltered,
    tiersSelectionne,
    comptesDisponibles,
    compteSelectionne,
    // Formulaire
    formData,
    generatedTraites,
    currentTraite,
    currentPreviewIndex,
    totalTraites,
    canGenerate,
    montantParTraite,
    isSaving,
    saveError,
    saveSuccess,
  } = storeToRefs(store);

  // ── Initialisation ──────────────────────────────────────────────
  async function init(): Promise<void> {
    await store.init();
  }

  // ── Mise à jour d'un champ du formulaire ────────────────────────
  function setField<K extends keyof TraiteFormData>(field: K, value: TraiteFormData[K]): void {
    store.updateField(field, value);
  }

  // ── Génération ─────────────────────────────────────────────────
  function generate(): void {
    if (canGenerate.value) store.generateTraites();
  }

  function updateTraiteField(index: number, field: 'montant' | 'dateEcheance', value: string | number): void {
    store.updateTraiteField(index, field, value);
  }

  // ── Navigation ─────────────────────────────────────────────────
  function navigateTo(index: number): void {
    store.goToTraite(index);
  }

  function navigateNext(): void {
    store.nextTraite();
  }

  function navigatePrev(): void {
    store.prevTraite();
  }

  // ── Réinitialisation ────────────────────────────────────────────
  function clearAll(): void {
    store.reset();
  }

  // ── Sauvegarde ─────────────────────────────────────────────────
  async function save(): Promise<void> {
    await store.saveToBackend();
  }

  return {
    // Société connectée
    societe,
    loadingSociete,
    loadingTiers,
    loadingComptes,
    // Listes dynamiques
    tiersFiltered,
    tiersSelectionne,
    comptesDisponibles,
    compteSelectionne,
    // Formulaire
    formState: formData,
    traites: generatedTraites,
    current: currentTraite,
    currentIndex: currentPreviewIndex,
    count: totalTraites,
    isValid: canGenerate,
    unitAmount: montantParTraite,
    saving: isSaving,
    error: saveError,
    success: saveSuccess,
    // Actions
    init,
    setField,
    generate,
    updateTraiteField,
    navigateTo,
    navigateNext,
    navigatePrev,
    clearAll,
    save,
  };
}