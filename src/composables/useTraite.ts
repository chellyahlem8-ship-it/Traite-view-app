import { useTraiteStore } from '@/stores/traite.store';
import { computed } from 'vue';

/**
 * Composable d'interface pour la gestion des traites
 * Expose la logique métier de façon réutilisable sans coupler au store directement
 */
export function useTraite() {
  const store = useTraiteStore();

  const formState = computed(() => store.formData);
  const traitess = computed(() => store.generatedTraitess);
  const current = computed(() => store.currentTraite);
  const currentIndex = computed(() => store.currentPreviewIndex);
  const count = computed(() => store.totalTraitess);
  const isValid = computed(() => store.canGenerate);
  const unitAmount = computed(() => store.montantParTraite);
  const saving = computed(() => store.isSaving);
  const error = computed(() => store.saveError);
  const success = computed(() => store.saveSuccess);

  function setField<K extends keyof typeof store.formData>(
    field: K,
    value: (typeof store.formData)[K]
  ): void {
    store.updateField(field, value);
  }

  function generate(): void {
    if (store.canGenerate) {
      store.generateTraitess();
    }
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
    formState,
    traitess,
    current,
    currentIndex,
    count,
    isValid,
    unitAmount,
    saving,
    error,
    success,
    setField,
    generate,
    navigateTo,
    navigateNext,
    navigatePrev,
    clearAll,
    save
  };
}