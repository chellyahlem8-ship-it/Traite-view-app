<template>
  <!-- ═══════════════════════════════════════════════════════════
       FormCreerTier.vue
       Formulaire de création d'un Tiers.
       - Charge les types de tiers depuis l'API au montage.
       - Envoie les données en POST /api/tiers.
       - Émet l'événement "created" avec le nouveau tiers
         pour que le composant parent puisse mettre à jour sa liste.
       ═══════════════════════════════════════════════════════════ -->
  <div class="form-card">
    <h2 class="form-title">➕ Créer un Tiers</h2>

    <!-- Message d'erreur -->
    <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
    <!-- Message de succès -->
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <form @submit.prevent="handleSubmit">

      <!-- Raison sociale -->
      <div class="field">
        <label>Raison sociale *</label>
        <input v-model="form.raison_sociale" type="text" placeholder="Ex : Société Alpha SARL" required />
      </div>

      <!-- Email -->
      <div class="field">
        <label>Email *</label>
        <input v-model="form.email" type="email" placeholder="contact@societe.tn" required />
      </div>

      <!-- Adresse -->
      <div class="field">
        <label>Adresse *</label>
        <input v-model="form.adresse" type="text" placeholder="Rue, Ville, Code postal" required />
      </div>

      <!-- Téléphone -->
      <div class="field">
        <label>Téléphone *</label>
        <input v-model.number="form.num_tel" type="number" placeholder="12345678" required />
      </div>

      <!-- ── SELECT TYPE DE TIERS ────────────────────────────────
           Ce <select> est rempli dynamiquement depuis GET /api/types-tiers.
           Lorsqu'on sélectionne "client", la valeur est l'ID du type.
           ──────────────────────────────────────────────────────── -->
      <div class="field">
        <label>Type de tiers *</label>
        <select v-model.number="form.types_tiers_id" required :disabled="loadingTypes">
          <option value="" disabled>
            {{ loadingTypes ? 'Chargement...' : '-- Sélectionner un type --' }}
          </option>
          <option v-for="t in typesTiers" :key="t.id" :value="t.id">
            {{ t.type }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn-submit" :disabled="loading">
        <span v-if="loading">⏳ Enregistrement...</span>
        <span v-else>✅ Créer le tiers</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tiersApi, typesTiersApi } from '@/api/tiers.api'
import type { TypeTier, TierPayload } from '@/api/tiers.api'
import { useAuthStore } from '@/stores/auth.store'

// ── Événement émis vers le parent après création réussie ──────
const emit = defineEmits<{ (e: 'created', tier: unknown): void }>()

const authStore = useAuthStore()

// ── État du formulaire ────────────────────────────────────────
const form = ref<TierPayload>({
  raison_sociale: '',
  email: '',
  adresse: '',
  num_tel: 0,
  types_tiers_id: 0,
  idSociete: authStore.user?.idSociete ?? 0,  // récupéré depuis le store JWT
})

// ── État UI ───────────────────────────────────────────────────
const typesTiers   = ref<TypeTier[]>([])
const loadingTypes = ref(false)
const loading      = ref(false)
const errorMsg     = ref<string | null>(null)
const successMsg   = ref<string | null>(null)

// ── Charger les types de tiers au montage ────────────────────
// GET /api/types-tiers → remplit le <select>
onMounted(async () => {
  loadingTypes.value = true
  try {
    const res = await typesTiersApi.getAll()
    typesTiers.value = res.data
  } catch (e) {
    errorMsg.value = 'Impossible de charger les types de tiers.'
  } finally {
    loadingTypes.value = false
  }
})

// ── Soumission du formulaire ──────────────────────────────────
// POST /api/tiers → enregistre en BDD, reçoit l'objet créé
async function handleSubmit() {
  errorMsg.value  = null
  successMsg.value = null
  loading.value   = true

  try {
    const res = await tiersApi.create(form.value)
    successMsg.value = res.message || 'Tiers créé avec succès !'
    emit('created', res.data)   // notifier le parent

    // Réinitialiser le formulaire
    form.value = {
      raison_sociale: '',
      email: '',
      adresse: '',
      num_tel: 0,
      types_tiers_id: 0,
      idSociete: authStore.user?.idSociete ?? 0,
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Erreur lors de la création.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(109,40,217,0.10);
  border: 1px solid #ede9fe;
}

.form-title {
  font-size: 18px;
  font-weight: 700;
  color: #4c1d95;
  margin-bottom: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: #6d28d9;
}

input, select {
  padding: 10px 14px;
  border: 1.5px solid #ddd6fe;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  border-color: #7c3aed;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.alert {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.alert-error   { background: #fee2e2; color: #991b1b; }
.alert-success { background: #d1fae5; color: #065f46; }
</style>