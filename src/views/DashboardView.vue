<template>
  <div class="dashboard-root">
    <Sidebar />

    <main class="dash-main">

      <!-- ── Header ──────────────────────────────────────── -->
      <header class="dash-header">
        <div class="dash-header-left">
          <h1 class="dash-title"><span class="dash-title-icon">📊</span>Tableau de Bord</h1>
          <p class="dash-subtitle">Vue globale de vos traites clients &amp; fournisseurs</p>
        </div>
        <div class="dash-header-right">
          <div class="filter-group">
            <select v-model="filters.period" class="filter-select">
              <option value="all">Toutes les périodes</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
            <select v-model="filters.type" class="filter-select">
              <option value="all">Tous les types</option>
              <option value="client">Clients</option>
              <option value="fournisseur">Fournisseurs</option>
            </select>
          </div>
          <button class="toggle-dark" @click="darkMode = !darkMode" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
            <span v-if="darkMode">☀️</span><span v-else>🌙</span>
          </button>
        </div>
      </header>

      <!-- ── Erreur API ────────────────────────────────────── -->
      <div v-if="!apiOk && !loading" class="api-error">
        ⚠️ Impossible de contacter l'API. Vérifiez que le serveur Laravel est démarré.
      </div>

      <!-- ── Loading ──────────────────────────────────────── -->
      <div v-if="loading" class="dash-loading">
        <div class="spinner"></div>
        <span>Chargement des données…</span>
      </div>

      <template v-else-if="apiOk">

        <!-- ── KPI Cards ──────────────────────────────────── -->
        <section class="kpi-grid">
          <div class="kpi-card" v-for="kpi in kpiCards" :key="kpi.label">
            <div class="kpi-icon" :style="{ background: kpi.bg }">
              <span>{{ kpi.icon }}</span>
            </div>
            <div class="kpi-body">
              <p class="kpi-label">{{ kpi.label }}</p>
              <p class="kpi-value">{{ kpi.value }}</p>
              <p class="kpi-sub">{{ kpi.sub }}</p>
            </div>
          </div>
        </section>

        <!-- ── Charts ─────────────────────────────────────── -->
        <section class="charts-grid">

          <!-- 1. Répartition échéances -->
          <div class="chart-card chart-wide">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">📅 Répartition des Échéances</h3>
                <p class="chart-desc">Montants à encaisser (clients) vs à payer (fournisseurs) — traites non payées</p>
              </div>
              <div class="chart-toggle">
                <button :class="{ active: duePeriod === 'week' }"  @click="duePeriod = 'week'">Semaine</button>
                <button :class="{ active: duePeriod === 'month' }" @click="duePeriod = 'month'">Mois</button>
              </div>
            </div>
            <div class="chart-canvas-wrap"><canvas ref="dueDatesCanvas"></canvas></div>
          </div>

          <!-- 2. Donut statuts (LOGIQUE INTERACTIVE) -->
          <div class="chart-card chart-small">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">🥧 Répartition par Statut</h3>
                <p class="chart-desc">Statuts des {{ donutType === 'client' ? 'Clients' : 'Fournisseurs' }}</p>
              </div>
              <!-- BOUTON TOGGLE STYLE TOP ENTITIES -->
              <div class="chart-toggle">
                <button :class="{ active: donutType === 'client' }"      @click="donutType = 'client'">Clients</button>
                <button :class="{ active: donutType === 'fournisseur' }" @click="donutType = 'fournisseur'">Fourns</button>
              </div>
            </div>
            <div class="chart-canvas-wrap pie-wrap"><canvas ref="statusPieCanvas"></canvas></div>
            <div class="pie-legend">
              <div v-for="item in pieLegend" :key="item.label" class="pie-legend-item">
                <span class="pie-dot" :style="{ background: item.color }"></span>
                <span>{{ item.label }}</span>
                <span class="pie-count">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- 3. Top entités -->
          <div class="chart-card chart-medium">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">🏦 Top Entités</h3>
                <p class="chart-desc">Par montant total toutes traites confondues</p>
              </div>
              <div class="chart-toggle">
                <button :class="{ active: topType === 'client' }"      @click="topType = 'client'">Clients</button>
                <button :class="{ active: topType === 'fournisseur' }" @click="topType = 'fournisseur'">Fournisseurs</button>
              </div>
            </div>
            <div class="chart-canvas-wrap"><canvas ref="topEntitiesCanvas"></canvas></div>
          </div>

          <!-- 4. Prévision trésorerie -->
          <div class="chart-card chart-medium">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">📉 Trésorerie Réelle vs Prévisionnelle</h3>
                <p class="chart-desc">Réel = traites payées · Prévision = traites non payées à venir</p>
              </div>
            </div>
            <div class="chart-canvas-wrap"><canvas ref="forecastCanvas"></canvas></div>
          </div>

          <!-- 5. Heatmap -->
          <div class="chart-card chart-full">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">📆 Calendrier des Échéances</h3>
                <p class="chart-desc">Flux net journalier (traites non payées) — vert = encaissements / rouge = décaissements</p>
              </div>
              <div class="heatmap-legend">
                <span class="hm-dot" style="background:#fca5a5"></span> Décaissement
                <span class="hm-dot" style="background:#d1d5db; margin-left:12px"></span> Aucun
                <span class="hm-dot" style="background:#6ee7b7; margin-left:12px"></span> Encaissement
              </div>
            </div>
            <div class="heatmap-wrap">
              <div class="heatmap-months">
                <div v-for="(month, mi) in heatmapData" :key="mi" class="heatmap-month">
                  <p class="heatmap-month-label">{{ month.label }}</p>
                  <div class="heatmap-cells">
                    <div
                      v-for="(day, di) in month.days"
                      :key="di"
                      class="heatmap-cell"
                      :style="{ background: heatColor(day.net) }"
                      :title="`${day.date}: ${fmtAmt(day.net)} DT`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </template>

      <!-- Aucune traite -->
      <div v-else-if="!loading && traites.length === 0" class="empty-dash">
        <p>📄 Aucune traite trouvée. Commencez par en créer une.</p>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { Chart, registerables } from 'chart.js'
import { useTraiteData, isPaid, isNonEchue, isImpayee, isEnCaisse, type TraiteMapped } from '@/composables/useTraiteData'

Chart.register(...registerables)

const {
  traites, loading, error, apiOk, load,
  tresorerie, tresoreriePrev,
  byMonth, byWeek, topEntities, cashflowByDay, forecastData,
} = useTraiteData()

const darkMode  = ref(false)
const duePeriod = ref<'week' | 'month'>('month')
const topType   = ref<'client' | 'fournisseur'>('client')
const donutType = ref<'client' | 'fournisseur'>('client') // NOUVEAU: Toggle pour le Donut
const filters   = ref({ period: 'all', type: 'all' })

// Canvas refs
const dueDatesCanvas    = ref<HTMLCanvasElement | null>(null)
const statusPieCanvas   = ref<HTMLCanvasElement | null>(null)
const topEntitiesCanvas = ref<HTMLCanvasElement | null>(null)
const forecastCanvas    = ref<HTMLCanvasElement | null>(null)

let dueDatesChart:    Chart | null = null
let statusPieChart:   Chart | null = null
let topEntitiesChart: Chart | null = null
let forecastChart:    Chart | null = null

// ── Filtrage principal ─────────────────────────────────────────────────────
const filteredTraites = computed<TraiteMapped[]>(() => {
  let list = traites.value

  if (filters.value.type !== 'all') {
    list = list.filter(t => t.type_traite === filters.value.type)
  }

  if (filters.value.period !== 'all') {
    const now  = new Date()
    const from = new Date()
    if (filters.value.period === 'month')   from.setMonth(now.getMonth() - 1)
    if (filters.value.period === 'quarter') from.setMonth(now.getMonth() - 3)
    if (filters.value.period === 'year')    from.setFullYear(now.getFullYear() - 1)
    list = list.filter(t => new Date(t.date_echeance) >= from)
  }

  return list
})

const sum = (arr: TraiteMapped[]) => arr.reduce((s, t) => s + Number(t.montant || 0), 0)

// ── KPI Cards ──────────────────────────────────────────────────────────────
const kpiCards = computed(() => {
  const t     = filteredTraites.value
  const today = new Date().toISOString().split('T')[0]

  const payees    = t.filter(x => isPaid(x))        // Payée (fourn) + En caisse (client)
  const nonEchues = t.filter(x => isNonEchue(x))
  const impayees  = t.filter(x => isImpayee(x))

  const treso = payees.reduce((s, x) => {
    const m = Number(x.montant || 0)
    return s + (x.type_traite === 'client' ? m : -m)
  }, 0)

  return [
    {
      icon: '📄',
      label: 'Total Traites',
      value: String(t.length),
      sub: `${t.filter(x => x.type_traite === 'client').length} clients · ${t.filter(x => x.type_traite === 'fournisseur').length} fournisseurs`,
      bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    },
    {
      icon: '🏦',
      label: 'Trésorerie Réelle',
      value: fmtCurrency(Math.abs(treso)),
      sub: treso >= 0
        ? '▲ Encaissements clients > Décaissements fournisseurs'
        : '▼ Décaissements fournisseurs > Encaissements clients',
      bg: treso >= 0
        ? 'linear-gradient(135deg,#0891b2,#0e7490)'
        : 'linear-gradient(135deg,#dc2626,#b91c1c)',
    },
    {
      icon: '⏳',
      label: 'Non Échues',
      value: String(nonEchues.length),
      sub: fmtCurrency(sum(nonEchues)) + ' · en attente d\'échéance',
      bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    },
    {
      icon: '❌',
      label: 'Impayées',
      value: String(impayees.length),
      sub: fmtCurrency(sum(impayees)) + ' · à régulariser',
      bg: 'linear-gradient(135deg,#dc2626,#b91c1c)',
    },
  ]
})

// ── Pie / Donut — LOGIQUE INTERACTIVE (Toggle Client/Fourn) ─────────────
const pieLegend = computed(() => {
  const t = filteredTraites.value
  const result: { label: string; count: number; color: string }[] = []

  // Filtrer par le type sélectionné dans le toggle
  const typeList = t.filter(x => x.type_traite === donutType.value)

  if (donutType.value === 'client') {
    // LOGIQUE CLIENT : En caisse, Impayée, Non échue
    const enCaisse = typeList.filter(x => isEnCaisse(x))
    if (enCaisse.length > 0) result.push({ label: 'En caisse', count: enCaisse.length, color: '#059669' }) // Vert

    const impayees = typeList.filter(x => isImpayee(x))
    if (impayees.length > 0) result.push({ label: 'Impayée', count: impayees.length, color: '#dc2626' }) // Rouge

    const nonEchues = typeList.filter(x => !isEnCaisse(x) && !isImpayee(x))
    if (nonEchues.length > 0) result.push({ label: 'Non échue', count: nonEchues.length, color: '#2563eb' }) // Bleu

  } else {
    // LOGIQUE FOURNISSEUR : Payée, Impayée, Non échue
    const payees = typeList.filter(x => isPaid(x))
    if (payees.length > 0) result.push({ label: 'Payée', count: payees.length, color: '#059669' }) // Vert

    const impayees = typeList.filter(x => isImpayee(x))
    if (impayees.length > 0) result.push({ label: 'Impayée', count: impayees.length, color: '#dc2626' }) // Rouge

    const nonEchues = typeList.filter(x => !isPaid(x) && !isImpayee(x))
    if (nonEchues.length > 0) result.push({ label: 'Non échue', count: nonEchues.length, color: '#7c3aed' }) // Violet
  }

  return result
})

// ── Heatmap ────────────────────────────────────────────────────────────────
const heatmapData = computed(() => {
  const cfMap   = cashflowByDay()
  const months: { label: string; days: { date: string; net: number }[] }[] = []
  const today   = new Date()

  for (let m = -2; m <= 3; m++) {
    const d = new Date(today.getFullYear(), today.getMonth() + m, 1)
    const label      = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const days: { date: string; net: number }[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({ date: dateStr, net: cfMap[dateStr] ?? 0 })
    }
    months.push({ label, days })
  }
  return months
})

function heatColor(net: number): string {
  if (net > 0) {
    const i = Math.min(net / 5000, 1)
    return `rgba(16, ${Math.round(167 + i * 88)}, 93, ${0.3 + i * 0.7})`
  }
  if (net < 0) {
    const i = Math.min(Math.abs(net) / 5000, 1)
    return `rgba(220, 38, 38, ${0.2 + i * 0.7})`
  }
  return '#e5e7eb'
}

// ── Couleurs Chart ─────────────────────────────────────────────────────────
const PURPLE    = '#7c3aed'
const PURPLE_BG = 'rgba(124,58,237,0.15)'
const GREEN     = '#059669'
const GREEN_BG  = 'rgba(5,150,105,0.15)'

function chartDefaults() {
  return {
    color:     darkMode.value ? '#e5e7eb' : '#374151',
    gridColor: darkMode.value ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
  }
}

// ── Chart 1 : Répartition échéances ───────────────────────────────────────
function buildDueDatesChart(): void {
  if (!dueDatesCanvas.value) return
  dueDatesChart?.destroy()
  const { color, gridColor } = chartDefaults()
  const labels: string[] = []
  const clientData: number[] = []
  const fournData:  number[] = []

  if (duePeriod.value === 'month') {
    byMonth().forEach(m => {
      labels.push(m.m)
      clientData.push(m.client)
      fournData.push(m.fourn)
    })
  } else {
    byWeek().forEach(w => {
      labels.push(w.label)
      clientData.push(w.client)
      fournData.push(w.fourn)
    })
  }

  dueDatesChart = new Chart(dueDatesCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'À encaisser (clients)',
          data: clientData,
          backgroundColor: PURPLE_BG,
          borderColor: PURPLE,
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'À payer (fournisseurs)',
          data: fournData,
          backgroundColor: GREEN_BG,
          borderColor: GREEN,
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: 'easeOutQuart' },
      plugins: {
        legend: { labels: { color, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtAmt(ctx.parsed.y)} DT`,
          },
        },
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color } },
        y: {
          grid: { color: gridColor },
          ticks: { color, callback: v => fmtAmt(Number(v)) },
          beginAtZero: true,
        },
      },
    },
  })
}

// ── Chart 2 : Donut statuts (Dynamique avec toggle) ───────────────────────
function buildStatusPieChart(): void {
  if (!statusPieCanvas.value) return
  statusPieChart?.destroy()
  const legend = pieLegend.value
  if (legend.length === 0) return

  statusPieChart = new Chart(statusPieCanvas.value, {
    type: 'doughnut',
    data: {
      labels:   legend.map(l => l.label),
      datasets: [{
        data:            legend.map(l => l.count),
        backgroundColor: legend.map(l => l.color),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      animation: { duration: 800, easing: 'easeOutBack' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} traite${ctx.parsed > 1 ? 's' : ''}`,
          },
        },
      },
    },
  })
}

// ── Chart 3 : Top entités ─────────────────────────────────────────────────
function buildTopEntitiesChart(): void {
  if (!topEntitiesCanvas.value) return
  topEntitiesChart?.destroy()
  const { color, gridColor } = chartDefaults()
  const entities = topEntities(topType.value, 8)
  const col = topType.value === 'client' ? PURPLE : GREEN
  const bg  = topType.value === 'client' ? PURPLE_BG : GREEN_BG

  if (entities.length === 0) return

  topEntitiesChart = new Chart(topEntitiesCanvas.value, {
    type: 'bar',
    data: {
      labels:   entities.map(e => e.name),
      datasets: [{
        label: `Montant total (${topType.value})`,
        data:  entities.map(e => e.montant),
        backgroundColor: bg,
        borderColor: col,
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const e = entities[ctx.dataIndex]
              return ` ${fmtAmt(ctx.parsed.x)} DT · ${e.count} traite${e.count > 1 ? 's' : ''}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color, callback: v => fmtAmt(Number(v)) },
          beginAtZero: true,
        },
        y: { grid: { color: gridColor }, ticks: { color } },
      },
    },
  })
}

// ── Chart 4 : Prévision trésorerie ────────────────────────────────────────
function buildForecastChart(): void {
  if (!forecastCanvas.value) return
  forecastChart?.destroy()
  const { color, gridColor } = chartDefaults()
  const fd = forecastData.value

  if (fd.labels.length === 0) return

  forecastChart = new Chart(forecastCanvas.value, {
    type: 'line',
    data: {
      labels: fd.labels,
      datasets: [
        {
          label: 'Réel (payées)',
          data:  fd.reel as (number | null)[],
          borderColor: GREEN,
          backgroundColor: GREEN_BG,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: GREEN,
          borderWidth: 2.5,
          spanGaps: true,
        },
        {
          label: 'Prévisionnel (non payées)',
          data:  fd.prev as (number | null)[],
          borderColor: PURPLE,
          backgroundColor: PURPLE_BG,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: PURPLE,
          borderWidth: 2.5,
          borderDash: [6, 3],
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700 },
      plugins: {
        legend: { labels: { color, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtAmt(ctx.parsed.y ?? 0)} DT`,
          },
        },
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color } },
        y: {
          grid: { color: gridColor },
          ticks: { color, callback: v => fmtAmt(Number(v)) },
        },
      },
    },
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtAmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000)     return sign + (abs / 1_000).toFixed(1) + 'k'
  return sign + Math.round(abs).toString()
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  }).format(n)
}

function rebuildAll(): void {
  nextTick(() => {
    buildDueDatesChart()
    buildStatusPieChart()
    buildTopEntitiesChart()
    buildForecastChart()
  })
}

// ── Watchers ───────────────────────────────────────────────────────────────
watch([filters, darkMode, traites], rebuildAll, { deep: true })
watch(duePeriod, () => nextTick(buildDueDatesChart))
watch(topType,   () => nextTick(buildTopEntitiesChart))
watch(donutType, () => nextTick(buildStatusPieChart)) // NOUVEAU WATCHER

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await load()
  rebuildAll()
})

onUnmounted(() => {
  dueDatesChart?.destroy()
  statusPieChart?.destroy()
  topEntitiesChart?.destroy()
  forecastChart?.destroy()
})
</script>

<style scoped>
.dashboard-root {
  display: flex;
  min-height: 100vh;
  background: #f5f3ff;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.dash-main {
  flex: 1;
  margin-left: 240px;
  padding: 28px 32px;
  overflow-y: auto;
  min-width: 0;
}
@media (max-width: 768px) {
  .dash-main { margin-left: 0; padding: 80px 16px 24px; }
}

.api-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 14px;
  margin-bottom: 20px;
}

.dash-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 80px 24px; color: #7c3aed; font-size: 15px;
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid #ede9fe; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.dash-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 28px;
}
.dash-title {
  font-size: 1.5rem; font-weight: 700; color: #1e1b4b;
  margin: 0; display: flex; align-items: center; gap: 8px;
}
.dash-title-icon { font-size: 1.3rem; }
.dash-subtitle { margin: 4px 0 0; color: #6b7280; font-size: 0.87rem; }
.dash-header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filter-group { display: flex; gap: 8px; }
.filter-select {
  padding: 7px 12px; border-radius: 8px; border: 1.5px solid #ddd6fe;
  background: white; color: #374151; font-size: 0.85rem; cursor: pointer;
  outline: none; transition: border-color 0.2s;
}
.filter-select:hover { border-color: #7c3aed; }
.toggle-dark {
  width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #ddd6fe;
  background: white; cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
}
.toggle-dark:hover { background: #ede9fe; }

/* KPI */
.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
}
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .kpi-grid { grid-template-columns: 1fr; } }

.kpi-card {
  background: white; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 12px rgba(124,58,237,0.07); border: 1px solid #ede9fe;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(124,58,237,0.13); }
.kpi-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; flex-shrink: 0;
}
.kpi-body { min-width: 0; }
.kpi-label { font-size: 0.75rem; color: #6b7280; font-weight: 600; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-value { font-size: 1.3rem; font-weight: 700; color: #1e1b4b; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-sub   { font-size: 0.72rem; color: #9ca3af; margin: 0; }

/* Charts */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.chart-wide   { grid-column: span 2; }
.chart-small  { grid-column: span 1; }
.chart-medium { grid-column: span 1; min-width: 0; }
.chart-full   { grid-column: span 3; }

@media (max-width: 1100px) {
  .charts-grid { grid-template-columns: 1fr 1fr; }
  .chart-wide, .chart-small { grid-column: span 2; }
  .chart-full { grid-column: span 2; }
}
@media (max-width: 700px) {
  .charts-grid { grid-template-columns: 1fr; }
  .chart-wide, .chart-small, .chart-medium, .chart-full { grid-column: span 1; }
}

.chart-card {
  background: white; border-radius: 16px; padding: 20px 20px 16px;
  box-shadow: 0 2px 12px rgba(124,58,237,0.07); border: 1px solid #ede9fe;
  display: flex; flex-direction: column; gap: 14px; min-width: 0;
}
.chart-card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 8px;
}
.chart-title { font-size: 0.95rem; font-weight: 700; color: #1e1b4b; margin: 0; }
.chart-desc  { font-size: 0.75rem; color: #9ca3af; margin: 3px 0 0; }

.chart-toggle {
  display: flex; background: #f3f0ff; border-radius: 8px; padding: 3px; gap: 2px;
}
.chart-toggle button {
  padding: 4px 12px; border-radius: 6px; border: none; background: transparent;
  color: #6b7280; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.chart-toggle button.active { background: #7c3aed; color: white; box-shadow: 0 2px 8px rgba(124,58,237,0.3); }

.chart-canvas-wrap { height: 220px; position: relative; }
.pie-wrap { height: 170px; }

/* Légende donut — nombre de traites */
.pie-legend { display: flex; flex-direction: column; gap: 6px; }
.pie-legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #374151; }
.pie-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.pie-count { margin-left: auto; font-weight: 700; color: #1e1b4b; }

/* Heatmap */
.heatmap-legend { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #6b7280; }
.hm-dot { display: inline-block; width: 12px; height: 12px; border-radius: 3px; }
.heatmap-wrap { overflow-x: auto; }
.heatmap-months { display: flex; gap: 20px; padding-bottom: 4px; min-width: max-content; }
.heatmap-month { display: flex; flex-direction: column; gap: 6px; }
.heatmap-month-label { font-size: 0.75rem; color: #9ca3af; font-weight: 600; text-transform: uppercase; }
.heatmap-cells { display: grid; grid-template-columns: repeat(7, 14px); gap: 3px; }
.heatmap-cell { width: 14px; height: 14px; border-radius: 3px; cursor: pointer; transition: transform 0.15s; }
.heatmap-cell:hover { transform: scale(1.4); z-index: 1; }

.empty-dash {
  text-align: center; padding: 80px 24px; color: #9ca3af; font-size: 15px;
}
</style>