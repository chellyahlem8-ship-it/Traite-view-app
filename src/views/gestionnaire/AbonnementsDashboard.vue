<template>
  <div class="page-content">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Abonnements</h1>
        <p class="page-subtitle">Vue d'ensemble &amp; analyses</p>
      </div>
      <div class="header-meta">
        <span class="last-update">Mis à jour {{ lastUpdate }}</span>
        <button
          class="btn btn--icon"
          :class="{ spinning: loading }"
          title="Rafraîchir"
          @click="refresh"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Toast ─────────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div v-if="toastMsg" :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']">
        <span>{{ toastMsg }}</span>
        <button class="toast-close" @click="toastMsg = null">✕</button>
      </div>
    </Transition>

    <!-- ── Loader global ───────────────────────────────────── -->
    <div v-if="loading && !abonnements.length" class="loader-wrapper">
      <div class="spinner" />
      <span>Chargement du tableau de bord…</span>
    </div>

    <template v-else>

      <!-- ── KPI Cards ──────────────────────────────────────── -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-card--total">
          <div class="kpi-icon-wrap kpi-icon-wrap--purple"><span class="kpi-icon">📋</span></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpis.total }}</div>
            <div class="kpi-label">Total abonnements</div>
          </div>
          <div class="kpi-trend kpi-trend--neutral">
            {{ kpis.totalNew > 0 ? `+${kpis.totalNew} ce mois` : 'Aucun ajout' }}
          </div>
        </div>

        <div class="kpi-card kpi-card--actif">
          <div class="kpi-icon-wrap kpi-icon-wrap--green"><span class="kpi-icon">✅</span></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpis.actifs }}</div>
            <div class="kpi-label">Actifs</div>
          </div>
          <div class="kpi-trend kpi-trend--up">
            {{ kpis.total > 0 ? Math.round((kpis.actifs / kpis.total) * 100) : 0 }}% du total
          </div>
        </div>

        <div class="kpi-card kpi-card--expire">
          <div class="kpi-icon-wrap kpi-icon-wrap--red"><span class="kpi-icon">⚠️</span></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpis.expires }}</div>
            <div class="kpi-label">Expirés</div>
          </div>
          <div class="kpi-trend kpi-trend--down">
            {{ kpis.total > 0 ? Math.round((kpis.expires / kpis.total) * 100) : 0 }}% du total
          </div>
        </div>

        <div class="kpi-card kpi-card--warning">
          <div class="kpi-icon-wrap kpi-icon-wrap--yellow"><span class="kpi-icon">🔔</span></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpis.expirantBientot }}</div>
            <div class="kpi-label">Expirent dans 30 j</div>
          </div>
          <div class="kpi-trend kpi-trend--warn">À renouveler</div>
        </div>

        <div class="kpi-card kpi-card--revenue">
          <div class="kpi-icon-wrap kpi-icon-wrap--purple"><span class="kpi-icon">💰</span></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatMoney(kpis.revenusMois) }} <small>DT</small></div>
            <div class="kpi-label">Revenus / mois (est.)</div>
          </div>
          <div class="kpi-trend kpi-trend--up">Basé sur tarifs actifs</div>
        </div>
      </div>

      <!-- ── Charts row 1 ───────────────────────────────────── -->
      <div class="charts-row">
        <div class="chart-card chart-card--lg">
          <div class="chart-header">
            <h3 class="chart-title">Évolution mensuelle</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot legend-dot--purple" />Actifs</span>
              <span class="legend-item"><span class="legend-dot legend-dot--red" />Expirés</span>
            </div>
          </div>
          <div class="chart-body"><canvas ref="canvasEvol" /></div>
        </div>

        <div class="chart-card chart-card--sm">
          <div class="chart-header">
            <h3 class="chart-title">Répartition par durée</h3>
          </div>
          <div class="chart-body chart-body--donut">
            <canvas ref="canvasDonut" />
            <div class="donut-center">
              <span class="donut-total">{{ kpis.total }}</span>
              <span class="donut-label">total</span>
            </div>
          </div>
          <div class="donut-legend">
            <div v-for="(item, i) in dureeStats" :key="i" class="donut-legend-item">
              <span class="legend-dot" :style="{ background: dureeColors[i] }" />
              <span class="donut-legend-label">{{ item.label }}</span>
              <span class="donut-legend-val">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Charts row 2 ───────────────────────────────────── -->
      <div class="charts-row charts-row--single">
        <div class="chart-card chart-card--full">
          <div class="chart-header">
            <h3 class="chart-title">Revenus mensuels estimés (DT)</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot legend-dot--purple" />Revenus</span>
              <span class="legend-item"><span class="legend-dot legend-dot--dashed" />Objectif</span>
            </div>
          </div>
          <div class="chart-body chart-body--bar"><canvas ref="canvasBar" /></div>
        </div>
      </div>

      <!-- ── Abonnements expirant bientôt ──────────────────── -->
      <div class="table-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-title-dot panel-title-dot--warn" />
            Abonnements expirant dans les 30 jours
          </h3>
          <span class="panel-badge">{{ expirantBientot.length }}</span>
        </div>

        <div v-if="expirantBientot.length === 0" class="empty-state">
          <span>🎉</span> Aucun abonnement n'expire dans les 30 prochains jours.
        </div>

        <div v-else class="table-wrapper">
          <table class="tiers-table">
            <thead>
              <tr>
                <th></th>
                <th>SOCIÉTÉ</th>
                <th>TARIF</th>
                <th>DURÉE</th>
                <th>DATE FIN</th>
                <th>JOURS RESTANTS</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ab in expirantBientot" :key="ab.idAbonnement">
                <td class="td-avatar">
                  <div class="avatar">{{ initiales(ab.societe?.raisonSociale ?? '?') }}</div>
                </td>
                <td class="td-name">
                  <span class="tier-name">{{ ab.societe?.raisonSociale ?? '—' }}</span>
                </td>
                <td><span class="badge badge--purple">{{ ab.tarif?.nom ?? '—' }}</span></td>
                <td><span class="badge badge--blue">{{ ab.duree }}</span></td>
                <td class="td-date">{{ formatDate(ab.dateFin) }}</td>
                <td>
                  <span :class="['badge', joursClass(ab)]">
                    {{ ab.joursRestants !== null ? ab.joursRestants + ' j' : '—' }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', ab.isActif ? 'badge--actif' : 'badge--expire']">
                    {{ ab.isActif ? 'Actif' : 'Expiré' }}
                  </span>
                </td>
                <td class="td-action">
                  <button class="link-btn" @click="goEdit(ab.idAbonnement)">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Récapitulatif par durée ────────────────────────── -->
      <div class="table-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-title-dot panel-title-dot--purple" />
            Récapitulatif par type de durée
          </h3>
        </div>
        <div class="recap-grid">
          <div v-for="item in dureeStats" :key="item.label" class="recap-card">
            <div class="recap-label">{{ item.label }}</div>
            <div class="recap-value">{{ item.count }}</div>
            <div class="recap-bar-wrap">
              <div
                class="recap-bar"
                :style="{
                  width: kpis.total > 0 ? (item.count / kpis.total * 100) + '%' : '0%',
                  background: dureeColors[dureeStats.indexOf(item)]
                }"
              />
            </div>
            <div class="recap-pct">
              {{ kpis.total > 0 ? Math.round(item.count / kpis.total * 100) : 0 }}%
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { useAbonnements } from '@/composables/useAbonnements'
import type { Abonnement } from '@/composables/useAbonnements'

Chart.register(...registerables)

const router = useRouter()
const { abonnements, loading, error, fetchAbonnements } = useAbonnements()

const toastMsg   = ref<string | null>(null)
const toastType  = ref<'success' | 'error'>('success')
const lastUpdate = ref<string>('')

function showToast(msg: string, type: 'success' | 'error' = 'success'): void {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = null }, 4000)
}

// ── KPIs ──────────────────────────────────────────────────────
const kpis = computed(() => {
  const list = abonnements.value
  const total            = list.length
  const actifs           = list.filter(a => a.isActif).length
  const expires          = list.filter(a => a.isExpire).length
  const expirantBientot  = list.filter(a => a.isActif && a.joursRestants !== null && a.joursRestants <= 30).length
  const revenusMois      = list.filter(a => a.isActif && a.tarif?.prix).reduce((sum, a) => sum + (a.tarif?.prix ?? 0), 0)
  const now   = new Date()
  const totalNew = list.filter(a => {
    const d = new Date(a.dateDebut)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  return { total, actifs, expires, expirantBientot, revenusMois, totalNew }
})

const expirantBientot = computed<Abonnement[]>(() =>
  abonnements.value
    .filter(a => a.isActif && a.joursRestants !== null && a.joursRestants <= 30)
    .sort((a, b) => (a.joursRestants ?? 999) - (b.joursRestants ?? 999))
)

const dureeColors = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']

const dureeStats = computed(() => {
  const map = new Map<string, number>()
  for (const a of abonnements.value) map.set(a.duree, (map.get(a.duree) ?? 0) + 1)
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }))
})

const evolutionData = computed(() => {
  const months: string[] = [], actifsByMonth: number[] = [], expiresByMonth: number[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toLocaleDateString('fr-FR', { month: 'short' }))
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    actifsByMonth.push(abonnements.value.filter(a => new Date(a.dateDebut) <= monthEnd && new Date(a.dateFin) >= d).length)
    expiresByMonth.push(abonnements.value.filter(a => { const f = new Date(a.dateFin); return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear() && a.isExpire }).length)
  }
  return { months, actifsByMonth, expiresByMonth }
})

const revenusData = computed(() => {
  const now = new Date(), labels: string[] = [], values: number[] = [], objectifs: number[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }))
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const rev = abonnements.value.filter(a => new Date(a.dateDebut) <= monthEnd && new Date(a.dateFin) >= d && a.tarif?.prix).reduce((sum, a) => sum + (a.tarif?.prix ?? 0), 0)
    values.push(rev); objectifs.push(Math.round(rev * 1.1))
  }
  return { labels, values, objectifs }
})

const canvasEvol  = ref<HTMLCanvasElement | null>(null)
const canvasDonut = ref<HTMLCanvasElement | null>(null)
const canvasBar   = ref<HTMLCanvasElement | null>(null)
let chartEvol: Chart | null = null, chartDonut: Chart | null = null, chartBar: Chart | null = null

function destroyCharts(): void {
  chartEvol?.destroy();  chartEvol  = null
  chartDonut?.destroy(); chartDonut = null
  chartBar?.destroy();   chartBar   = null
}

function buildCharts(): void {
  destroyCharts()
  const { months, actifsByMonth, expiresByMonth } = evolutionData.value
  if (canvasEvol.value) {
    chartEvol = new Chart(canvasEvol.value, { type: 'line', data: { labels: months, datasets: [
      { label: 'Actifs', data: actifsByMonth, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,.08)', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#7c3aed', fill: true, tension: 0.4 },
      { label: 'Expirés', data: expiresByMonth, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.05)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#ef4444', fill: true, tension: 0.4, borderDash: [5,4] },
    ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 12 } } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'Outfit', size: 12 }, stepSize: 1 } } } } })
  }
  if (canvasDonut.value && dureeStats.value.length) {
    chartDonut = new Chart(canvasDonut.value, { type: 'doughnut', data: { labels: dureeStats.value.map(d => d.label), datasets: [{ data: dureeStats.value.map(d => d.count), backgroundColor: dureeColors.slice(0, dureeStats.value.length), borderWidth: 0, hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.raw}` } } } } })
  }
  const { labels, values, objectifs } = revenusData.value
  if (canvasBar.value) {
    chartBar = new Chart(canvasBar.value, { type: 'bar', data: { labels, datasets: [
      { label: 'Revenus', data: values, backgroundColor: 'rgba(124,58,237,.85)', borderRadius: 6, borderSkipped: false },
      { label: 'Objectif', data: objectifs, type: 'line', borderColor: '#a78bfa', borderWidth: 1.5, borderDash: [6,4], pointRadius: 0, fill: false, tension: 0 },
    ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 12 } } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'Outfit', size: 12 }, callback: (v) => Number(v).toLocaleString('fr-FR') + ' DT' } } } } })
  }
}

async function refresh(): Promise<void> {
  await fetchAbonnements()
  if (error.value) { showToast(error.value, 'error'); return }
  lastUpdate.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  await nextTick()
  buildCharts()
}

function goEdit(id: number): void { router.push({ name: 'EditAbonnementView', params: { id } }) }
function initiales(nom: string): string { return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }
function formatDate(dateStr: string): string { if (!dateStr) return '—'; return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
function joursClass(ab: Abonnement): string {
  if (ab.isExpire || ab.joursRestants === null) return 'badge--expire'
  if (ab.joursRestants <= 7) return 'badge--expire'
  if (ab.joursRestants <= 30) return 'badge--warning'
  return 'badge--actif'
}
function formatMoney(val: number): string { return val.toLocaleString('fr-FR') }


onMounted(async () => { await refresh() })
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
* { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

/* ── Page ────────────────────────────────────────────────────── */
.page-content {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;

  @media (max-width: 768px) { padding: 24px 16px; }
}

/* ── Header ─────────────────────────────────────────────────── */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.page-title   { font-size: 26px; font-weight: 700; color: #1e1b4b; margin: 0 0 2px; }
.page-subtitle{ font-size: 13px; color: #9ca3af; margin: 0; }
.header-meta  { display: flex; align-items: center; gap: 10px; }
.last-update  { font-size: 12px; color: #9ca3af; }

/* ── Toast ──────────────────────────────────────────────────── */
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 10px; font-size: 14px;
  font-weight: 500; max-width: 600px; box-shadow: 0 4px 16px rgba(0,0,0,.08);
  &--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  &--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
}
.toast-close { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: .6; font-size: 12px; padding: 2px 6px; border-radius: 4px; &:hover { opacity: 1; background: rgba(0,0,0,.06); } }

/* ── Loader ──────────────────────────────────────────────────── */
.loader-wrapper { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 80px 24px; color: #7c3aed; font-size: 14px; }
.spinner { width: 24px; height: 24px; border: 3px solid #ede9fe; border-top-color: #7c3aed; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Bouton refresh ──────────────────────────────────────────── */
.btn--icon {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid #ddd6fe; background: #f5f3ff; color: #7c3aed;
  cursor: pointer; transition: all .2s;
  &:hover { background: #ede9fe; }
  &.spinning svg { animation: spin .8s linear infinite; }
}

/* ── KPI Grid ────────────────────────────────────────────────── */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
.kpi-card {
  background: #fff; border-radius: 14px; padding: 18px 20px;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 2px 12px rgba(109,40,217,.06); border: .5px solid #ede9fe;
  position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-radius: 4px 0 0 4px; }
  &--total::before  { background: #7c3aed; }
  &--actif::before  { background: #10b981; }
  &--expire::before { background: #ef4444; }
  &--warning::before{ background: #f59e0b; }
  &--revenue::before{ background: #7c3aed; }
}
.kpi-icon-wrap { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; &--purple { background: #f5f3ff; } &--green { background: #d1fae5; } &--red { background: #fee2e2; } &--yellow { background: #fef9c3; } }
.kpi-value { font-size: 26px; font-weight: 700; color: #1e1b4b; line-height: 1; small { font-size: 13px; font-weight: 500; color: #6b7280; } }
.kpi-label { font-size: 12px; color: #9ca3af; margin-top: 4px; }
.kpi-trend { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; align-self: flex-start; &--up { background: #d1fae5; color: #065f46; } &--down { background: #fee2e2; color: #991b1b; } &--warn { background: #fef9c3; color: #854d0e; } &--neutral { background: #f5f3ff; color: #5b21b6; } }

/* ── Charts ──────────────────────────────────────────────────── */
.charts-row { display: grid; grid-template-columns: 1fr 320px; gap: 16px; &--single { grid-template-columns: 1fr; } @media (max-width: 1024px) { grid-template-columns: 1fr; } }
.chart-card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 2px 12px rgba(109,40,217,.06); border: .5px solid #ede9fe; display: flex; flex-direction: column; gap: 14px; }
.chart-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.chart-title  { font-size: 14px; font-weight: 600; color: #1e1b4b; margin: 0; }
.chart-legend { display: flex; gap: 14px; }
.legend-item  { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
.legend-dot   { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; &--purple { background: #7c3aed; } &--red { background: #ef4444; } &--dashed { background: #a78bfa; } }
.chart-body   { position: relative; height: 220px; canvas { width: 100% !important; height: 100% !important; } &--donut { height: 180px; display: flex; align-items: center; justify-content: center; } &--bar { height: 200px; } }
.donut-center { position: absolute; display: flex; flex-direction: column; align-items: center; pointer-events: none; }
.donut-total  { font-size: 26px; font-weight: 700; color: #1e1b4b; line-height: 1; }
.donut-label  { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.donut-legend { display: flex; flex-direction: column; gap: 8px; }
.donut-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #374151; }
.donut-legend-label { flex: 1; }
.donut-legend-val   { font-weight: 600; color: #1e1b4b; }

/* ── Table panel ─────────────────────────────────────────────── */
.table-panel { background: #fff; border-radius: 16px; box-shadow: 0 2px 16px rgba(109,40,217,.07); overflow: hidden; border: .5px solid #ede9fe; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #f5f3ff; }
.panel-title  { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1e1b4b; margin: 0; }
.panel-title-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; &--warn { background: #f59e0b; } &--purple { background: #7c3aed; } }
.panel-badge  { background: #f5f3ff; color: #7c3aed; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }

/* ── Table ───────────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }
.tiers-table {
  width: 100%; border-collapse: collapse;
  thead tr { background: #faf9ff; border-bottom: 1px solid #ede9fe; }
  th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #8b5cf6; letter-spacing: .08em; text-transform: uppercase; }
  tbody tr { border-bottom: 1px solid #f5f3ff; transition: background .15s; &:hover { background: #faf9ff; } &:last-child { border-bottom: none; } }
  td { padding: 14px 16px; font-size: 14px; color: #374151; vertical-align: middle; }
}
.td-avatar { width: 52px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.td-name .tier-name { display: block; font-weight: 600; color: #1e1b4b; }
.td-date { font-size: 13px; color: #6b7280; }
.td-action { white-space: nowrap; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; &--purple { background: #f5f3ff; color: #5b21b6; } &--blue { background: #e0f2fe; color: #0369a1; } &--actif { background: #dcfce7; color: #166534; } &--expire { background: #fee2e2; color: #991b1b; } &--warning { background: #fef9c3; color: #854d0e; } }
.link-btn { background: none; border: none; color: #7c3aed; font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; font-family: inherit; &:hover { text-decoration: underline; } }
.empty-state { text-align: center; padding: 40px 24px; color: #9ca3af; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }

/* ── Recap ───────────────────────────────────────────────────── */
.recap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1px; background: #f5f3ff; }
.recap-card { background: #fff; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
.recap-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: capitalize; }
.recap-value { font-size: 28px; font-weight: 700; color: #1e1b4b; line-height: 1; }
.recap-bar-wrap { height: 4px; background: #f5f3ff; border-radius: 2px; overflow: hidden; }
.recap-bar { height: 100%; border-radius: 2px; transition: width .6s ease; }
.recap-pct { font-size: 12px; color: #9ca3af; }

/* ── Transitions ─────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
</style>