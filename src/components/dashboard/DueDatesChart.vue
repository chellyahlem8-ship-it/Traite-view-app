<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-group">
        <div class="dot dot-blue"></div>
        <h3>📅 Répartition des échéances</h3>
      </div>
      <div class="period-toggle">
        <button :class="['tog-btn', { active: period === 'month' }]" @click="period = 'month'">Mois</button>
        <button :class="['tog-btn', { active: period === 'week' }]" @click="period = 'week'">Semaine</button>
      </div>
    </div>

    <div v-if="loading" class="chart-placeholder">
      <div class="shimmer"></div>
    </div>
    <div v-else-if="!chartData.labels.length" class="empty-state">
      <div class="empty-icon">📊</div>
      <p>Aucune échéance à afficher</p>
    </div>
    <div v-else class="bar-wrap">
      <div class="y-axis">
        <span v-for="l in yLabels" :key="l" class="y-lbl">{{ fmtK(l) }}</span>
      </div>
      <div class="bars-area">
        <div class="grid-lines">
          <div v-for="l in yLabels" :key="l" class="grid-line"></div>
        </div>
        <div class="bars-row">
          <div v-for="(label, i) in chartData.labels" :key="i" class="bar-group">
            <div class="bars-pair">
              <div
                class="bar bar-client"
                :style="{ height: pct(chartData.clients[i]) + '%' }"
                :title="`Clients: ${fmt(chartData.clients[i])} DT`"
              ></div>
              <div
                class="bar bar-fourn"
                :style="{ height: pct(chartData.fournisseurs[i]) + '%' }"
                :title="`Fournisseurs: ${fmt(chartData.fournisseurs[i])} DT`"
              ></div>
            </div>
            <span class="x-lbl">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-legend">
      <span class="leg"><span class="leg-dot" style="background:#6366f1"></span>Clients (encaisser)</span>
      <span class="leg"><span class="leg-dot" style="background:#f43f5e"></span>Fournisseurs (payer)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  traites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const period = ref('month')

function normalizeStatut(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}
function isStatutPaid(t) {
  const s = normalizeStatut(t.statut_label || t.statut || '')
  return ['paye','payer','en_caisse','caisse','liquide'].some(k => s.includes(k))
}
function formatPeriodLabel(key, p) {
  if (p === 'week') {
    const d = new Date(key)
    return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
  }
  const [y, m] = key.split('-')
  return new Date(+y, +m - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

const chartData = computed(() => {
  const buckets = {}
  for (const t of props.traites) {
    const d = new Date(t.date_echeance)
    if (isNaN(d)) continue
    let key
    if (period.value === 'week') {
      const s = new Date(d); s.setDate(d.getDate() - d.getDay())
      key = s.toISOString().split('T')[0]
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    if (!buckets[key]) buckets[key] = { client: 0, fournisseur: 0 }
    if (!isStatutPaid(t)) {
      const amt = Number(t.montant) || 0
      if (t.type_traite === 'client') buckets[key].client += amt
      else if (t.type_traite === 'fournisseur') buckets[key].fournisseur += amt
    }
  }
  const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
  return {
    labels: sorted.map(([k]) => formatPeriodLabel(k, period.value)),
    clients: sorted.map(([, v]) => Math.round(v.client)),
    fournisseurs: sorted.map(([, v]) => Math.round(v.fournisseur)),
  }
})

const maxVal = computed(() => Math.max(...chartData.value.clients, ...chartData.value.fournisseurs, 1))
const yLabels = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => Math.round(maxVal.value * (steps - i) / steps))
})

function pct(v) { return Math.max(2, (v / maxVal.value) * 88) }
function fmt(n) { return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
function fmtK(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
  return String(n)
}
</script>

<style scoped>
.chart-card {
  background: var(--card-bg, #1e2235);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chart-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.title-group { display: flex; align-items: center; gap: 8px; }
.title-group h3 { font-size: 15px; font-weight: 600; color: var(--text, #e2e8f0); margin: 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-blue { background: #6366f1; }
.period-toggle { display: flex; gap: 4px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 3px; }
.tog-btn { padding: 4px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; background: transparent; color: var(--text-m, #94a3b8); transition: all 0.2s; }
.tog-btn.active { background: #6366f1; color: #fff; }
.chart-placeholder { height: 200px; }
.shimmer { width: 100%; height: 100%; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.empty-state { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-m, #94a3b8); }
.empty-icon { font-size: 32px; opacity: 0.4; }
.empty-state p { font-size: 13px; margin: 0; }
.bar-wrap { display: flex; gap: 8px; height: 200px; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding-bottom: 20px; min-width: 40px; }
.y-lbl { font-size: 10px; color: var(--text-m, #64748b); }
.bars-area { flex: 1; position: relative; }
.grid-lines { position: absolute; inset: 0 0 20px 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.grid-line { border-top: 1px dashed rgba(255,255,255,0.06); }
.bars-row { position: absolute; inset: 0 0 0 0; display: flex; align-items: flex-end; gap: 4px; padding-bottom: 20px; overflow-x: auto; }
.bar-group { flex: 1; min-width: 32px; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
.bars-pair { flex: 1; width: 100%; display: flex; align-items: flex-end; gap: 2px; }
.bar { flex: 1; border-radius: 4px 4px 0 0; min-height: 3px; transition: height 0.4s cubic-bezier(.4,0,.2,1); cursor: pointer; }
.bar:hover { filter: brightness(1.2); }
.bar-client { background: linear-gradient(180deg, #818cf8, #6366f1); }
.bar-fourn { background: linear-gradient(180deg, #fb7185, #f43f5e); }
.x-lbl { font-size: 9px; color: var(--text-m, #64748b); text-align: center; white-space: nowrap; }
.chart-legend { display: flex; gap: 16px; flex-wrap: wrap; }
.leg { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-m, #94a3b8); }
.leg-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
</style>