<template>
  <!-- ══════════════════════════════════════════════
       SignUpView.vue
       Page principale d'inscription — deux étapes :
         1. Informations personnelles (SignupForm)
         2. Choix du pack (SubscriptionCards)
       + Modal de paiement (PaymentModal)
       ══════════════════════════════════════════════ -->
  <div class="auth-root">
    <div class="signup-card" :class="{ 'card-expanded': step === 'packs' }">

      <!-- ═══ PANNEAU VIOLET (identique au login) ═══ -->
      <div class="color-panel">
        <div class="panel-content">
          <!-- Logo -->
          <div class="panel-logo">
            <TraityLogo :size="36" show-text />
          </div>

          <!-- Stat flottante haut -->
          <div class="stat-float stat-top">
            <span class="stat-icon">📄</span>
            <div>
              <p class="stat-value">1,284</p>
              <p class="stat-label">Traites actives</p>
            </div>
            <span class="stat-badge">+18%</span>
          </div>

          <!-- Illustration -->
          <div class="avatar-wrap">
            <img src="@/assets/t.png" alt="signup" class="avatar-img" />
          </div>

          <!-- Stat flottante bas -->
          <div class="stat-float stat-bottom">
            <span class="stat-icon">💰</span>
            <div>
              <p class="stat-value">842.5k DT</p>
              <p class="stat-label">Trésorerie totale</p>
            </div>
            <span class="stat-badge">+62%</span>
          </div>

          <!-- Indicateur d'étape -->
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

          <!-- ── ÉTAPE 1 : Formulaire d'inscription ── -->
          <Transition name="form-fade" mode="out-in">
            <div v-if="step === 'form'" key="form" class="form-inner">
              <SignupForm
                :loading="registerLoading"
                :global-error="registerError"
                @submit="handleFormSubmit"
              />
            </div>

            <!-- ── ÉTAPE 2 : Choix du pack ── -->
            <div v-else-if="step === 'packs'" key="packs" class="form-inner packs-inner">

              <!-- Bouton retour -->
              <button class="back-btn" @click="step = 'form'">
                ← Modifier mes informations
              </button>

              <!-- Récap utilisateur -->
              <div class="user-recap">
                <span class="user-avatar-mini">
                  {{ userData.prenom[0] }}{{ userData.nom[0] }}
                </span>
                <div>
                  <p class="user-recap-name">{{ userData.prenom }} {{ userData.nom }}</p>
                  <p class="user-recap-email">{{ userData.email }}</p>
                </div>
              </div>

              <!-- Cartes packs -->
              <SubscriptionCards
                :packs="packs"
                :selected-pack-id="selectedPackId"
                :loading="packsLoading"
                :error="packsError"
                @select="handlePackSelect"
              />

            </div>
          </Transition>

        </div>
      </div>

    </div>

    <!-- ═══ MODAL DE PAIEMENT ═══ -->
    <PaymentModal
      v-model="showPaymentModal"
      :pack="selectedPack"
      :user-email="userData.email"
      :on-confirm="handlePaymentConfirm"
      @confirmed="handlePaymentDone"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TraityLogo from '@/components/TraityLogo.vue'
import SignupForm from '@/components/SignupForm.vue'
import SubscriptionCards from '@/components/SubscriptionCards.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import { signupApi } from '@/api/signup.api'
import type { Pack } from '@/types/signup.types'

const router = useRouter()

// ─── Navigation entre étapes ──────────────────────────────────
type Step = 'form' | 'packs'
const step = ref<Step>('form')

// ─── Données utilisateur (partagées entre étapes) ─────────────
const userData = reactive({
  nom: '',
  prenom: '',
  email: '',
  password: '',
})

// ─── Inscription ──────────────────────────────────────────────
const registerLoading = ref(false)
const registerError = ref<string | null>(null)

/**
 * Étape 1 : L'utilisateur soumet le formulaire.
 * On valide et on passe à l'étape 2 (choix du pack).
 */
function handleFormSubmit(data: typeof userData) {
  Object.assign(userData, data)
  registerError.value = null
  step.value = 'packs'
}

// ─── Packs ────────────────────────────────────────────────────
const packs = ref<Pack[]>([])
const packsLoading = ref(false)
const packsError = ref<string | null>(null)
const selectedPackId = ref<number | null>(null)

const selectedPack = computed(() =>
  packs.value.find(p => p.id === selectedPackId.value) ?? null
)

/**
 * Charge les packs depuis l'API au montage du composant.
 * En cas d'échec, utilise des données de démo.
 */
onMounted(async () => {
  packsLoading.value = true
  try {
    packs.value = await signupApi.getPacks()
  } catch {
    // Données de démo si l'API n'est pas disponible
    packs.value = [
      {
        id: 1,
        nom: 'Starter',
        description: 'Idéal pour les indépendants et TPE',
        prix: 29,
        devise: 'DT',
        features: [
          'Jusqu\'à 50 traites/mois',
          '1 utilisateur',
          'Export PDF',
          'Support e-mail',
        ],
      },
      {
        id: 2,
        nom: 'Business',
        description: 'Pour les PME en croissance',
        prix: 79,
        devise: 'DT',
        popular: true,
        features: [
          'Traites illimitées',
          '5 utilisateurs',
          'Rapports avancés',
          'Intégration bancaire',
          'Support prioritaire',
        ],
      },
      {
        id: 3,
        nom: 'Pro',
        description: 'Pour les grandes entreprises',
        prix: 149,
        devise: 'DT',
        features: [
          'Tout Business inclus',
          'Utilisateurs illimités',
          'API complète',
          'Manager dédié',
          'SLA garanti',
        ],
      },
    ]
  } finally {
    packsLoading.value = false
  }
})

// ─── Sélection d'un pack → ouverture modal ────────────────────
const showPaymentModal = ref(false)

function handlePackSelect(pack: Pack) {
  selectedPackId.value = pack.id
  showPaymentModal.value = true
}

// ─── Confirmation du paiement (callback pour PaymentModal) ────
async function handlePaymentConfirm(method: 'online' | 'virement') {
  if (!selectedPack.value) return

  // Appel API pour créer la demande en BDD (statut: en_attente)
  await signupApi.register({
    nom: userData.nom,
    prenom: userData.prenom,
    email: userData.email,
    motDePasse: userData.password,
    confirmMotDePasse: userData.password,
    idPack: selectedPack.value.id,
    methodePaiement: method,
  })
}

/**
 * Après confirmation, la modal affiche le message d'attente.
 * Quand l'utilisateur clique "Retour à la connexion", on redirige.
 */
function handlePaymentDone() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

// ── Root ──────────────────────────────────────────────────────
.auth-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ede9fe;
  font-family: 'Outfit', sans-serif;
  padding: 24px 16px;
}

// ── Card principale ───────────────────────────────────────────
.signup-card {
  width: 900px;
  max-width: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 24px 60px rgba(109, 40, 217, 0.2);
  background: #f5f3ff;
  display: flex;
  min-height: 560px;
  transition: min-height 0.4s ease;

  &.card-expanded {
    min-height: 680px;
  }
}

// ── Panneau violet (réutilisé du login) ───────────────────────
.color-panel {
  width: 50%;
  flex-shrink: 0;
  background: linear-gradient(150deg, #6d28d9 0%, #8b5cf6 40%, #a78bfa 75%, #c4b5fd 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.15);
    top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 210px; height: 210px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.1);
    bottom: 50px; left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }
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
}

// ── Stats flottantes ──────────────────────────────────────────
.stat-float {
  position: absolute;
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 10px 16px;
  color: #fff;
  min-width: 175px;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(60,0,100,0.2);

  .stat-icon  { font-size: 18px; }
  .stat-value { font-size: 13px; font-weight: 600; margin: 0; }
  .stat-label { font-size: 10px; opacity: 0.8; margin: 0; }
  .stat-badge {
    margin-left: auto;
    font-size: 10px; font-weight: 600;
    color: #d1fae5;
    background: rgba(52,211,153,0.2);
    border-radius: 6px;
    padding: 2px 7px;
  }
}

.stat-top    { top: 20%; right: 5%;  animation: floatUp   4s   ease-in-out infinite; }
.stat-bottom { bottom: 14%; left: 3%; animation: floatDown 4.5s ease-in-out infinite; }

@keyframes floatUp   { 0%,100% { transform: translateY(0);   } 50% { transform: translateY(-12px); } }
@keyframes floatDown { 0%,100% { transform: translateY(0);   } 50% { transform: translateY(12px);  } }

// ── Indicateur d'étape ────────────────────────────────────────
.step-indicator {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 6;
}

.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;

  &.active {
    background: #fff;
    border-color: #fff;
    color: #7c3aed;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  &.done {
    background: rgba(255,255,255,0.4);
    border-color: #fff;
    color: #fff;
    cursor: pointer;
    &:hover { background: rgba(255,255,255,0.55); }
  }
}

.step-line {
  width: 28px;
  height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  transition: background 0.3s;

  &.active { background: rgba(255,255,255,0.8); }
}

// ── Panneau formulaire ────────────────────────────────────────
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

// ── Contenu interne ───────────────────────────────────────────
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

// ── Bouton retour ─────────────────────────────────────────────
.back-btn {
  background: none;
  border: none;
  color: #8b5cf6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  padding: 0 0 16px;
  text-align: left;
  transition: color 0.2s;

  &:hover { color: #6d28d9; text-decoration: underline; }
}

// ── Récap utilisateur ─────────────────────────────────────────
.user-recap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #faf5ff;
  border: 1.5px solid #ddd6fe;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.user-avatar-mini {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d28d9, #8b5cf6);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  flex-shrink: 0;
}

.user-recap-name {
  font-size: 14px;
  font-weight: 600;
  color: #4c1d95;
  margin: 0;
}

.user-recap-email {
  font-size: 12px;
  color: #8b5cf6;
  margin: 2px 0 0;
}

// ── Transitions ───────────────────────────────────────────────
.form-fade-enter-active { transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s; }
.form-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.form-fade-enter-from  { opacity: 0; transform: translateX(20px); }
.form-fade-leave-to    { opacity: 0; transform: translateX(-20px); }

// ── Responsive ────────────────────────────────────────────────
@media (max-width: 768px) {
  .signup-card {
    flex-direction: column;
    min-height: auto;
  }

  .color-panel {
    width: 100%;
    height: 200px;
    border-radius: 20px 20px 0 0;
    flex-shrink: 0;
  }

  .panel-content { flex-direction: row; justify-content: space-around; padding: 20px; }
  .avatar-img { width: 100px; }
  .stat-float { display: none; }

  .step-indicator {
    position: static;
    transform: none;
    margin-top: 12px;
  }

  .panel-logo { top: 16px; left: 16px; }

  .form-inner {
    padding: 28px 24px;
  }

  .packs-inner {
    padding-top: 20px;
  }
}

@media (max-width: 480px) {
  .auth-root { padding: 0; }
  .signup-card { border-radius: 0; min-height: 100vh; }
  .color-panel { border-radius: 0; }
  .form-inner { padding: 24px 18px; }
}
</style>