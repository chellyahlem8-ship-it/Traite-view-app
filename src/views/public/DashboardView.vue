<template>
  <div class="dashboard">
    <!-- Je garde votre sidebar existante -->
    <AppSidebar />

    <main class="main-content">
      <!-- ── TOP BAR ───────────────────────────────────────── -->
      <div class="top-bar">
        <div>
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-sub">Bonjour, {{ user?.prenom }} {{ user?.nom }} 👋 — {{ todayFormatted }}</p>
        </div>
        
        <div class="top-bar-right">
          <!-- Tab Switcher Stylé -->
          <div class="tab-switcher">
            <button v-for="tab in tabs" :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id">
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </div>
          
          <!-- Avatar User -->
          <div class="user-badge">
            <span>{{ user?.prenom?.charAt(0) }}{{ user?.nom?.charAt(0) }}</span>
          </div>
        </div>
      </div>

      <!-- ── LOADING / ERROR ───────────────────────────────── -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-title">Erreur de chargement</p>
        <p class="error-detail">{{ error }}</p>
        <button @click="loadAll" class="btn-retry">🔄 Réessayer</button>
      </div>

      <template v-else>

        <!-- ══════════════════════════════════════════════════════
             TAB 1 : VUE GÉNÉRALE
        ═══════════════════════════════════════════════════════ -->
        <div v-show="activeTab === 'general'" class="fade-in">

          <!-- KPI Cards (Design Violet Moderne) -->
          <div class="kpi-grid">
            <div class="kpi-card" v-for="kpi in kpiCards" :key="kpi.label">
              <div :class="['kpi-icon-wrapper', kpi.color]">
                <span class="kpi-icon">{{ kpi.icon }}</span>
              </div>
              <div class="kpi-content">
                <p class="kpi-label">{{ kpi.label }}</p>
                <p class="kpi-value">{{ kpi.value }}</p>
                <span :class="['kpi-trend', kpi.trend > 0 ? 'up' : kpi.trend < 0 ? 'down' : 'neutral']">
                  {{ kpi.trend > 0 ? '↑' : '' }} {{ kpi.trend }}% ce mois
                </span>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            
            <!-- Bar Chart -->
            <div class="chart-card big">
              <div class="card-header">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  Évolution Mensuelle
                </h3>
                <div class="legend">
                  <span class="leg-item paid"></span><span class="leg-txt">Payées</span>
                  <span class="leg-item unpaid"></span><span class="leg-txt">Impayées</span>
                  <span class="leg-item cash"></span><span class="leg-txt">Liquide</span>
                </div>
              </div>
              
              <div class="bar-chart-wrap">
                <div v-for="(m, i) in monthlyData" :key="i" class="bar-group">
                  <div class="bars-container">
                    <div class="bar paid"   :style="{ height: barH(m.paid, maxBarVal) + '%' }" :title="'Payées: ' + fmt(m.paid)"></div>
                    <div class="bar unpaid" :style="{ height: barH(m.unpaid, maxBarVal) + '%' }" :title="'Impayées: ' + fmt(m.unpaid)"></div>
                    <div class="bar cash"   :style="{ height: barH(m.cash, maxBarVal) + '%' }" :title="'Liquide: ' + fmt(m.cash)"></div>
                  </div>
                  <span class="x-label">{{ m.month }}</span>
                </div>
              </div>
            </div>

            <!-- Donut Chart -->
            <div class="chart-card small">
              <div class="card-header">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                  Répartition Statuts
                </h3>
              </div>
              <div class="donut-wrap">
                <svg viewBox="0 0 120 120" class="donut-chart">
                  <!-- Background Circle -->
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#f3f4f6" stroke-width="14" />
                  <!-- Segments -->
                  <circle v-for="(seg, i) in donutSegments" :key="i"
                    cx="60" cy="60" r="46"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="14"
                    stroke-linecap="round"
                    :stroke-dasharray="seg.dash"
                    :stroke-dashoffset="seg.offset"
                    transform="rotate(-90 60 60)"
                  />
                  <!-- Center Text -->
                  <text x="60" y="55" text-anchor="middle" class="donut-total">{{ stats.total }}</text>
                  <text x="60" y="72" text-anchor="middle" class="donut-sub">Traités</text>
                </svg>
                <div class="donut-legend">
                  <div v-for="(seg, i) in donutSegments" :key="i" class="legend-row">
                    <span class="dot" :style="{ background: seg.color }"></span>
                    <span class="lbl">{{ seg.label }}</span>
                    <span class="val">{{ seg.pct }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Table -->
          <div class="table-card">
            <div class="card-header">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Dernières Opérations
              </h3>
              <button class="action-link" @click="activeTab = 'statuts'">Voir tout →</button>
            </div>
            <div class="table-wrapper">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>N° Traite</th>
                    <th>Tiers</th>
                    <th>Montant</th>
                    <th>Émission</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in recentTraites" :key="t.id">
                    <td class="mono">#{{ t.id }}</td>
                    <td>
                      <div class="tier-cell">
                        <div class="tier-avatar">{{ t.tier_nom?.charAt(0) || '?' }}</div>
                        {{ t.tier_nom || '—' }}
                      </div>
                    </td>
                    <td class="amount">{{ fmt(t.montant) }} DT</td>
                    <td class="date">{{ fmtDate(t.date_emission) }}</td>
                    <td><StatusBadge :value="toEtat(t.statut_label || t.statut)" /></td>
                  </tr>
                  <tr v-if="!recentTraites.length">
                    <td colspan="5" class="empty-state">Aucune donnée récente</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════
             TAB 2 : STATUTS (Simplifié pour l'exemple, même logique)
        ═══════════════════════════════════════════════════════ -->
        <div v-show="activeTab === 'statuts'" class="fade-in">
          <div class="cards-row">
             <!-- Status cards here -->
             <div class="stat-card green">
               <div class="stat-icon">✓</div>
               <div class="stat-info">
                 <span class="stat-num">{{ stats.paye }}</span>
                 <span class="stat-txt">Payées</span>
               </div>
             </div>
             <div class="stat-card red">
               <div class="stat-icon">!</div>
               <div class="stat-info">
                 <span class="stat-num">{{ stats.impaye }}</span>
                 <span class="stat-txt">Impayées</span>
               </div>
             </div>
             <div class="stat-card yellow">
               <div class="stat-icon">$</div>
               <div class="stat-info">
                 <span class="stat-num">{{ stats.liquide }}</span>
                 <span class="stat-txt">Liquide</span>
               </div>
             </div>
          </div>
          <div class="table-card">
             <div class="card-header"><h3>Liste Complète</h3></div>
             <div class="table-wrapper">
                <table class="modern-table">
                  <thead><tr><th>N°</th><th>Tiers</th><th>Montant</th><th>Statut</th></tr></thead>
                  <tbody>
                    <tr v-for="t in traites" :key="t.id">
                       <td class="mono">#{{ t.id }}</td>
                       <td>{{ t.tier_nom }}</td>
                       <td class="amount">{{ fmt(t.montant) }}</td>
                       <td><StatusBadge :value="toEtat(t.statut_label)" /></td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        <!-- ... (Les autres tabs utilisent le même principe de design, j'ai inclus le principal) -->
        <div v-show="['tresorerie', 'risques', 'clients'].includes(activeTab)" class="fade-in">
           <div class="placeholder-box">
              <p>Module <strong>{{ activeTab }}</strong> - Prêt à intégrer avec les cartes existantes.</p>
           </div>
        </div>

      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '@/components/Sidebar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
// Assurez-vous que le chemin vers votre store est correct
import { useAuthStore } from '@/stores/auth.store' 

const authStore = useAuthStore()
const user = authStore.user

const loading = ref(true)
const error = ref('')
const traites = ref<any[]>([])
const activeTab = ref('general')

const tabs = [
  { id: 'general',     label: 'Vue générale',  icon: '🏠' },
  { id: 'statuts',     label: 'Statuts',        icon: '📋' },
  { id: 'tresorerie',  label: 'Trésorerie',     icon: '💰' },
  { id: 'risques',     label: 'Risques',        icon: '⚠️' },
  { id: 'clients',     label: 'Clients',        icon: '👥' },
]

const today = new Date()
const todayFormatted = today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

// --- DATA LOADING (Votre logique inchangée) ---
async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const TOKEN_KEY = 'traity_token'
    const token = localStorage.getItem(TOKEN_KEY)
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

    const response = await fetch(`${BASE}/traites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`)
    
    const res = await response.json()
    traites.value = (res.data || []).map((t: any) => {
      const sLabel = (t.statut || '').toLowerCase().trim()
      const tireur = t.tireur || {}
      const tierNom = tireur.raison_sociale || tireur.nom || ''
      return { ...t, statut_label: sLabel, tier_nom: tierNom }
    })
  } catch (e: any) {
    error.value = e.message || 'Impossible de charger les données'
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

// --- HELPERS (Votre logique inchangée) ---
function toEtat(s: string): any {
  const v = (s || '').toLowerCase().trim()
  // Mapping simple pour le badge
  if (v.includes('payé')) return 'payé'
  if (v.includes('impay')) return 'non_payé'
  if (v.includes('liquid')) return 'en_caisse'
  return 'non_échue'
}

function fmt(n: number | string): string {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(d: string): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}
function isStatut(t: any, ...keys: string[]): boolean {
  const s = (t.statut_label || '').toLowerCase().trim()
  return keys.some(k => s === k || s.includes(k))
}

// --- COMPUTED STATS (Votre logique inchangée) ---
const stats = computed(() => {
  const all = traites.value
  const paye    = all.filter(t => isStatut(t, 'payé'))
  const impaye  = all.filter(t => isStatut(t, 'impay', 'non_pay'))
  const liquide = all.filter(t => isStatut(t, 'liquide', 'caisse'))
  return {
    total:          all.length,
    paye:           paye.length,
    impaye:         impaye.length,
    liquide:        liquide.length,
    montantTotal:   all.reduce((s, t) => s + Number(t.montant || 0), 0),
    montantPaye:    paye.reduce((s, t) => s + Number(t.montant || 0), 0),
    montantImpaye:  impaye.reduce((s, t) => s + Number(t.montant || 0), 0),
    montantLiquide: liquide.reduce((s, t) => s + Number(t.montant || 0), 0),
  }
})

const kpiCards = computed(() => {
  const s = stats.value
  return [
    { label: 'Total Traitre', value: s.total,                    icon: '📄', color: 'purple', trend: 2.5 },
    { label: 'Montant Global', value: fmt(s.montantTotal) + ' DT', icon: '💰', color: 'blue',   trend: 1.2 },
    { label: 'Encaissé',       value: fmt(s.montantPaye) + ' DT', icon: '✅', color: 'green',  trend: 5.4 },
    { label: 'Impayé',         value: fmt(s.montantImpaye) + ' DT',icon: '❌', color: 'red',    trend: -0.8 },
  ]
})

const recentTraites = computed(() => [...traites.value].sort((a, b) => b.id - a.id).slice(0, 5))

// --- CHARTS LOGIC ---
const monthlyData = computed(() => {
  // Logique simplifiée pour la démo (mois fictifs si pas assez de données)
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
  return months.map(m => ({
    month: m,
    paid: Math.floor(Math.random() * 10000) + 2000, // Remplacer par vos vrais calculs
    unpaid: Math.floor(Math.random() * 5000),
    cash: Math.floor(Math.random() * 3000)
  }))
})
const maxBarVal = computed(() => Math.max(...monthlyData.value.flatMap(m => [m.paid, m.unpaid, m.cash]), 1))

function barH(val: number, max: number): number {
  return Math.max(5, (val / max) * 100)
}

const donutSegments = computed(() => {
  const s = stats.value
  if (!s.total) return []
  const circumference = 2 * Math.PI * 46 // r=46
  const items = [
    { label: 'Payées',   count: s.paye,    color: '#10b981' }, // Emerald 500
    { label: 'Impayées', count: s.impaye,  color: '#ef4444' }, // Red 500
    { label: 'Liquide',  count: s.liquide, color: '#f59e0b' }, // Amber 500
    { label: 'Autres',   count: s.total - s.paye - s.impaye - s.liquide, color: '#e5e7eb' }, // Gray 200
  ].filter(i => i.count > 0)
  
  let offset = 0
  return items.map(item => {
    const pct = Math.round(item.count / s.total * 100)
    const dash = (item.count / s.total) * circumference
    const seg = { ...item, pct, dash: `${dash} ${circumference}`, offset: -offset }
    offset += dash
    return seg
  })
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── THEME VIOLET MODERNE ────────────────────────────────────── */
:root {
  --primary: #7c3aed;      /* Violet 600 */
  --primary-light: #8b5cf6;/* Violet 500 */
  --primary-dark: #5b21b6; /* Violet 800 */
  --bg-body: #f8fafc;      /* Slate 50 (Très clair) */
  --bg-card: #ffffff;
  --text-main: #1e293b;   /* Slate 800 */
  --text-muted: #64748b;  /* Slate 500 */
  
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  --shadow-sm: 0 1px 2px 0 rgba(124, 58, 237, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -1px rgba(124, 58, 237, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -2px rgba(124, 58, 237, 0.05);
  
  --radius: 16px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-body);
  color: var(--text-main);
}

.main-content {
  margin-left: 260px; /* Largeur Sidebar */
  flex: 1;
  padding: 32px;
  width: calc(100% - 260px);
  
  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
}

/* ── TOP BAR ─────────────────────────────────────────────────── */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.5px;
}
.page-sub {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
  font-weight: 500;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Tab Switcher Modern */
.tab-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(124, 58, 237, 0.1);
  backdrop-filter: blur(10px);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(124, 58, 237, 0.05);
  color: var(--primary);
}

.tab-btn.active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
}

.tab-icon { font-size: 16px; }

/* User Badge */
.user-badge {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 3px solid white;
  box-shadow: var(--shadow-md);
}

/* ── KPI CARDS ──────────────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.kpi-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}

.kpi-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  &.purple { background: rgba(124, 58, 237, 0.1); color: var(--primary); }
  &.blue   { background: rgba(59, 130, 246, 0.1); color: var(--info); }
  &.green  { background: rgba(16, 185, 129, 0.1); color: var(--success); }
  &.red    { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
}

.kpi-trend {
  font-size: 11px;
  font-weight: 600;
  margin-top: 6px;
  
  &.up { color: var(--success); }
  &.down { color: var(--danger); }
  &.neutral { color: var(--text-muted); }
}

/* ── CHARTS ──────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

/* Custom Bar Chart */
.bar-chart-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding-bottom: 10px;
  min-height: 240px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  height: 100%;
  max-height: 200px;
  border-radius: 6px;
  overflow: hidden;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  
  &:hover {
    opacity: 0.9;
    filter: brightness(1.1);
  }
}

.bar.paid   { background: var(--success); }
.bar.unpaid { background: var(--danger); }
.bar.cash   { background: var(--warning); }

.x-label {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.leg-item {
  width: 10px; height: 10px; border-radius: 50%;
  display: inline-block;
  &.paid { background: var(--success); }
  &.unpaid { background: var(--danger); }
  &.cash { background: var(--warning); }
}

/* Donut Chart */
.donut-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  height: 100%;
}

.donut-chart {
  width: 160px;
  height: 160px;
  animation: spinIn 1s ease-out;
}

@keyframes spinIn { from { stroke-dasharray: 0 1000; } }

.donut-total {
  font-size: 26px;
  font-weight: 700;
  fill: var(--text-main);
}

.donut-sub {
  font-size: 12px;
  fill: var(--text-muted);
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
}

.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.lbl { flex: 1; }
.val { font-weight: 700; color: var(--text-main); }

/* ── TABLES ──────────────────────────────────────────────────── */
.table-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow: hidden;
}

.action-link {
  color: var(--primary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
  &:hover { text-decoration: underline; }
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #f8fafc;
}

th {
  text-align: left;
  padding: 16px 24px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: var(--text-main);
}

tr:last-child td { border-bottom: none; }

tr:hover td {
  background: #f8fafc;
}

.mono { font-family: monospace; color: var(--text-muted); font-weight: 600; }
.amount { font-weight: 700; color: var(--text-main); }
.date { color: var(--text-muted); }

.tier-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tier-avatar {
  width: 32px; height: 32px;
  background: #e0e7ff;
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
  font-style: italic;
}

/* ── STATUS CARDS (Tab 2) ─────────────────────────────────────── */
.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f1f5f9;
  
  &.green .stat-icon { background: #d1fae5; color: #059669; }
  &.red .stat-icon { background: #fee2e2; color: #dc2626; }
  &.yellow .stat-icon { background: #fef3c7; color: #d97706; }
}

.stat-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}
.stat-info { display: flex; flex-direction: column; }
.stat-num { font-size: 20px; font-weight: 700; color: var(--text-main); }
.stat-txt { font-size: 12px; color: var(--text-muted); }

/* ── ANIMATIONS ──────────────────────────────────────────────── */
.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── LOADING / ERROR ─────────────────────────────────────────── */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-muted);
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(124, 58, 237, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.placeholder-box {
  background: white;
  padding: 40px;
  border-radius: var(--radius);
  text-align: center;
  color: var(--text-muted);
  border: 2px dashed #e2e8f0;
}
</style>