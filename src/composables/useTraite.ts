import { storeToRefs } from 'pinia';
import { useTraiteStore } from '@/stores/traite.store';
import type { TraiteFormData } from '@/types/traite.types';

export function useTraite() {
  const store = useTraiteStore();

  const {
    formData,
    generatedTraites,
    currentTraite,
    currentPreviewIndex,
    totalTraites,
    canGenerate,
    montantParTraite,
    isSaving,
    saveError,
    saveSuccess
  } = storeToRefs(store);

  function setField<K extends keyof TraiteFormData>(field: K, value: TraiteFormData[K]): void {
    store.updateField(field, value);
  }

  function generate(): void {
    if (canGenerate.value) {
      store.generateTraites();
    }
  }

  function updateTraiteField(index: number, field: 'montant' | 'dateEcheance', value: string | number): void {
    store.updateTraiteField(index, field, value);
  }

  function navigateTo(index: number): void {
    store.goToTraite(index);
  }

  function navigateNext(): void {
    store.nextTraite();
  }

  function navigatePrev(): void {
    store.prevTraite();
  }

  function clearAll(): void {
    store.reset();
  }

  async function save(): Promise<void> {
    await store.saveToBackend();
  }

  return {
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
    setField,
    generate,
    updateTraiteField,
    navigateTo,
    navigateNext,
    navigatePrev,
    clearAll,
    save
  };
}