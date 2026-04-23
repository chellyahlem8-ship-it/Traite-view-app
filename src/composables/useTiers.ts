import { ref, reactive } from 'vue';
import { tiersApi } from '@/api/tiers.api';
import type { ApiError } from '@/types/tiers';

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

  const formState = reactive({
    raison_sociale: '',
    email: '',
    adresse: '',
    num_tel: '',
    types_tiers_id: '',
    idSociete: initialSocieteId
  });

  const clearErrors = () => {
    // CORRECTION ICI : On force le type des clés pour éviter l'erreur "No index signature"
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
      errors.adresse = 'L\'adresse est requise.';
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
        types_tiers_id: parseInt(formState.types_tiers_id, 10),
        idSociete: formState.idSociete
      };

      await tiersApi.create(payload);
      success.value = true;
      
    } catch (err: any) {
      success.value = false;
      const apiError = err as ApiError;
      
      if (apiError?.message) {
        generalError.value = apiError.message;
        
        if (apiError.errors) {
          // Note: Assurez-vous que votre type ApiError contient bien ces champs
          if (apiError.errors.email) errors.email = apiError.errors.email[0];
          if (apiError.errors.num_tel) errors.num_tel = apiError.errors.num_tel[0];
          if (apiError.errors.types_tiers_id) errors.types_tiers_id = apiError.errors.types_tiers_id[0];
        }
      } else {
        generalError.value = "Erreur technique inconnue.";
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
    createTier,
    resetForm
  };
}