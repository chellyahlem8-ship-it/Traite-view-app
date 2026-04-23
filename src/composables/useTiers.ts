import { ref, reactive, onMounted } from 'vue';
import { tiersApi, typesTiersApi } from '@/api/tiers.api';
import type { TypeTier } from '@/api/tiers.api';

interface FormErrors {
  raison_sociale?: string;
  email?: string;
  adresse?: string;
  num_tel?: string;
  types_tiers_id?: string;
}

export function useTiers(initialSocieteId: number) {
  const loading = ref(false);
  const success = ref(false);
  const generalError = ref<string | null>(null);
  const errors = reactive<FormErrors>({});

  // ✅ AJOUT : liste des types chargée dynamiquement depuis GET /api/types-tiers
  const typesTiers = ref<TypeTier[]>([]);
  const loadingTypes = ref(false);

  const formState = reactive({
    raison_sociale: '',
    email: '',
    adresse: '',
    num_tel: '',
    types_tiers_id: '',
    idSociete: initialSocieteId
  });

  // ✅ AJOUT : charge les types au montage du composable
  onMounted(async () => {
    loadingTypes.value = true;
    try {
      const res = await typesTiersApi.getAll();
      typesTiers.value = res.data;
    } catch {
      generalError.value = 'Impossible de charger les types de tiers.';
    } finally {
      loadingTypes.value = false;
    }
  });

  const clearErrors = () => {
    (Object.keys(errors) as Array<keyof FormErrors>).forEach((key) => {
      delete errors[key];
    });
    generalError.value = null;
  };

  const validate = (): boolean => {
    clearErrors();
    let isValid = true;

    if (!formState.raison_sociale.trim()) {
      errors.raison_sociale = 'La raison sociale est requise.';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email || !emailRegex.test(formState.email)) {
      errors.email = "L'adresse email est invalide.";
      isValid = false;
    }

    if (!formState.adresse.trim()) {
      errors.adresse = "L'adresse est requise.";
      isValid = false;
    }

    const telStr = String(formState.num_tel).trim();
    if (!telStr || !/^\d+$/.test(telStr) || telStr.length < 8 || telStr.length > 15) {
      errors.num_tel = 'Le numéro doit contenir entre 8 et 15 chiffres.';
      isValid = false;
    }

    if (!formState.types_tiers_id) {
      errors.types_tiers_id = 'Veuillez sélectionner un type.';
      isValid = false;
    }

    return isValid;
  };

  const createTier = async () => {
    if (!validate()) return;

    loading.value = true;
    success.value = false;
    generalError.value = null;

    try {
      const payload = {
        raison_sociale: formState.raison_sociale,
        email: formState.email,
        adresse: formState.adresse,
        num_tel: parseInt(formState.num_tel, 10),
        types_tiers_id: parseInt(formState.types_tiers_id, 10), // ✅ envoie l'ID réel de la BDD
        idSociete: formState.idSociete
      };

      await tiersApi.create(payload);
      success.value = true;

    } catch (err: unknown) {
      success.value = false;
      // ✅ CORRECTION : typage propre sans "any"
      const e = err as { message?: string; errors?: Record<string, string[]> };

      if (e?.message) {
        generalError.value = e.message;
        if (e.errors) {
          if (e.errors.email)           errors.email           = e.errors.email[0];
          if (e.errors.num_tel)         errors.num_tel         = e.errors.num_tel[0];
          if (e.errors.types_tiers_id)  errors.types_tiers_id  = e.errors.types_tiers_id[0];
          if (e.errors.raison_sociale)  errors.raison_sociale  = e.errors.raison_sociale[0];
          if (e.errors.adresse)         errors.adresse         = e.errors.adresse[0];
        }
      } else {
        generalError.value = 'Erreur technique inconnue.';
      }
    } finally {
      loading.value = false;
    }
  };

  const resetForm = () => {
    formState.raison_sociale = '';
    formState.email = '';
    formState.adresse = '';
    formState.num_tel = '';
    formState.types_tiers_id = '';
    clearErrors();
    success.value = false;
  };

  return {
    formState,
    errors,
    loading,
    success,
    generalError,
    typesTiers,      // ✅ exposé pour le template
    loadingTypes,    // ✅ exposé pour afficher "Chargement..." dans le select
    createTier,
    resetForm
  };
}