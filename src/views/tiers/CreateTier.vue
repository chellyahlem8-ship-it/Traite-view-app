<template>
  <!-- ✅ Layout avec Sidebar -->
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">
      <div class="tier-form-card">

        <div class="form-header">
          <h2 class="form-title">Nouveau Tiers</h2>
          <p class="form-subtitle">Enregistrez un client ou un fournisseur.</p>
        </div>

        <form class="form-body" @submit.prevent="createTier">

          <!-- Identité -->
          <div class="form-section">
            <h3 class="section-label">Identité</h3>

            <div class="field-group">
              <label class="field-label">
                Raison Sociale <span class="required-star">*</span>
              </label>
              <input
                v-model="formState.raison_sociale"
                type="text"
                class="field-input"
                :class="{ 'field-input-error': errors.raison_sociale }"
                placeholder="Ex : Société XYZ"
              />
              <span v-if="errors.raison_sociale" class="field-error-text">
                {{ errors.raison_sociale }}
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">
                Type de Tiers <span class="required-star">*</span>
              </label>
              <select
                v-model="formState.types_tiers_id"
                class="field-input"
                :class="{ 'field-input-error': errors.types_tiers_id }"
              >
                <option value="" disabled>-- Sélectionner --</option>
                <option value="1">Client</option>
                <option value="2">Fournisseur</option>
              </select>
              <span v-if="errors.types_tiers_id" class="field-error-text">
                {{ errors.types_tiers_id }}
              </span>
            </div>
          </div>

          <!-- Coordonnées -->
          <div class="form-section">
            <h3 class="section-label">Coordonnées</h3>

            <div class="field-group">
              <label class="field-label">
                Email <span class="required-star">*</span>
              </label>
              <input
                v-model="formState.email"
                type="email"
                class="field-input"
                :class="{ 'field-input-error': errors.email }"
                placeholder="contact@exemple.com"
              />
              <span v-if="errors.email" class="field-error-text">
                {{ errors.email }}
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">
                Adresse <span class="required-star">*</span>
              </label>
              <input
                v-model="formState.adresse"
                type="text"
                class="field-input"
                :class="{ 'field-input-error': errors.adresse }"
                placeholder="Adresse complète"
              />
              <span v-if="errors.adresse" class="field-error-text">
                {{ errors.adresse }}
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">
                Téléphone <span class="required-star">*</span>
              </label>
              <input
                v-model="formState.num_tel"
                type="number"
                class="field-input"
                :class="{ 'field-input-error': errors.num_tel }"
                placeholder="8 chiffres minimum"
              />
              <span v-if="errors.num_tel" class="field-error-text">
                {{ errors.num_tel }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
            >
              <!-- Spinner -->
              <svg
                v-if="loading"
                class="btn-icon spin"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566
                   1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1
                   1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002
                   5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0
                   11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0
                   01.61-1.276z"
                  clip-rule="evenodd"
                />
              </svg>
              <!-- Icône plus -->
              <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              {{ loading ? 'Enregistrement...' : 'Créer le Tiers' }}
            </button>

            <button
              type="button"
              class="btn btn-outline"
              :disabled="loading"
              @click="resetForm"
            >
              Annuler
            </button>
          </div>

          <!-- Messages -->
          <Transition name="fade">
            <div v-if="generalError" class="message message-error">
              ⚠ {{ generalError }}
            </div>
          </Transition>

          <Transition name="fade">
            <div v-if="success" class="message message-success">
              ✓ Tiers créé avec succès.
            </div>
          </Transition>
        </form>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { useTiers } from '@/composables/useTiers'

// ✅ TODO : remplacer par la valeur dynamique du store (ex: authStore.user.societeId)
const currentSocieteId = 1

const {
  formState,
  errors,
  loading,
  success,
  generalError,
  createTier,
  resetForm,
} = useTiers(currentSocieteId)
</script>

<style lang="scss">
// ✅ Styles externes — PAS scoped pour que .page-layout fonctionne avec le Sidebar fixe
@import '@/assets/styles/create-tier.scss';
</style>