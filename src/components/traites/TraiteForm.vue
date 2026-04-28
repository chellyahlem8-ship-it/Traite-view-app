<template>
  <div class="traite-form">
    <div class="form-header">
      <h2 class="form-title">Nouvelle(s) Traite(s)</h2>
      <p class="form-subtitle">Remplissez les informations pour générer vos effets de commerce</p>
    </div>

    <form class="form-body" @submit.prevent="handleGenerate">

      <!-- ── TYPE DE TRAITE ── -->
      <div class="form-section">
        <h3 class="section-label">Type de traite</h3>
        <div class="type-selector">
          <button type="button" class="type-btn"
            :class="{ 'type-btn-active': formState.typeTraite === 'fournisseur' }"
            @click="setField('typeTraite', 'fournisseur')">
            <svg viewBox="0 0 20 20" fill="currentColor" class="type-icon">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
            <div>
              <div class="type-label">Fournisseur</div>
              <div class="type-desc">Je suis le tiré</div>
            </div>
          </button>

          <button type="button" class="type-btn"
            :class="{ 'type-btn-active': formState.typeTraite === 'client' }"
            @click="setField('typeTraite', 'client')">
            <svg viewBox="0 0 20 20" fill="currentColor" class="type-icon">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <div>
              <div class="type-label">Client</div>
              <div class="type-desc">Je suis le tireur</div>
            </div>
          </button>
        </div>
      </div>

      <!-- ── TIERS & COMPTE BANCAIRE ── -->
      <div class="form-section">
        <h3 class="section-label">Tiers &amp; Compte bancaire</h3>

        <!-- ══ TIREUR ══ -->
        <div class="partie-bloc">
          <div class="partie-titre">
            <span class="partie-badge partie-badge--tireur">Tireur</span>
            <span class="partie-role">
              <!--
                FOURNISSEUR → Tireur = le FOURNISSEUR sélectionné
                CLIENT      → Tireur = MA SOCIÉTÉ (auto)
              -->
              {{ formState.typeTraite === 'fournisseur' ? '— le fournisseur (sélectionner)' : '— votre société (auto)' }}
            </span>
          </div>

          <!--
            FOURNISSEUR → Tireur = un FOURNISSEUR parmi les tiers de type fournisseur
          -->
          <template v-if="formState.typeTraite === 'fournisseur'">
            <div class="field-group">
              <label class="field-label">Fournisseur (Tireur) <span class="required-star">*</span></label>
              <div class="select-wrapper" :class="{ 'select-loading': loadingTiers }">
                <select class="field-select"
                  :value="formState.tiersSelectionneId ?? ''"
                  @change="setField('tiersSelectionneId', Number(($event.target as HTMLSelectElement).value) || null)"
                  :disabled="loadingTiers">
                  <option value="">{{ loadingTiers ? 'Chargement...' : '— Sélectionner un fournisseur —' }}</option>
                  <option v-for="tier in tiersFiltered" :key="tier.id" :value="tier.id">
                    {{ tier.raison_sociale }}
                  </option>
                </select>
                <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p v-if="tiersFiltered.length === 0 && !loadingTiers" class="field-hint field-hint--warn">
                Aucun fournisseur trouvé dans vos tiers.
              </p>
            </div>
            <div v-if="tiersSelectionne" class="tiers-chip">
              <svg viewBox="0 0 20 20" fill="currentColor" class="chip-icon chip-icon--blue">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <span class="chip-nom">{{ tiersSelectionne.raison_sociale }}</span>
            </div>
          </template>

          <!--
            CLIENT → Tireur = MA SOCIÉTÉ (auto, juste le nom)
          -->
          <template v-else>
            <div v-if="loadingSociete" class="skeleton-wrap"><span class="skeleton-bar"></span></div>
            <div v-else-if="societe" class="societe-chip">
              <svg viewBox="0 0 20 20" fill="currentColor" class="chip-icon chip-icon--green">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
              </svg>
              <span class="chip-nom">{{ nomSociete }}</span>
            </div>
            <div v-else class="fill-empty">Impossible de charger la société.</div>
          </template>
        </div>

        <!-- ══ TIRÉ ══ -->
        <div class="partie-bloc mt-12">
          <div class="partie-titre">
            <span class="partie-badge partie-badge--tire">Tiré</span>
            <span class="partie-role">
              <!--
                FOURNISSEUR → Tiré = MA SOCIÉTÉ (auto)
                CLIENT      → Tiré = le CLIENT sélectionné
              -->
              {{ formState.typeTraite === 'fournisseur' ? '— votre société (auto)' : '— le client (sélectionner)' }}
            </span>
          </div>

          <!--
            FOURNISSEUR → Tiré = MA SOCIÉTÉ (auto, juste le nom)
          -->
          <template v-if="formState.typeTraite === 'fournisseur'">
            <div v-if="loadingSociete" class="skeleton-wrap"><span class="skeleton-bar"></span></div>
            <div v-else-if="societe" class="societe-chip">
              <svg viewBox="0 0 20 20" fill="currentColor" class="chip-icon chip-icon--green">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
              </svg>
              <span class="chip-nom">{{ nomSociete }}</span>
            </div>
            <div v-else class="fill-empty">Impossible de charger la société.</div>
          </template>

          <!--
            CLIENT → Tiré = un CLIENT parmi les tiers de type client
          -->
          <template v-else>
            <div class="field-group">
              <label class="field-label">Client (Tiré) <span class="required-star">*</span></label>
              <div class="select-wrapper" :class="{ 'select-loading': loadingTiers }">
                <select class="field-select"
                  :value="formState.tiersSelectionneId ?? ''"
                  @change="setField('tiersSelectionneId', Number(($event.target as HTMLSelectElement).value) || null)"
                  :disabled="loadingTiers">
                  <option value="">{{ loadingTiers ? 'Chargement...' : '— Sélectionner un client —' }}</option>
                  <option v-for="tier in tiersFiltered" :key="tier.id" :value="tier.id">
                    {{ tier.raison_sociale }}
                  </option>
                </select>
                <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p v-if="tiersFiltered.length === 0 && !loadingTiers" class="field-hint field-hint--warn">
                Aucun client trouvé dans vos tiers.
              </p>
            </div>
            <div v-if="tiersSelectionne" class="tiers-chip mt-8">
              <svg viewBox="0 0 20 20" fill="currentColor" class="chip-icon chip-icon--blue">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <span class="chip-nom">{{ tiersSelectionne.raison_sociale }}</span>
            </div>
          </template>
        </div>

        <!-- ══ COMPTE BANCAIRE ══ -->
        <div class="partie-bloc mt-12">
          <div class="partie-titre">
            <span class="partie-badge partie-badge--compte">Compte bancaire</span>
            <span class="partie-role">
              <!--
                FOURNISSEUR → compte de MA SOCIÉTÉ (tiré)
                CLIENT      → compte du CLIENT sélectionné (tiré)
              -->
              {{
                formState.typeTraite === 'fournisseur'
                  ? '— votre RIB (société, tiré)'
                  : '— RIB du client sélectionné (tiré)'
              }}
            </span>
          </div>

          <div class="field-group">
            <label class="field-label">RIB / Compte <span class="required-star">*</span></label>

            <!--
              CLIENT sans tiers sélectionné → on attend d'abord le choix du client
            -->
            <p v-if="formState.typeTraite === 'client' && !formState.tiersSelectionneId" class="field-hint">
              Sélectionnez d'abord un client pour voir ses comptes.
            </p>

            <template v-else>
              <div v-if="loadingComptes" class="skeleton-wrap"><span class="skeleton-bar"></span></div>

              <p v-else-if="comptesDisponibles.length === 0" class="field-hint field-hint--warn">
                {{
                  formState.typeTraite === 'fournisseur'
                    ? 'Aucun compte bancaire enregistré pour votre société.'
                    : 'Ce client n\'a aucun compte bancaire enregistré.'
                }}
              </p>

              <div v-else class="select-wrapper">
                <select class="field-select field-select-mono"
                  :value="formState.compteBancaireId ?? ''"
                  @change="setField('compteBancaireId', Number(($event.target as HTMLSelectElement).value) || null)">
                  <option value="">— Sélectionner un compte —</option>
                  <option v-for="compte in comptesDisponibles" :key="compte.id" :value="compte.id">
                    {{ compte.banque?.nomBanque ?? 'Banque' }} — {{ compte.rib }}
                  </option>
                </select>
                <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </template>
          </div>

          <!-- Aperçu du compte sélectionné -->
          <div v-if="compteSelectionne" class="compte-preview">
            <div class="compte-preview-item">
              <span class="compte-preview-label">Banque</span>
              <span class="compte-preview-value">{{ compteSelectionne.banque?.nomBanque ?? '—' }}</span>
            </div>
            <div class="compte-preview-sep">|</div>
            <div class="compte-preview-item">
              <span class="compte-preview-label">RIB</span>
              <span class="compte-preview-value rib">{{ compteSelectionne.rib }}</span>
            </div>
          </div>
        </div>

        <!-- ══ BÉNÉFICIAIRE ══ -->
        <div class="field-group mt-12">
          <label class="field-label">Bénéficiaire <span class="required-star">*</span></label>
          <input type="text" class="field-input" placeholder="Nom du bénéficiaire"
            :value="formState.beneficiaire"
            @input="setField('beneficiaire', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>

      <!-- ── MONTANT & RÉPARTITION ── -->
      <div class="form-section">
        <h3 class="section-label">Montant &amp; Répartition</h3>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Montant total (DT)</label>
            <input type="number" class="field-input" placeholder="0.000" min="0" step="0.001"
              :value="formState.montantTotal || ''"
              @input="setField('montantTotal', Number(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="field-group">
            <label class="field-label">Nombre de traites</label>
            <input type="number" class="field-input" placeholder="1" min="1" max="36"
              :value="formState.nombreTraites"
              @input="setField('nombreTraites', Math.max(1, Number(($event.target as HTMLInputElement).value)))" />
          </div>
        </div>
        <div v-if="formState.nombreTraites > 1 && formState.montantTotal > 0" class="amount-indicator">
          <svg viewBox="0 0 20 20" fill="currentColor" class="amount-indicator-icon">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>
            <strong>{{ unitAmount.toFixed(3) }} DT</strong> par traite
            ({{ formState.nombreTraites }} × {{ unitAmount.toFixed(3) }} = {{ formState.montantTotal.toFixed(3) }} DT)
          </span>
        </div>
      </div>

      <!-- ── DÉTAILS ── -->
      <div class="form-section">
        <h3 class="section-label">Détails</h3>
        <div class="field-group">
          <label class="field-label">Lieu d'émission</label>
          <input type="text" class="field-input" placeholder="Ville"
            :value="formState.lieu"
            @input="setField('lieu', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>

      <!-- ── BOUTON GÉNÉRER ── -->
      <div class="form-actions" v-if="count === 0">
        <button type="submit" class="btn btn-primary"
          :class="{ 'btn-disabled': !isValid }" :disabled="!isValid">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          Générer {{ formState.nombreTraites > 1 ? `${formState.nombreTraites} traites` : 'la traite' }}
        </button>
      </div>

      <!-- ── TRAITES INDIVIDUELLES ── -->
      <div v-if="traites.length > 0" class="form-section traites-section">
        <h3 class="section-label">
          Détails par traite
          <span class="section-count-badge">{{ traites.length }}</span>
        </h3>
        <div class="traites-list">
          <div v-for="(traite, i) in traites" :key="traite.id"
            class="traite-row" :class="{ 'traite-row-active': currentIndex === i }"
            @click="navigateTo(i)">
            <div class="traite-row-header">
              <span class="traite-num-badge">{{ i + 1 }}</span>
              <span class="traite-row-num">{{ traite.numero }}</span>
              <span v-if="!traite.dateEcheance" class="traite-row-warning">
                <svg viewBox="0 0 20 20" fill="currentColor" class="status-icon">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Échéance manquante
              </span>
              <span v-else class="traite-row-ok">
                <svg viewBox="0 0 20 20" fill="currentColor" class="status-icon">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Complète
              </span>
            </div>
            <div class="traite-row-fields">
              <div class="field-group">
                <label class="field-label field-label-sm">Date d'émission <span class="field-auto-badge">auto</span></label>
                <input type="date" class="field-input field-input-sm field-input-readonly"
                  :value="traite.dateEmission" readonly tabindex="-1" />
              </div>
              <div class="field-group">
                <label class="field-label field-label-sm">Date d'échéance <span class="required-star">*</span></label>
                <input type="date" class="field-input field-input-sm"
                  :class="{ 'field-input-required': !traite.dateEcheance }"
                  :value="traite.dateEcheance" :min="traite.dateEmission"
                  @input="updateTraiteField(i, 'dateEcheance', ($event.target as HTMLInputElement).value)"
                  @click.stop />
              </div>
              <div class="field-group">
                <label class="field-label field-label-sm">Montant (DT)</label>
                <input type="number" class="field-input field-input-sm" min="0" step="0.001"
                  :value="traite.montant"
                  @input="updateTraiteField(i, 'montant', ($event.target as HTMLInputElement).value)"
                  @click.stop />
              </div>
            </div>
          </div>
        </div>
        <div class="traites-total-bar">
          <span class="total-label">Total</span>
          <span class="total-value"
            :class="{ 'total-value-warn': Math.abs(traites.reduce((s, t) => s + t.montant, 0) - formState.montantTotal) > 0.001 }">
            {{ traites.reduce((sum, t) => sum + t.montant, 0).toFixed(3) }} DT
            <span v-if="Math.abs(traites.reduce((s, t) => s + t.montant, 0) - formState.montantTotal) > 0.001" class="total-diff">
              (attendu : {{ formState.montantTotal.toFixed(3) }} DT)
            </span>
          </span>
        </div>
      </div>

      <!-- ── ACTIONS APRÈS GÉNÉRATION ── -->
      <div class="form-actions" v-if="count > 0">
        <button type="submit" class="btn btn-primary"
          :class="{ 'btn-disabled': !isValid }" :disabled="!isValid">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          Regénérer ({{ formState.nombreTraites }})
        </button>
        <button type="button" class="btn btn-outline"
          @click="handleSave" :disabled="saving || !allEcheancesRemplies"
          :title="!allEcheancesRemplies ? 'Toutes les dates d\'échéance sont requises' : ''">
          <svg v-if="saving" class="btn-icon spin" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
          </svg>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="clearAll">Réinitialiser</button>
      </div>

      <Transition name="fade">
        <div v-if="error" class="message message-error">⚠ {{ error }}</div>
      </Transition>
      <Transition name="fade">
        <div v-if="success" class="message message-success">✓ Traite(s) enregistrée(s) avec succès !</div>
      </Transition>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTraite } from '@/composables/useTraite';

const {
  societe, loadingSociete, loadingTiers, loadingComptes,
  tiersFiltered, tiersSelectionne, comptesDisponibles, compteSelectionne,
  formState, traites, currentIndex, count, isValid, unitAmount,
  saving, error, success,
  init, setField, generate, updateTraiteField, navigateTo, clearAll, save,
} = useTraite();

onMounted(() => init());

const nomSociete = computed(() => {
  const s = societe.value as any;
  return s?.raisonSociale ?? s?.nom_societe ?? '—';
});

const allEcheancesRemplies = computed(() =>
  traites.value.length > 0 && traites.value.every((t) => !!t.dateEcheance)
);

function handleGenerate(): void {
  generate();
  setTimeout(() => {
    const el = document.querySelector('.traites-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

async function handleSave(): Promise<void> {
  await save();
}
</script>

<style scoped lang="scss">
.mt-8  { margin-top: 8px; }
.mt-12 { margin-top: 12px; }

// ── Type selector ────────────────────────────
.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e9e5f5;
  background: #f5f3ff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: inherit;
  &:hover       { border-color: #7c3aed; background: #ede9fe; }
  &-active      { border-color: #7c3aed; background: #ede9fe; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
}
.type-icon  { width: 22px; height: 22px; flex-shrink: 0; color: #7c3aed; }
.type-label { font-size: 0.85rem; font-weight: 700; color: #1e1b4b; line-height: 1.2; }
.type-desc  { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }

// ── Blocs parties ────────────────────────────
.partie-bloc {
  background: #faf9ff;
  border: 1.5px solid #e9e5f5;
  border-radius: 10px;
  padding: 12px 14px;
}

.partie-titre {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.partie-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  &--tireur { background: #dbeafe; color: #1d4ed8; }
  &--tire   { background: #fce7f3; color: #be185d; }
  &--compte { background: #d1fae5; color: #065f46; }
}

.partie-role {
  font-size: 0.72rem;
  color: #6b7280;
  font-style: italic;
}

// ── Chips ────────────────────────────────────
.societe-chip,
.tiers-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 8px;
}

.societe-chip {
  background: #f0fdf4;
  border: 1.5px solid rgba(5,150,105,.2);
}

.tiers-chip {
  background: #eff6ff;
  border: 1.5px solid rgba(59,130,246,.2);
}

.chip-icon {
  width: 16px; height: 16px; flex-shrink: 0;
  &--green { color: #059669; }
  &--blue  { color: #2563eb; }
}

.chip-nom {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e1b4b;
}

// ── Select ───────────────────────────────────
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  &.select-loading .field-select { opacity: 0.6; }
}

.field-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  padding: 9px 36px 9px 12px;
  border: 1.5px solid #d1c7f0;
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 0.85rem;
  color: #1e1b4b;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus   { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
  &:disabled { background: #f5f3ff; color: #9ca3af; cursor: not-allowed; }
  &-mono { font-family: 'Courier New', monospace; font-size: 0.82rem; }
}

.select-chevron {
  position: absolute;
  right: 10px;
  width: 16px; height: 16px;
  color: #7c3aed;
  pointer-events: none;
}

// ── Compte preview ───────────────────────────
.compte-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #ede9fe;
  border-radius: 8px;
  border: 1px solid rgba(124,58,237,.2);
  flex-wrap: wrap;
}

.compte-preview-sep { color: #c4b5fd; font-weight: 300; }

.compte-preview-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.compte-preview-label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #7c3aed;
}

.compte-preview-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e1b4b;
  &.rib { font-family: 'Courier New', monospace; font-size: 0.78rem; letter-spacing: 0.5px; }
}

// ── Skeleton ─────────────────────────────────
.skeleton-wrap { padding: 10px 0; }
.skeleton-bar {
  display: block;
  height: 14px;
  width: 55%;
  background: linear-gradient(90deg, #e9e5f5 25%, #d1c7f0 50%, #e9e5f5 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.fill-empty { font-size: 0.78rem; color: #dc2626; font-style: italic; }

// ── Hints ────────────────────────────────────
.field-hint {
  margin-top: 4px;
  font-size: 0.72rem;
  color: #6b7280;
  &--warn { color: #d97706; }
}

.required-star { color: #dc2626; margin-left: 2px; }

// ── Section count badge ───────────────────────
.section-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  background: #7c3aed;
  color: #fff;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  margin-left: 6px;
  vertical-align: middle;
}

// ── Traites liste ────────────────────────────
.traites-section { margin-top: 4px; }
.traites-list { display: flex; flex-direction: column; gap: 10px; }

.traite-row {
  border: 1.5px solid #e9e5f5;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #f5f3ff;
  &:hover    { border-color: #7c3aed; background: #ede9fe; }
  &-active   { border-color: #7c3aed; background: #ede9fe; box-shadow: 0 0 0 2px rgba(124,58,237,.15); }
}

.traite-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.traite-num-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  background: #7c3aed;
  color: #fff;
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}

.traite-row-num {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6d28d9;
  font-family: 'Courier New', monospace;
  flex: 1;
}

.traite-row-warning {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #dc2626;
  background: #fef2f2;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid rgba(220,38,38,.2);
}

.traite-row-ok {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid rgba(5,150,105,.2);
}

.status-icon { width: 11px; height: 11px; flex-shrink: 0; }

.traite-row-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.field-label-sm {
  font-size: 0.72rem !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-auto-badge {
  display: inline-block;
  padding: 1px 5px;
  background: #c4b5fd;
  color: #4c1d95;
  border-radius: 4px;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
}

.field-input-sm        { padding: 7px 10px !important; font-size: 0.78rem !important; }
.field-input-readonly  { background: #f0edf9 !important; cursor: default; color: #6b7280 !important; }
.field-input-required  { border-color: #dc2626 !important; background: #fef2f2 !important; }

// ── Total ─────────────────────────────────────
.traites-total-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 14px;
  background: #ede9fe;
  border-radius: 8px;
  border: 1px solid rgba(124,58,237,.2);
}

.total-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6d28d9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.total-value {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1e1b4b;
  font-family: 'Courier New', monospace;
  &.total-value-warn { color: #dc2626; }
}

.total-diff { font-size: 0.72rem; color: #dc2626; margin-left: 6px; }

// ── Amount indicator ──────────────────────────
.amount-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #eff6ff;
  border-radius: 8px;
  border: 1px solid rgba(59,130,246,.2);
  font-size: 0.78rem;
  color: #1e40af;
}
.amount-indicator-icon { width: 14px; height: 14px; flex-shrink: 0; }

// ── Spin ──────────────────────────────────────
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

// ── Responsive ────────────────────────────────
@media (max-width: 640px) {
  .traite-row-fields { grid-template-columns: 1fr; }
  .type-selector     { grid-template-columns: 1fr; }
  .compte-preview    { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>