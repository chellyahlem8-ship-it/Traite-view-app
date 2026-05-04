import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type {
  TraiteItem,
  TraiteFormData,
  Tier,
  CompteBancaire,
  Societe,
} from '@/types/traite.types';
import { montantEnLettres } from '@/utils/numberToWords';
import { apiGet, apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/stores/auth.store';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateNumero(index: number, total: number): string {
  const year = new Date().getFullYear();
  return `TRA-${year}-${String(index + 1).padStart(4, '0')}/${String(total).padStart(2, '0')}`;
}

function isSocieteType(t: string): boolean {
  const norm = t.replace(/\\\\/g, '\\').toLowerCase();
  return norm.includes('societe');
}

function isTierType(t: string): boolean {
  const norm = t.replace(/\\\\/g, '\\').toLowerCase();
  return norm.includes('tier');
}

function emptyForm(): TraiteFormData {
  return {
    typeTraite: 'fournisseur',
    tiersSelectionneId: null,
    compteBancaireId: null,
    tireurNom: '',
    tireurAdresse: '',
    tireNom: '',
    tireAdresse: '',
    banqueNom: '',
    rib: '',
    beneficiaire: '',
    montantTotal: 0,
    nombreTraites: 1,
    lieu: '',
  };
}

export const useTraiteStore = defineStore('traite', () => {
  const authStore = useAuthStore();

  const societe          = ref<Societe | null>(null);
  const tiers            = ref<Tier[]>([]);
  const comptesBancaires = ref<CompteBancaire[]>([]);
  const statuts          = ref<Array<{ id: number; statut: string }>>([]);

  const loadingSociete = ref(false);
  const loadingTiers   = ref(false);
  const loadingComptes = ref(false);

  const formData            = ref<TraiteFormData>(emptyForm());
  const generatedTraites    = ref<TraiteItem[]>([]);
  const currentPreviewIndex = ref(0);

  const isSaving    = ref(false);
  const saveError   = ref<string | null>(null);
  const saveSuccess = ref(false);

  const tiersFiltered = computed<Tier[]>(() => {
    const type = formData.value.typeTraite;
    return tiers.value.filter((t) => {
      const tierType = t.type_tiers?.type?.toLowerCase() ?? '';
      // Un tiers qui a exactement le type demandé OU un tiers mixte (ex: "client/fournisseur", "les deux")
      return tierType === type || tierType.includes(type) || tierType.includes('les deux') || tierType.includes('both');
    });
  });

  const tiersSelectionne = computed<Tier | null>(() => {
    if (!formData.value.tiersSelectionneId) return null;
    return tiers.value.find((t) => t.id === formData.value.tiersSelectionneId) ?? null;
  });

  const comptesDisponibles = computed<CompteBancaire[]>(() => {
    if (formData.value.typeTraite === 'fournisseur') {
      const societeId = authStore.user?.idSociete;
      return comptesBancaires.value.filter((c) => {
        if (!isSocieteType(c.titulaire_type)) return false;
        if (societeId && c.titulaire_id && c.titulaire_id !== societeId) return false;
        return true;
      });
    } else {
      const tierId = formData.value.tiersSelectionneId;
      if (!tierId) return [];
      const fromGlobal = comptesBancaires.value.filter(
        (c) => isTierType(c.titulaire_type) && c.titulaire_id === tierId
      );
      if (fromGlobal.length > 0) return fromGlobal;
      const tier = tiersSelectionne.value;
      return tier?.comptes_bancaires ?? [];
    }
  });

  const compteSelectionne = computed<CompteBancaire | null>(() => {
    if (!formData.value.compteBancaireId) return null;
    return (
      comptesDisponibles.value.find((c) => c.id === formData.value.compteBancaireId) ??
      comptesBancaires.value.find((c) => c.id === formData.value.compteBancaireId) ??
      null
    );
  });

  const canGenerate = computed(() => {
    const f = formData.value;
    return (
      f.tiersSelectionneId !== null &&
      f.compteBancaireId !== null &&
      f.montantTotal > 0 &&
      f.nombreTraites >= 1 &&
      f.lieu.trim() !== ''
    );
  });

  const montantParTraite = computed(() => {
    if (formData.value.nombreTraites < 1 || formData.value.montantTotal <= 0) return 0;
    return formData.value.montantTotal / formData.value.nombreTraites;
  });

  const currentTraite = computed<TraiteItem | null>(
    () => generatedTraites.value[currentPreviewIndex.value] ?? null
  );

  const totalTraites = computed(() => generatedTraites.value.length);

  async function loadSociete(): Promise<void> {
    if (!authStore.user?.idSociete) return;
    loadingSociete.value = true;
    try {
      const res = await apiGet<any>(`societes/${authStore.user.idSociete}`);
      societe.value = res?.data ?? res;
    } catch {
      societe.value = null;
    } finally {
      loadingSociete.value = false;
    }
  }

  async function loadTiers(): Promise<void> {
    loadingTiers.value = true;
    try {
      const params: Record<string, number> = {};
      if (authStore.user?.idSociete) params.idSociete = authStore.user.idSociete;
      const res = await apiGet<{ success: boolean; data: Tier[] }>('tiers', params);
      tiers.value = res.data;
    } catch {
      tiers.value = [];
    } finally {
      loadingTiers.value = false;
    }
  }

  async function loadComptesBancaires(): Promise<void> {
    loadingComptes.value = true;
    try {
      const params: Record<string, number> = {};
      if (authStore.user?.idSociete) params.idSociete = authStore.user.idSociete;
      const res = await apiGet<any>('comptes-bancaires', params);

      let allComptes: CompteBancaire[] = [];
      if (Array.isArray(res)) {
        allComptes = res;
      } else if (res?.data && Array.isArray(res.data)) {
        allComptes = res.data;
      }

      comptesBancaires.value = allComptes;
    } catch (e) {
      console.error('[Comptes] Erreur:', e);
      comptesBancaires.value = [];
    } finally {
      loadingComptes.value = false;
    }
  }

  async function loadStatuts(): Promise<void> {
    try {
      const res = await apiGet<{ success: boolean; data: Array<{ id: number; statut: string }> }>('statuts-traites');
      statuts.value = res.data ?? [];
    } catch {
      statuts.value = [];
    }
  }

  async function init(): Promise<void> {
    await Promise.all([loadSociete(), loadTiers(), loadComptesBancaires(), loadStatuts()]);
    applyAutoFill();
  }

  function applyAutoFill(): void {
    const f      = formData.value;
    const soc    = societe.value as any;
    const tier   = tiersSelectionne.value;
    const compte = compteSelectionne.value;

    const nomSociete     = soc?.raisonSociale ?? soc?.nom_societe ?? '';
    const adresseSociete = soc?.adresse ?? '';

    if (f.typeTraite === 'fournisseur') {
      f.tireurNom     = tier?.raison_sociale ?? '';
      f.tireurAdresse = tier?.adresse ?? '';
      f.tireNom       = nomSociete;
      f.tireAdresse   = adresseSociete;
    } else {
      f.tireurNom     = nomSociete;
      f.tireurAdresse = adresseSociete;
      f.tireNom       = tier?.raison_sociale ?? '';
      f.tireAdresse   = tier?.adresse ?? '';
    }

    f.banqueNom    = compte?.banque?.nomBanque ?? '';
    f.rib          = compte?.rib ?? '';
    f.beneficiaire = f.tireurNom;
  }

  watch(
    [
      () => formData.value.typeTraite,
      () => formData.value.tiersSelectionneId,
      () => formData.value.compteBancaireId,
      societe,
    ],
    () => { applyAutoFill(); }
  );

  watch(
    () => formData.value.typeTraite,
    () => {
      formData.value.tiersSelectionneId = null;
      formData.value.compteBancaireId   = null;
    }
  );

  watch(
    () => formData.value.tiersSelectionneId,
    () => { formData.value.compteBancaireId = null; }
  );

  function updateField<K extends keyof TraiteFormData>(field: K, value: TraiteFormData[K]): void {
    (formData.value as any)[field] = value;
  }

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
      tireNom: f.tireNom,
      banqueNom: f.banqueNom,
      rib: f.rib,
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

    generatedTraites.value = generatedTraites.value.map((t, i) => (i === index ? traite : t));
  }

  function goToTraite(index: number): void {
    if (index >= 0 && index < totalTraites.value) currentPreviewIndex.value = index;
  }

  function nextTraite(): void {
    if (currentPreviewIndex.value < totalTraites.value - 1) currentPreviewIndex.value++;
  }

  function prevTraite(): void {
    if (currentPreviewIndex.value > 0) currentPreviewIndex.value--;
  }

  function reset(): void {
    formData.value = emptyForm();
    generatedTraites.value = [];
    currentPreviewIndex.value = 0;
    saveError.value = null;
    saveSuccess.value = false;
    applyAutoFill();
  }

  async function saveToBackend(): Promise<void> {
    isSaving.value = true;
    saveError.value = null;
    saveSuccess.value = false;

    const missingEcheance = generatedTraites.value.findIndex((t) => !t.dateEcheance);
    if (missingEcheance !== -1) {
      saveError.value = `La date d'échéance est manquante pour la traite ${missingEcheance + 1}`;
      isSaving.value = false;
      return;
    }

    try {
      const tierId    = formData.value.tiersSelectionneId;
      const societeId = authStore.user?.idSociete;

      for (const traite of generatedTraites.value) {
        // ✅ Ne PAS envoyer statuts_traites_id ni statut — le backend l'ajoute automatiquement en "Non échue"
       // ✅ Ne jamais envoyer statuts_traites_id — backend fixe automatiquement "Non échue"
        await apiPost('traites', {
          montant:              traite.montant,
          type_traite:          traite.typeTraite,
          date_emission:        traite.dateEmission,
          date_echeance:        traite.dateEcheance,
          comptes_bancaires_id: formData.value.compteBancaireId,
          tireur_id:   formData.value.typeTraite === 'fournisseur'
            ? tierId
            : (societeId ?? authStore.user?.idUtilisateur),
          tireur_type: formData.value.typeTraite === 'fournisseur'
            ? 'App\\Models\\Tier'
            : 'App\\Models\\Societe',
        });
      }

      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 4000);
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Erreur inconnue lors de la sauvegarde';
    } finally {
      isSaving.value = false;
    }
  }

  return {
    societe, tiers, comptesBancaires, statuts,
    loadingSociete, loadingTiers, loadingComptes,
    tiersFiltered, tiersSelectionne, comptesDisponibles, compteSelectionne,
    formData, generatedTraites, currentPreviewIndex,
    isSaving, saveError, saveSuccess,
    currentTraite, totalTraites, canGenerate, montantParTraite,
    init, loadSociete, loadTiers, loadComptesBancaires, loadStatuts,
    updateField, generateTraites, updateTraiteField,
    goToTraite, nextTraite, prevTraite,
    reset, saveToBackend,
  };
});