<template>
  <div class="traite-form">
    <div class="form-header">
      <h2 class="form-title">Nouvelles Traites</h2>
      <p class="form-subtitle">
        Remplissez les informations ci-dessous pour générer vos effets de commerce
      </p>
    </div>

    <form class="form-body" @submit.prevent="handleGenerate">
      <!-- Section : Informations -->
      <div class="form-section">
        <h3 class="section-label">Informations générales</h3>

        <div class="field-group">
          <label for="fournisseur" class="field-label">Fournisseur (Tiré)</label>
          <input
            id="fournisseur"
            type="text"
            class="field-input"
            placeholder="Nom du fournisseur"
            :value="formState.fournisseur"
            @input="setField('fournisseur', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="field-group">
          <label for="client" class="field-label">Client (Tireur)</label>
          <input
            id="client"
            type="text"
            class="field-input"
            placeholder="Nom du client"
            :value="formState.client"
            @input="setField('client', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="field-row">
          <div class="field-group field-flex">
            <label for="banque" class="field-label">Banque</label>
            <input
              id="banque"
              type="text"
              class="field-input"
              placeholder="Nom de la banque"
              :value="formState.banque"
              @input="setField('banque', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field-group field-flex">
            <label for="rib" class="field-label">RIB</label>
            <input
              id="rib"
              type="text"
              class="field-input"
              placeholder="XX XXXX XXXX XXXX XXXX"
              maxlength="24"
              :value="formState.rib"
              @input="setField('rib', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <!-- Section : Montant & Traitess -->
      <div class="form-section">
        <h3 class="section-label">Montant & Répartition</h3>

        <div class="field-row">
          <div class="field-group field-flex">
            <label for="montantTotal" class="field-label">Montant total (DT)</label>
            <input
              id="montantTotal"
              type="number"
              class="field-input"
              placeholder="0.000"
              min="0"
              step="0.001"
              :value="formState.montantTotal || ''"
              @input="setField('montantTotal', Number(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div class="field-group field-flex">
            <label for="nombreTraitess" class="field-label">Nombre de traites</label>
            <input
              id="nombreTraitess"
              type="number"
              class="field-input"
              placeholder="1"
              min="1"
              max="36"
              :value="formState.nombreTraitess"
              @input="setField('nombreTraitess', Math.max(1, Number(($event.target as HTMLInputElement).value)))"
            />
          </div>
        </div>

        <!-- Indicateur montant par traite -->
        <div v-if="formState.nombreTraitess > 1 && formState.montantTotal > 0" class="amount-indicator">
          <svg class="amount-indicator-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>
            <strong>{{ unitAmount.toFixed(3) }} DT</strong> par traite
          </span>
        </div>
      </div>

      <!-- Section : Détails -->
      <div class="form-section">
        <h3 class="section-label">Détails de la traite</h3>

        <div class="field-row">
          <div class="field-group field-flex">
            <label for="dateEcheance" class="field-label">Date d'échéance</label>
            <input
              id="dateEcheance"
              type="date"
              class="field-input"
              :value="formState.dateEcheance"
              @input="setField('dateEcheance', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field-group field-flex">
            <label for="lieu" class="field-label">Lieu</label>
            <input
              id="lieu"
              type="text"
              class="field-input"
              placeholder="Ville"
              :value="formState.lieu"
              @input="setField('lieu', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <div class="field-group">
          <label for="beneficiaire" class="field-label">Nom du bénéficiaire</label>
          <input
            id="beneficiaire"
            type="text"
            class="field-input"
            placeholder="Nom complet du bénéficiaire"
            :value="formState.beneficiaire"
            @input="setField('beneficiaire', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :class="{ 'btn-disabled': !isValid }"
          :disabled="!isValid"
        >
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          Générer {{ formState.nombreTraitess > 1 ? `${formState.nombreTraitess} traites` : 'la traite' }}
        </button>

        <button
          v-if="count > 0"
          type="button"
          class="btn btn-outline"
          @click="handleSave"
          :disabled="saving"
        >
          <svg v-if="saving" class="btn-icon spin" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
          </svg>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>

        <button
          v-if="count > 0"
          type="button"
          class="btn btn-ghost"
          @click="clearAll"
        >
          Réinitialiser
        </button>
      </div>

      <!-- Messages -->
      <Transition name="fade">
        <div v-if="error" class="message message-error">
          {{ error }}
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="success" class="message message-success">
          Trait(es) enregistrée(s) avec succès !
        </div>
      </Transition>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useTraite } from '@/composables/useTraite';

const {
  formState,
  count,
  isValid,
  unitAmount,
  saving,
  error,
  success,
  setField,
  generate,
  clearAll,
  save
} = useTraite();

function handleGenerate(): void {
  generate();
}

async function handleSave(): Promise<void> {
  await save();
}
</script>