<template>
  <div class="auth-root">
    <div class="signup-card" :class="{ 'card-expanded': step === 'packs' }">

      <!-- ═══ PANNEAU VIOLET ═══ -->
      <div class="color-panel">
        <div class="panel-content">
          <div class="panel-logo">
            <TraityLogo :size="36" show-text />
          </div>

          <!-- Image selon l'étape -->
          <div class="avatar-wrap">
            <img
              :src="step === 'form' ? t2img : t3img"
              alt="signup"
              class="avatar-img"
            />
          </div>

          <div class="step-indicator">
            <div
              class="step-dot"
              :class="{ active: step === 'form', done: step === 'packs' }"
              @click="step === 'packs' && (step = 'form')"
            >
              <span>1</span>
            </div>
            <div class="step-line" :class="{ active: step === 'packs' }" />
            <div class="step-dot" :class="{ active: step === 'packs' }">
              <span>2</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ PANNEAU FORMULAIRE ═══ -->
      <div class="form-panel">
        <div class="form-scroll">
          <Transition name="form-fade" mode="out-in">

            <div v-if="step === 'form'" key="form" class="form-inner">
              <SignupForm
                :loading="registerLoading"
                :global-error="registerError"
                @submit="handleFormSubmit"
              />
            </div>

            <!-- ── ÉTAPE 2 : Abonnement ── -->
            <div v-else-if="step === 'packs'" key="packs" class="form-inner packs-inner">

              <button class="back-btn" @click="step = 'form'">
                ← Modifier mes informations
              </button>

              <div class="user-recap">
                <span class="user-avatar-mini">
                  {{ userData.prenom[0] }}{{ userData.nom[0] }}
                </span>
                <div>
                  <p class="user-recap-name">{{ userData.prenom }} {{ userData.nom }}</p>
                  <p class="user-recap-email">{{ userData.email }}</p>
                </div>
              </div>

              <!-- Titre -->
              <div class="pack-section-title">
                <h2>Votre abonnement Traity</h2>
                <p>Accès complet à toutes les fonctionnalités</p>
              </div>

              <!-- Tabs période -->
              <div class="period-tabs">
                <button
                  v-for="p in periods"
                  :key="p.value"
                  class="period-btn"
                  :class="{ active: activePeriod === p.value }"
                  @click="activePeriod = p.value"
                >
                  {{ p.label }}
                  <span v-if="p.badge" class="period-badge">{{ p.badge }}</span>
                </button>
              </div>

              <!-- Carte unique -->
              <div
                class="pack-card-single"
                :class="{ selected: isSelected }"
                @click="handlePackSelect()"
              >
                <div class="pack-card-left">
                  <div class="pack-icon-big">🚀</div>
                  <div>
                    <h3 class="pack-name">Traity Pro</h3>
                    <p class="pack-desc">Solution complète de gestion de traites et trésorerie</p>
                  </div>
                </div>

                <div class="pack-price-block">
                  <div class="pack-price">
                    <span class="price-amount">{{ prixAffiche }}</span>
                    <span class="price-currency"> DT</span>
                    <span class="price-period">/{{ periodeLabel }}</span>
                  </div>
                  <p class="price-note">{{ priceNote }}</p>
                </div>

                <ul class="pack-features">
                  <li v-for="f in features" :key="f.label">
                    <span class="feature-icon">{{ f.icon }}</span>
                    <span>{{ f.label }}</span>
                  </li>
                </ul>

                <button class="btn-choose" :class="{ 'btn-choose-selected': isSelected }">
                  <span v-if="isSelected">✓ Sélectionné</span>
                  <span v-else>Choisir cet abonnement</span>
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </div>

    </div>

    <Paymentmodal
      v-model="showPaymentModal"
      :prix="prixAffiche"
      :periode="periodeLabel"
      :user-email="userData.email"
      :on-confirm="handlePaymentConfirm"
      @confirmed="handlePaymentDone"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import TraityLogo from '@/components/TraityLogo.vue'
import SignupForm from '@/components/SignupForm.vue'
import PaymentModal from '@/components/Paymentmodal.vue'
import { signupApi } from '@/api/signup.api'

import t2img from '@/assets/t2.jpg'
import t3img from '@/assets/t3.jpg'

const router = useRouter()

type Step = 'form' | 'packs'
const step = ref<Step>('form')
const userData = reactive({ nom: '', prenom: '', email: '', password: '' })
const registerLoading = ref(false)
const registerError = ref<string | null>(null)

function handleFormSubmit(data: typeof userData) {
  Object.assign(userData, data)
  registerError.value = null
  step.value = 'packs'
}

// ─── Périodes ─────────────────────────────────────────────────
const periods = [
  { value: 'mensuel',     label: 'Mensuel',     badge: null   },
  { value: 'trimestriel', label: 'Trimestriel', badge: '-10%' },
  { value: 'annuel',      label: 'Annuel',      badge: '-20%' },
]
const activePeriod = ref('mensuel')
const PRIX_BASE = 49 // DT/mois

const prixAffiche = computed(() => {
  if (activePeriod.value === 'trimestriel') return Math.round(PRIX_BASE * 3 * 0.9)
  if (activePeriod.value === 'annuel')      return Math.round(PRIX_BASE * 12 * 0.8)
  return PRIX_BASE
})

const periodeLabel = computed(() => {
  if (activePeriod.value === 'trimestriel') return 'trim.'
  if (activePeriod.value === 'annuel')      return 'an'
  return 'mois'
})

const priceNote = computed(() => {
  if (activePeriod.value === 'trimestriel') return `Soit ${PRIX_BASE * 0.9} DT/mois — économisez 10%`
  if (activePeriod.value === 'annuel')      return `Soit ${Math.round(PRIX_BASE * 0.8)} DT/mois — économisez 20%`
  return 'Sans engagement'
})

// ─── Features de l'app ────────────────────────────────────────
const features = [
  { icon: '📄', label: 'Gestion complète des traites (émission, suivi, encaissement)' },
  { icon: '🏦', label: 'Gestion des comptes bancaires et RIB' },
  { icon: '👥', label: 'Gestion des tiers (clients & fournisseurs)' },
  { icon: '🔔', label: 'Notifications automatiques d\'échéance (J-7, J-3, J-0)' },
  { icon: '📊', label: 'Tableau de bord trésorerie en temps réel' },
  { icon: '📤', label: 'Export PDF et rapports financiers' },
  { icon: '🔒', label: 'Accès sécurisé multi-utilisateurs' },
  { icon: '⚡', label: 'Support prioritaire inclus' },
]

// ─── Sélection ────────────────────────────────────────────────
const isSelected = ref(false)
const showPaymentModal = ref(false)

function handlePackSelect() {
  isSelected.value = true
  showPaymentModal.value = true
}

async function handlePaymentConfirm(method: 'online' | 'virement') {
  await signupApi.register({
    nom: userData.nom,
    prenom: userData.prenom,
    email: userData.email,
    motDePasse: userData.password,
    confirmMotDePasse: userData.password,
    idPack: 1,
    methodePaiement: method,
  })
}

function handlePaymentDone() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.auth-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ede9fe;
  font-family: 'Outfit', sans-serif;
  padding: 24px 16px;
}

.signup-card {
  width: 900px;
  max-width: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(109, 40, 217, 0.2);
  background: #f5f3ff;
  display: flex;
  min-height: 560px;
  transition: min-height 0.4s ease;
  &.card-expanded { min-height: 680px; }
}

.color-panel {
  width: 50%;
  flex-shrink: 0;
  background: linear-gradient(150deg, #6d28d9 0%, #8b5cf6 40%, #a78bfa 75%, #c4b5fd 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.panel-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.panel-logo {
  position: absolute;
  top: 24px; left: 28px;
  z-index: 2;
  :deep(.traity-name) { color: #fff !important; }
}

.avatar-wrap { z-index: 1; }
.avatar-img {
  width: 190px;
  height: auto;
  display: block;
  filter: drop-shadow(0 10px 28px rgba(80, 0, 120, 0.3));
  transition: opacity 0.3s ease;
}

.step-indicator {
  position: absolute;
  bottom: 24px; left: 50%;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 6px;
  z-index: 6;
}

.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
  font-size: 12px; font-weight: 600;
  transition: all 0.3s;

  &.active { background: #fff; border-color: #fff; color: #7c3aed; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  &.done   { background: rgba(255,255,255,0.4); border-color: #fff; color: #fff; cursor: pointer;
              &:hover { background: rgba(255,255,255,0.55); } }
}

.step-line {
  width: 28px; height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  transition: background 0.3s;
  &.active { background: rgba(255,255,255,0.8); }
}

.form-panel {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ddd6fe transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 4px; }
}

.form-inner {
  padding: 44px 44px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.packs-inner {
  padding-top: 28px;
  align-items: stretch;
}

.back-btn {
  background: none; border: none;
  color: #8b5cf6; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'Outfit', sans-serif;
  padding: 0 0 16px; text-align: left;
  transition: color 0.2s;
  &:hover { color: #6d28d9; text-decoration: underline; }
}

.user-recap {
  display: flex; align-items: center; gap: 12px;
  background: #faf5ff; border: 1.5px solid #ddd6fe;
  border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;
}

.user-avatar-mini {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d28d9, #8b5cf6);
  color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-transform: uppercase; flex-shrink: 0;
}

.user-recap-name  { font-size: 14px; font-weight: 600; color: #4c1d95; margin: 0; }
.user-recap-email { font-size: 12px; color: #8b5cf6; margin: 2px 0 0; }

.pack-section-title {
  margin-bottom: 16px;
  h2 { font-size: 17px; font-weight: 700; color: #4c1d95; margin: 0 0 4px; }
  p  { font-size: 12px; color: #8b5cf6; margin: 0; }
}

.period-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: #f0ebff;
  border-radius: 12px;
  padding: 5px;
}

.period-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  background: transparent;
  color: #7c3aed;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;

  &:hover { background: rgba(139,92,246,0.1); }
  &.active {
    background: #6d28d9;
    color: #fff;
    box-shadow: 0 4px 14px rgba(109,40,217,0.3);
  }
}

.period-badge {
  font-size: 10px; font-weight: 600;
  background: #d1fae5; color: #065f46;
  border-radius: 6px; padding: 1px 6px;
  .active & { background: rgba(255,255,255,0.25); color: #fff; }
}

// ── Carte abonnement unique ────────────────────────────────────
.pack-card-single {
  background: #faf5ff;
  border: 2px solid #ddd6fe;
  border-radius: 18px;
  padding: 24px 20px 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex; flex-direction: column; gap: 16px;

  &:hover { border-color: #8b5cf6; box-shadow: 0 12px 32px rgba(109,40,217,0.15); }
  &.selected {
    border-color: #6d28d9;
    background: linear-gradient(145deg, #f5f3ff, #ede9fe);
    box-shadow: 0 0 0 3px rgba(109,40,217,0.15), 0 8px 28px rgba(109,40,217,0.18);
  }
}

.pack-card-left {
  display: flex; align-items: center; gap: 14px;
}

.pack-icon-big {
  font-size: 32px; width: 52px; height: 52px;
  background: rgba(139,92,246,0.12); border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.pack-name { font-size: 18px; font-weight: 700; color: #4c1d95; margin: 0; }
.pack-desc { font-size: 12px; color: #8b5cf6; margin: 4px 0 0; line-height: 1.4; }

.pack-price-block {
  background: rgba(109,40,217,0.06);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: space-between;
}

.pack-price {
  display: flex; align-items: baseline; gap: 2px;
}
.price-amount   { font-size: 32px; font-weight: 700; color: #6d28d9; }
.price-currency { font-size: 14px; font-weight: 600; color: #7c3aed; }
.price-period   { font-size: 13px; color: #a78bfa; margin-left: 4px; }
.price-note     { font-size: 12px; color: #8b5cf6; margin: 0; font-style: italic; }

.pack-features {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;

  li {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 12px; color: #5b21b6; line-height: 1.4;
  }
}

.feature-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

.btn-choose {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: #fff; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all 0.2s;

  &:hover { opacity: 0.9; transform: translateY(-1px); }
  &.btn-choose-selected {
    background: linear-gradient(135deg, #6d28d9, #7c3aed);
    box-shadow: 0 4px 14px rgba(109,40,217,0.3);
  }
}

.form-fade-enter-active { transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s; }
.form-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.form-fade-enter-from  { opacity: 0; transform: translateX(20px); }
.form-fade-leave-to    { opacity: 0; transform: translateX(-20px); }

@media (max-width: 768px) {
  .signup-card { flex-direction: column; min-height: auto; }
  .color-panel { width: 100%; height: 200px; border-radius: 20px 20px 0 0; flex-shrink: 0; }
  .panel-content { flex-direction: row; justify-content: space-around; padding: 20px; }
  .avatar-img { width: 100px; }
  .step-indicator { position: static; transform: none; margin-top: 12px; }
  .panel-logo { top: 16px; left: 16px; }
  .form-inner { padding: 28px 24px; }
  .packs-inner { padding-top: 20px; }
  .period-tabs { flex-direction: column; }
  .pack-features { grid-template-columns: 1fr; }
  .pack-price-block { flex-direction: column; align-items: flex-start; gap: 4px; }
}

@media (max-width: 480px) {
  .auth-root { padding: 0; }
  .signup-card { border-radius: 0; min-height: 100vh; }
  .color-panel { border-radius: 0; }
  .form-inner { padding: 24px 18px; }
}
</style>