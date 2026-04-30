<template>
  <!-- ══════════════════════════════════════════════
       PaymentModal.vue
       Modal de sélection et traitement du paiement
       ══════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="modal-box">

          <!-- ── En-tête ── -->
          <div class="modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">💳</span>
              <div>
                <h2 class="modal-title">Finaliser votre abonnement</h2>
                <p class="modal-pack-name">Pack {{ pack?.nom }} — {{ pack?.prix }} {{ pack?.devise }}/mois</p>
              </div>
            </div>
            <button class="modal-close" @click="$emit('update:modelValue', false)">✕</button>
          </div>

          <!-- ══ ÉTAPE 1 : Choix méthode ══ -->
          <div v-if="step === 'choice'" class="modal-body">
            <p class="step-label">Choisissez votre méthode de paiement</p>

            <div class="payment-options">
              <!-- Option carte bancaire -->
              <button
                class="payment-option"
                :class="{ active: method === 'online' }"
                @click="method = 'online'"
              >
                <span class="pay-icon">💳</span>
                <div class="pay-info">
                  <span class="pay-title">Paiement en ligne</span>
                  <span class="pay-sub">Carte bancaire (Visa, MasterCard)</span>
                </div>
                <span class="pay-check" :class="{ visible: method === 'online' }">✓</span>
              </button>

              <!-- Option virement -->
              <button
                class="payment-option"
                :class="{ active: method === 'virement' }"
                @click="method = 'virement'"
              >
                <span class="pay-icon">🏦</span>
                <div class="pay-info">
                  <span class="pay-title">Virement bancaire</span>
                  <span class="pay-sub">Transfert direct depuis votre banque</span>
                </div>
                <span class="pay-check" :class="{ visible: method === 'virement' }">✓</span>
              </button>
            </div>

            <button
              class="btn-primary"
              :disabled="!method"
              @click="proceedToPayment"
            >
              Continuer →
            </button>
          </div>

          <!-- ══ ÉTAPE 2A : Paiement en ligne (simulation) ══ -->
          <div v-else-if="step === 'online'" class="modal-body">
            <p class="step-label">Informations de carte bancaire</p>

            <div class="card-form">
              <div class="field-group">
                <label>Numéro de carte</label>
                <div class="card-input-wrap">
                  <input
                    v-model="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    @input="formatCard"
                  />
                  <span class="card-brand">💳</span>
                </div>
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label>Date d'expiration</label>
                  <input
                    v-model="cardExpiry"
                    type="text"
                    placeholder="MM/AA"
                    maxlength="5"
                    @input="formatExpiry"
                  />
                </div>
                <div class="field-group">
                  <label>CVV</label>
                  <input
                    v-model="cardCvv"
                    type="password"
                    placeholder="•••"
                    maxlength="3"
                  />
                </div>
              </div>

              <div class="field-group">
                <label>Nom du titulaire</label>
                <input v-model="cardHolder" type="text" placeholder="JEAN DUPONT" />
              </div>

              <p v-if="paymentError" class="error-msg">{{ paymentError }}</p>

              <div class="modal-actions">
                <button class="btn-secondary" @click="step = 'choice'">← Retour</button>
                <button
                  class="btn-primary"
                  :disabled="paymentLoading || !isCardValid"
                  @click="simulateOnlinePayment"
                >
                  <span v-if="paymentLoading" class="spinner" />
                  <span v-else>Payer {{ pack?.prix }} {{ pack?.devise }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ══ ÉTAPE 2B : Virement bancaire ══ -->
          <div v-else-if="step === 'virement'" class="modal-body">
            <p class="step-label">Informations de virement bancaire</p>

            <div class="bank-info-card">
              <div class="bank-info-row">
                <span class="bank-label">Bénéficiaire</span>
                <span class="bank-value">Traity SAS</span>
              </div>
              <div class="bank-info-row">
                <span class="bank-label">RIB</span>
                <span class="bank-value">123456789012345678901234</span>
              </div>
              <div class="bank-info-row">
                <span class="bank-label">Banque</span>
                <span class="bank-value">BIAT — Banque Internationale Arabe de Tunisie</span>
              </div>
              <div class="bank-info-row highlight">
                <span class="bank-label">Référence obligatoire</span>
                <span class="bank-value ref">{{ paymentRef }}</span>
              </div>
              <div class="bank-info-row">
                <span class="bank-label">Montant</span>
                <span class="bank-value amount">{{ pack?.prix }} {{ pack?.devise }}/mois</span>
              </div>
            </div>

            <div class="virement-notice">
              <span>⚠️</span>
              <p>Mentionnez impérativement la référence ci-dessus dans votre virement. Votre compte sera activé après réception et vérification du paiement par notre équipe (1-3 jours ouvrés).</p>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="step = 'choice'">← Retour</button>
              <button class="btn-primary" @click="confirmVirement">
                J'ai effectué le virement ✓
              </button>
            </div>
          </div>

          <!-- ══ ÉTAPE 3 : Confirmation finale ══ -->
          <div v-else-if="step === 'success'" class="modal-body success-body">
            <div class="success-animation">
              <div class="success-circle">
                <span class="success-check">✓</span>
              </div>
            </div>

            <h3 class="success-title">Demande envoyée !</h3>

            <div class="pending-notice">
              <span class="pending-icon">⏳</span>
              <div>
                <p class="pending-title">Votre compte est en attente de validation</p>
                <p class="pending-sub">
                  Un administrateur va examiner votre demande et créer votre compte.
                  Vous recevrez un e-mail de confirmation à <strong>{{ userEmail }}</strong>.
                </p>
              </div>
            </div>

            <div v-if="method === 'online'" class="transaction-info">
              <span class="tx-label">N° de transaction</span>
              <span class="tx-value">{{ transactionId }}</span>
            </div>

            <button class="btn-primary" @click="handleClose">
              Retour à la connexion
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Pack } from '@/types/signup.types.ts'

// ─── Props & Emits ────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  pack: Pack | null
  userEmail: string
  onConfirm: (method: 'online' | 'virement') => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirmed', method: 'online' | 'virement'): void
}>()

// ─── État interne ─────────────────────────────────────────────
type Step = 'choice' | 'online' | 'virement' | 'success'

const step = ref<Step>('choice')
const method = ref<'online' | 'virement' | null>(null)
const paymentLoading = ref(false)
const paymentError = ref<string | null>(null)
const transactionId = ref('')

// Champs carte bancaire
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const cardHolder = ref('')

// Référence de paiement unique
const paymentRef = computed(() => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TRY-${props.pack?.id ?? '0'}-${rand}`
})

// Validation carte simple
const isCardValid = computed(() => {
  return (
    cardNumber.value.replace(/\s/g, '').length === 16 &&
    cardExpiry.value.length === 5 &&
    cardCvv.value.length === 3 &&
    cardHolder.value.trim().length >= 3
  )
})

// ─── Formatage ────────────────────────────────────────────────
function formatCard(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '').substring(0, 16)
  cardNumber.value = v.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '').substring(0, 4)
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2)
  cardExpiry.value = v
}

// ─── Navigation ───────────────────────────────────────────────
function proceedToPayment() {
  if (!method.value) return
  step.value = method.value
}

// ─── Paiement en ligne (simulation) ──────────────────────────
async function simulateOnlinePayment() {
  paymentLoading.value = true
  paymentError.value = null

  try {
    // Simulation : délai réseau fictif de 1.8s
    await new Promise(resolve => setTimeout(resolve, 1800))

    // Génère un ID de transaction factice
    transactionId.value = 'TXN-' + Date.now().toString(36).toUpperCase()

    // Appel du callback parent pour enregistrer la demande en BDD
    await props.onConfirm('online')

    step.value = 'success'
  } catch {
    paymentError.value = 'Le paiement a échoué. Veuillez vérifier vos informations.'
  } finally {
    paymentLoading.value = false
  }
}

// ─── Confirmation virement ────────────────────────────────────
async function confirmVirement() {
  try {
    await props.onConfirm('virement')
    step.value = 'success'
  } catch {
    paymentError.value = 'Une erreur est survenue. Veuillez réessayer.'
  }
}

// ─── Fermeture ────────────────────────────────────────────────
function handleClose() {
  emit('confirmed', method.value!)
  emit('update:modelValue', false)
  // Reset l'état pour la prochaine ouverture
  setTimeout(() => {
    step.value = 'choice'
    method.value = null
    cardNumber.value = ''
    cardExpiry.value = ''
    cardCvv.value = ''
    cardHolder.value = ''
    paymentError.value = null
    transactionId.value = ''
  }, 400)
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

// ── Overlay ──────────────────────────────────────────────────
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(76, 29, 149, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  font-family: 'Outfit', sans-serif;
}

// ── Boîte modale ──────────────────────────────────────────────
.modal-box {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 32px 80px rgba(109, 40, 217, 0.25);
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

// ── Header ────────────────────────────────────────────────────
.modal-header {
  background: linear-gradient(135deg, #6d28d9, #8b5cf6);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.modal-pack-name {
  font-size: 12px;
  color: rgba(255,255,255,0.75);
  margin: 2px 0 0;
}

.modal-close {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 8px;
  color: #fff;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.35); }
}

// ── Body ──────────────────────────────────────────────────────
.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.step-label {
  font-size: 13px;
  color: #7c3aed;
  font-weight: 500;
  margin: 0;
}

// ── Options de paiement ───────────────────────────────────────
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid #ddd6fe;
  border-radius: 12px;
  background: #faf5ff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: #8b5cf6;
    background: #f5f3ff;
  }

  &.active {
    border-color: #7c3aed;
    background: #f5f3ff;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
  }
}

.pay-icon { font-size: 24px; }

.pay-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pay-title {
  font-size: 14px;
  font-weight: 600;
  color: #4c1d95;
}

.pay-sub {
  font-size: 12px;
  color: #8b5cf6;
}

.pay-check {
  font-size: 16px;
  color: #7c3aed;
  opacity: 0;
  transition: opacity 0.2s;
  &.visible { opacity: 1; }
}

// ── Formulaire carte ──────────────────────────────────────────
.card-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 500;
    color: #7c3aed;
  }

  input {
    padding: 11px 14px;
    border: 1.5px solid #ddd6fe;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #4c1d95;
    background: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
    }
    &::placeholder { color: #c4b5fd; }
  }
}

.card-input-wrap {
  position: relative;
  input { width: 100%; padding-right: 40px; }
  .card-brand {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

// ── Infos bancaires ───────────────────────────────────────────
.bank-info-card {
  background: #faf5ff;
  border: 1.5px solid #ddd6fe;
  border-radius: 14px;
  overflow: hidden;
}

.bank-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #ede9fe;
  gap: 12px;

  &:last-child { border-bottom: none; }

  &.highlight {
    background: #ede9fe;
  }
}

.bank-label {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 500;
  min-width: 130px;
}

.bank-value {
  font-size: 13px;
  color: #4c1d95;
  font-weight: 600;
  text-align: right;

  &.rib {
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  &.ref {
    color: #7c3aed;
    font-size: 14px;
    letter-spacing: 1px;
  }

  &.amount {
    color: #6d28d9;
    font-size: 15px;
  }
}

.virement-notice {
  display: flex;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 12px 14px;

  span { font-size: 16px; flex-shrink: 0; }
  p {
    font-size: 12px;
    color: #78350f;
    margin: 0;
    line-height: 1.5;
  }
}

// ── Actions ───────────────────────────────────────────────────
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-primary {
  flex: 1;
  padding: 13px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: opacity 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-secondary {
  padding: 13px 18px;
  background: #f5f3ff;
  color: #7c3aed;
  border: 1.5px solid #ddd6fe;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;

  &:hover { background: #ede9fe; border-color: #a78bfa; }
}

// ── Succès ────────────────────────────────────────────────────
.success-body {
  align-items: center;
  text-align: center;
  padding: 32px 24px;
}

.success-animation {
  margin-bottom: 8px;
}

.success-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d28d9, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.35);
}

.success-check {
  font-size: 32px;
  color: #fff;
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  color: #4c1d95;
  margin: 0;
}

.pending-notice {
  display: flex;
  gap: 14px;
  background: #faf5ff;
  border: 1.5px solid #ddd6fe;
  border-radius: 14px;
  padding: 16px;
  text-align: left;
  width: 100%;
}

.pending-icon { font-size: 24px; flex-shrink: 0; }

.pending-title {
  font-size: 14px;
  font-weight: 600;
  color: #4c1d95;
  margin: 0 0 6px;
}

.pending-sub {
  font-size: 12px;
  color: #7c3aed;
  margin: 0;
  line-height: 1.5;

  strong { color: #6d28d9; }
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 10px 16px;
  width: 100%;
}

.tx-label {
  font-size: 12px;
  color: #166534;
}

.tx-value {
  font-size: 13px;
  font-weight: 700;
  color: #15803d;
  font-family: monospace;
}

// ── Divers ────────────────────────────────────────────────────
.error-msg {
  font-size: 13px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Transitions modale ────────────────────────────────────────
.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>