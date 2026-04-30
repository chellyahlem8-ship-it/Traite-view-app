<template>
  <!-- ══════════════════════════════════════════════
       SubscriptionCards.vue
       Affichage des packs / abonnements disponibles
       ══════════════════════════════════════════════ -->
  <div class="packs-section">
    <div class="packs-header">
      <h2 class="packs-title">Choisissez votre pack</h2>
      <p class="packs-sub">Sélectionnez l'abonnement adapté à votre activité</p>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="packs-loading">
      <div class="spinner-purple" />
      <span>Chargement des packs...</span>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="packs-error">
      <span>⚠️ {{ error }}</span>
    </div>

    <!-- Grille des packs -->
    <div v-else class="packs-grid">
      <div
        v-for="pack in packs"
        :key="pack.id"
        class="pack-card"
        :class="{
          popular: pack.popular,
          selected: selectedPackId === pack.id
        }"
        @click="$emit('select', pack)"
      >
        <!-- Badge populaire -->
        <div v-if="pack.popular" class="popular-badge">⭐ Le plus populaire</div>

        <!-- En-tête de la carte -->
        <div class="pack-header">
          <div class="pack-icon">{{ getPackIcon(pack.id) }}</div>
          <div>
            <h3 class="pack-name">{{ pack.nom }}</h3>
            <p class="pack-desc">{{ pack.description }}</p>
          </div>
        </div>

        <!-- Prix -->
        <div class="pack-price">
          <span class="price-amount">{{ pack.prix }}</span>
          <span class="price-currency"> {{ pack.devise }}</span>
          <span class="price-period">/mois</span>
        </div>

        <!-- Fonctionnalités -->
        <ul class="pack-features">
          <li v-for="feature in pack.features" :key="feature">
            <span class="feature-check">✓</span>
            {{ feature }}
          </li>
        </ul>

        <!-- Bouton -->
        <button
          class="btn-choose"
          :class="{ 'btn-choose-selected': selectedPackId === pack.id }"
        >
          <span v-if="selectedPackId === pack.id">✓ Sélectionné</span>
          <span v-else>Choisir ce pack</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Pack } from '@/types/signup.types.ts'

// ─── Props & Emits ────────────────────────────────────────────
defineProps<{
  packs: Pack[]
  selectedPackId: number | null
  loading: boolean
  error: string | null
}>()

defineEmits<{
  (e: 'select', pack: Pack): void
}>()

// ─── Icônes par pack (fallback si pas d'image) ────────────────
const icons = ['🌱', '🚀', '💎', '🏢']
function getPackIcon(id: number): string {
  return icons[(id - 1) % icons.length] ?? '📦'
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.packs-section {
  width: 100%;
  padding: 32px 44px 24px;
  font-family: 'Outfit', sans-serif;
  border-top: 1.5px solid #ede9fe;
}

.packs-header {
  text-align: center;
  margin-bottom: 28px;
}

.packs-title {
  font-size: 22px;
  font-weight: 700;
  color: #4c1d95;
  margin: 0 0 6px;
}

.packs-sub {
  font-size: 13px;
  color: #7c3aed;
  margin: 0;
}

// ── Grille ────────────────────────────────────────────────────
.packs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

// ── Carte pack ────────────────────────────────────────────────
.pack-card {
  position: relative;
  background: #faf5ff;
  border: 2px solid #ddd6fe;
  border-radius: 18px;
  padding: 22px 18px 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &:hover {
    border-color: #8b5cf6;
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(109, 40, 217, 0.15);
  }

  &.popular {
    background: linear-gradient(145deg, #f5f3ff, #ede9fe);
    border-color: #7c3aed;
    box-shadow: 0 8px 28px rgba(109, 40, 217, 0.18);
  }

  &.selected {
    border-color: #6d28d9;
    background: #ede9fe;
    box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.15), 0 8px 28px rgba(109, 40, 217, 0.18);
  }
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #6d28d9, #8b5cf6);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3);
}

// ── Header carte ──────────────────────────────────────────────
.pack-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pack-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  background: rgba(139, 92, 246, 0.12);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pack-name {
  font-size: 15px;
  font-weight: 700;
  color: #4c1d95;
  margin: 0;
}

.pack-desc {
  font-size: 11px;
  color: #8b5cf6;
  margin: 2px 0 0;
  line-height: 1.4;
}

// ── Prix ──────────────────────────────────────────────────────
.pack-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 10px 0;
  border-top: 1px solid #e8e0fd;
  border-bottom: 1px solid #e8e0fd;
}

.price-amount {
  font-size: 28px;
  font-weight: 700;
  color: #6d28d9;
}

.price-currency {
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
}

.price-period {
  font-size: 12px;
  color: #a78bfa;
  margin-left: 2px;
}

// ── Features ──────────────────────────────────────────────────
.pack-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #5b21b6;
  }
}

.feature-check {
  color: #7c3aed;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

// ── Bouton choisir ────────────────────────────────────────────
.btn-choose {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
  margin-top: auto;

  &:hover { opacity: 0.9; transform: translateY(-1px); }

  &.btn-choose-selected {
    background: linear-gradient(135deg, #6d28d9, #7c3aed);
    box-shadow: 0 4px 14px rgba(109, 40, 217, 0.3);
  }
}

// ── États ─────────────────────────────────────────────────────
.packs-loading, .packs-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  font-size: 14px;
  color: #7c3aed;
}

.spinner-purple {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd6fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Responsive ────────────────────────────────────────────────
@media (max-width: 700px) {
  .packs-section { padding: 24px 20px 20px; }
  .packs-grid { grid-template-columns: 1fr; }
}
</style>