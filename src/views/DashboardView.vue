<template>
  <div class="dashboard">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <TraityLogo :size="28" show-text />
      </div>
      <nav class="sidebar-nav">
        <a class="nav-item active">
          <span class="nav-icon">🏠</span> Tableau de bord
        </a>
        <a class="nav-item">
          <span class="nav-icon">📄</span> Traites
        </a>
        <a class="nav-item">
          <span class="nav-icon">💰</span> Trésorerie
        </a>
        <a class="nav-item">
          <span class="nav-icon">🏦</span> Banques
        </a>
        <a class="nav-item">
          <span class="nav-icon">👥</span> Tiers
        </a>
        <a class="nav-item">
          <span class="nav-icon">⚙️</span> Paramètres
        </a>
      </nav>
      <button class="logout-btn" @click="logout">
        <span>🚪</span> Déconnexion
      </button>
    </aside>

    <!-- Contenu principal -->
    <main class="main-content">

      <!-- Header -->
      <div class="top-bar">
        <div>
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-sub">Bonjour, {{ user?.prenom }} {{ user?.nom }} 👋</p>
        </div>
        <div class="user-badge">
          {{ user?.prenom?.charAt(0) }}{{ user?.nom?.charAt(0) }}
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon purple">📄</div>
          <div>
            <p class="kpi-label">Traites totales</p>
            <p class="kpi-value">1,284</p>
          </div>
          <span class="kpi-badge up">+18%</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">✅</div>
          <div>
            <p class="kpi-label">Traites payées</p>
            <p class="kpi-value">847</p>
          </div>
          <span class="kpi-badge up">+12%</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon red">❌</div>
          <div>
            <p class="kpi-label">Traites impayées</p>
            <p class="kpi-value">156</p>
          </div>
          <span class="kpi-badge down">+3%</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue">💰</div>
          <div>
            <p class="kpi-label">Trésorerie</p>
            <p class="kpi-value">842.5k DT</p>
          </div>
          <span class="kpi-badge up">+62%</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange">⏳</div>
          <div>
            <p class="kpi-label">En attente</p>
            <p class="kpi-value">281</p>
          </div>
          <span class="kpi-badge neutral">0%</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon pink">📅</div>
          <div>
            <p class="kpi-label">Échéances ce mois</p>
            <p class="kpi-value">43</p>
          </div>
          <span class="kpi-badge up">+8%</span>
        </div>
      </div>

      <!-- Tableau traites récentes -->
      <div class="table-card">
        <div class="table-header">
          <h2>Traites récentes</h2>
          <button class="btn-voir">Voir tout →</button>
        </div>
        <table class="traite-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Tiers</th>
              <th>Montant</th>
              <th>Échéance</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in traites" :key="t.ref">
              <td class="ref">{{ t.ref }}</td>
              <td>{{ t.tiers }}</td>
              <td class="montant">{{ t.montant }}</td>
              <td>{{ t.echeance }}</td>
              <td>
                <span :class="['badge-statut', t.statut]">
                  {{ t.statut === 'payee' ? 'Payée' : t.statut === 'impayee' ? 'Impayée' : 'En attente' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>
  </div>
</template>

<!-- ✅ UN SEUL script setup -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'

const authStore = useAuthStore()
const { logout } = useAuth()
const user = authStore.user

const traites = [
  { ref: 'TRT-001', tiers: 'Société ICS Sfax',  montant: '12,500 DT', echeance: '30/04/2026', statut: 'payee'      },
  { ref: 'TRT-002', tiers: 'STEG Tunis',         montant: '8,200 DT',  echeance: '15/05/2026', statut: 'en-attente' },
  { ref: 'TRT-003', tiers: 'Banque Zitouna',     montant: '25,000 DT', echeance: '01/05/2026', statut: 'impayee'    },
  { ref: 'TRT-004', tiers: 'Clients Divers',     montant: '4,750 DT',  echeance: '20/05/2026', statut: 'payee'      },
  { ref: 'TRT-005', tiers: 'Fournisseur Alpha',  montant: '18,300 DT', echeance: '10/06/2026', statut: 'en-attente' },
]
</script>



<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
  background: #f5f3ff;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-logo {
  margin-bottom: 36px;
  :deep(.traity-name) { color: #fff ; }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  color: rgba(255,255,255,0.75);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover { background: rgba(255,255,255,0.12); color: #fff; }
  &.active { background: rgba(255,255,255,0.2); color: #fff; font-weight: 600; }
  .nav-icon { font-size: 16px; }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.2); }
}

/* Main */
.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 32px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #4c1d95;
}

.page-sub {
  font-size: 13px;
  color: #8b5cf6;
  margin-top: 2px;
}

.user-badge {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.kpi-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(109, 40, 217, 0.08);
  border: 1px solid #ede9fe;
}

.kpi-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;

  &.purple { background: #ede9fe; }
  &.green  { background: #d1fae5; }
  &.red    { background: #fee2e2; }
  &.blue   { background: #dbeafe; }
  &.orange { background: #ffedd5; }
  &.pink   { background: #fce7f3; }
}

.kpi-label {
  font-size: 12px;
  color: #8b5cf6;
  margin-bottom: 2px;
}

.kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: #4c1d95;
}

.kpi-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  padding: 3px 8px;

  &.up      { color: #065f46; background: #d1fae5; }
  &.down    { color: #991b1b; background: #fee2e2; }
  &.neutral { color: #6b7280; background: #f3f4f6; }
}

/* Table */
.table-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(109, 40, 217, 0.08);
  border: 1px solid #ede9fe;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 { font-size: 16px; font-weight: 600; color: #4c1d95; }
}

.btn-voir {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  &:hover { text-decoration: underline; }
}

.traite-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    padding: 10px 12px;
    color: #8b5cf6;
    font-weight: 500;
    border-bottom: 1px solid #ede9fe;
    font-size: 12px;
  }

  td {
    padding: 12px 12px;
    color: #374151;
    border-bottom: 0.5px solid #f5f3ff;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf5ff; }
}

.ref { color: #7c3aed; font-weight: 600; }
.montant { font-weight: 600; color: #4c1d95; }

.badge-statut {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;

  &.payee      { background: #d1fae5; color: #065f46; }
  &.impayee    { background: #fee2e2; color: #991b1b; }
  &.en-attente { background: #fef3c7; color: #92400e; }
}
</style>
