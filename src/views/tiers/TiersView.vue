<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">
      <!-- ── Titre de la page ────────────────────────────────── -->
      <div class="page-header">
        <h1 class="page-title">Tiers</h1>
      </div>

      <!-- ── Statistiques rapides ─────── -->
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div>
            <div class="stat-value">{{ tiers.length }}</div>
            <div class="stat-label">Total tiers</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div>
            <div class="stat-value">{{ tiersClients }}</div>
            <div class="stat-label">Clients</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📦</span>
          <div>
            <div class="stat-value">{{ tiersFournisseurs }}</div>
            <div class="stat-label">Fournisseurs</div>
          </div>
        </div>
      </div>

      <!-- ── Toasts ─────────────────────────────────────────────── -->
      <Transition name="slide-down">
        <div v-if="toastMsg" :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']">
          <span>{{ toastMsg }}</span>
          <button class="toast-close" @click="toastMsg = null">✕</button>
        </div>
      </Transition>

      <!-- ── Panneau principal ─────────────────────────────────── -->
      <div class="table-panel">
        <!-- Boutons d'action -->
        <div class="action-bar">
          <button class="btn btn--primary" @click="goCreate">
            <span>＋</span> Créer tiers
          </button>
          <button
            class="btn btn--secondary"
            :disabled="!selectedTierId"
            @click="goEdit"
          >
            ✏️ Modifier tiers
          </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="loader-wrapper">
          <div class="spinner"></div>
          <span>Chargement des tiers…</span>
        </div>

        <!-- Tableau -->
        <div v-else-if="tiers.length > 0" class="table-wrapper">
          <table class="tiers-table">
            <thead>
              <tr>
                <th></th>
                <th>NOM DU TIERS</th>
                <th>COMPTES BANCAIRES</th>
                <th>ADRESSE</th>
                <th>TÉLÉPHONE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tier in tiers"
                :key="tier.id"
                :class="{ selected: selectedTierId === tier.id }"
                @click="selectTier(tier.id)"
              >
                <!-- Avatar -->
                <td class="td-avatar">
                  <div class="avatar">{{ initiales(tier.raison_sociale) }}</div>
                </td>

                <!-- Nom -->
                <td class="td-name">
                  <span class="tier-name">{{ tier.raison_sociale }}</span>
                  <span class="tier-type">{{ tier.type_tiers?.type ?? '' }}</span>
                </td>

                <!-- ✅ TOUS les comptes bancaires du tiers -->
                <td class="td-bank">
                  <template v-if="tier.comptes_bancaires && tier.comptes_bancaires.length > 0">
                    <div
                      v-for="(compte, idx) in tier.comptes_bancaires"
                      :key="compte.id"
                      class="bank-entry"
                      :class="{ 'bank-entry--separator': idx > 0 }"
                    >
                      <span class="bank-name">{{ compte.banque?.nomBanque ?? '—' }}</span>
                      <span class="bank-rib">{{ compte.rib }}</span>
                    </div>
                  </template>
                  <span v-else class="no-data">—</span>
                </td>

                <!-- Adresse -->
                <td class="td-address">{{ tier.adresse }}</td>

                <!-- Téléphone -->
                <td class="td-tel">{{ tier.num_tel }}</td>

                <!-- Action Edit -->
                <td class="td-action">
                  <button class="link-btn" @click.stop="editTier(tier.id)">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vide -->
        <div v-else class="empty-state">
          <p>Aucun tiers trouvé. Commencez par en créer un.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { tiersApi, type Tier } from '@/api/tiers.api'

const router = useRouter()

// ── État ─────────────────────────────────────────────────────
const tiers          = ref<Tier[]>([])
const loading        = ref(false)
const toastMsg       = ref<string | null>(null)
const toastType      = ref<'success' | 'error'>('success')
const selectedTierId = ref<number | null>(null)

// ── Stats rapides ────────────────────────────────────────────
const tiersClients      = computed(() => tiers.value.filter(t => t.type_tiers?.type?.toLowerCase() === 'client').length)
const tiersFournisseurs = computed(() => tiers.value.filter(t => t.type_tiers?.type?.toLowerCase() === 'fournisseur').length)

// ── Helpers ──────────────────────────────────────────────────
function initiales(nom: string): string {
  return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Chargement ───────────────────────────────────────────────
async function fetchAll() {
  loading.value = true
  try {
    const tiersRes = await tiersApi.getAll()
    tiers.value = tiersRes.data
  } catch {
    showToast('Erreur lors du chargement des tiers.', 'error')
  } finally {
    loading.value = false
  }
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = null }, 4000)
}

// ── Sélection ────────────────────────────────────────────────
function selectTier(id: number) {
  selectedTierId.value = selectedTierId.value === id ? null : id
}

// ── Navigation ───────────────────────────────────────────────
function goCreate() { router.push({ name: 'CreateTier' }) }
function goEdit()   { if (selectedTierId.value) router.push({ name: 'EditTier', params: { id: selectedTierId.value } }) }
function editTier(id: number) { router.push({ name: 'EditTier', params: { id } }) }

onMounted(fetchAll)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

/* ── Layout ─────────────────────────────────────────────────── */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f7ff;
}

.page-content {
  flex: 1;
  margin-left: 240px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 80px 16px 24px;
  }
}

/* ── Header ─────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

/* ── Stats bar ──────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  border-radius: 14px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.25);
}

.stat-icon  { font-size: 24px; }
.stat-value { font-size: 22px; font-weight: 700; line-height: 1; }
.stat-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }

/* ── Toast ──────────────────────────────────────────────────── */
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  &--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  &--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover { opacity: 1; background: rgba(0,0,0,0.06); }
}

/* ── Panneau ─────────────────────────────────────────────────── */
.table-panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(109, 40, 217, 0.07);
  overflow: hidden;
}

/* ── Barre d'actions ────────────────────────────────────────── */
.action-bar {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ebff;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &--primary {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    box-shadow: 0 3px 10px rgba(109, 40, 217, 0.3);
    &:hover { opacity: 0.9; transform: translateY(-1px); }
  }

  &--secondary {
    background: #f5f3ff;
    color: #6d28d9;
    border: 1px solid #ddd6fe;
    &:hover:not([disabled]) { background: #ede9fe; }
    &[disabled] { opacity: 0.45; cursor: not-allowed; }
  }
}

/* ── Loader ──────────────────────────────────────────────────── */
.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  color: #7c3aed;
  font-size: 14px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ede9fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tableau ─────────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }

.tiers-table {
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background: #faf9ff;
    border-bottom: 1px solid #ede9fe;
  }

  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #8b5cf6;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  tbody tr {
    border-bottom: 1px solid #f5f3ff;
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: #faf9ff; }
    &:last-child { border-bottom: none; }

    &.selected {
      background: #f5f3ff;
      td { color: #4c1d95; }
    }
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #374151;
    vertical-align: middle;
  }
}

/* ── Cellules spécifiques ────────────────────────────────────── */
.td-avatar { width: 52px; }

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.td-name {
  display: table-cell;
  .tier-name { display: block; font-weight: 600; color: #1e1b4b; }
  .tier-type { display: block; font-size: 12px; color: #9ca3af; margin-top: 2px; }
}

/* ── Comptes bancaires — tous les comptes empilés ─────────────── */
.td-bank {
  vertical-align: middle;
  min-width: 180px;
}

.bank-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px 8px;
  border-radius: 7px;
  transition: background 0.12s;

  /* Séparateur visuel entre deux comptes */
  &--separator {
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px dashed #e9e5f5;
  }

  &:hover {
    background: #f5f3ff;
  }
}

.bank-name {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #1e1b4b;
}

.bank-rib {
  display: block;
  font-size: 11px;
  color: #7c3aed;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  margin-top: 1px;
}

.no-data { color: #d1d5db; }

.link-btn {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
}

/* ── État vide ───────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #9ca3af;
  font-size: 14px;
}

/* ── Transitions ─────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }
</style>