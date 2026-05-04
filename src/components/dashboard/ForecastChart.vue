<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-group">
        <div class="dot dot-purple"></div>
        <h3>📉 Prévision de trésorerie</h3>
      </div>
      <div class="chart-legend">
        <span class="leg"><span class="leg-line" style="background:#6366f1"></span>Cash réel</span>
        <span class="leg"><span class="leg-line leg-dashed" style="border-color:#f59e0b"></span>Prévisionnel</span>
      </div>
    </div>

    <div v-if="loading" class="chart-placeholder"><div class="shimmer"></div></div>
    <div v-else-if="!data.labels.length" class="empty-state">
      <div class="empty-icon">📈</div>
      <p>Données insuffisantes pour la prévision</p>
    </div>
    <div v-else class="chart-body">
      <!-- SVG line chart -->
      <div class="chart-area" ref="chartEl">
        <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="chart-svg">
          <!-- Grid -->
          <defs>
            <linearGradient id="grad-reel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="grad-prev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line v-for="i in 5" :key="i"
            :x1="pad" :y1="yPos((5-i)*maxVal/5)" :x2="W-pad" :y2="yPos((5-i)*maxVal/5)"
            stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          <!-- Zero line -->
          <line :x1="pad" :y1="yPos(0)" :x2="W-pad" :y2="yPos(0)"
            stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="4,4"/>

          <!-- Area reel -->
          <path v-if="reelPoints.length" :d="areaPath(reelPoints)" fill="url(#grad-reel)"/>
          <!-- Area previsionnel -->
          <path v-if="prevPoints.length" :d="areaPath(prevPoints)" fill="url(#grad-prev)"/>

          <!-- Line reel -->
          <polyline v-if="reelPoints.length"
            :points="reelPoints.map(p => `${p.x},${p.y}`).join(' ')"
            fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

          <!-- Line previsionnel (dashed) -->
          <polyline v-if="prevPoints.length"
            :points="prevPoints.map(p => `${p.x},${p.y}`).join(' ')"
            fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4"
            stroke-linecap="round" stroke-linejoin="round"/>

          <!-- Dots reel -->
          <circle v-for="(p, i) in reelPoints" :key="'r'+i"
            :cx="p.x" :cy="p.y" r="3.5" fill="#6366f1"
            :title="data.labels[p.i] + ': ' + fmt(data.reel[p.i]) + ' DT'"/>

          <!-- Dots previsionnel -->
          <circle v-for="(p, i) in prevPoints" :key="'v'+i"
            :cx="p.x" :cy="p.y" r="3" fill="#f59e0b" stroke="#1e2235" stroke-width="1.5"/>
        </svg>
      </div>

      <!-- X axis labels -->
      <div class="x-labels">
        <span v-for="(l, i) in data.labels" :key="i" class="x-lbl">{{ l }}</span>
      </div>
    </div>

    <!-- Summary badges -->
    <div class="summary-row">
      <div class="summary-badge green">
        <span class="badge-val">{{ fmt(totalReel) }} DT</span>
        <span class="badge-lbl">Encaissé (réel)</span>
      </div>
      <div class="summary-badge amber">
        <span class="badge-val">{{ fmt(totalPrev) }} DT</span>
        <span class="badge-lbl">Attendu (prévisionnel)</span>
      </div>
      <div :class="['summary-badge', balance >= 0 ? 'blue' : 'red']">
        <span class="badge-val">{{ balance >= 0 ? '+' : '' }}{{ fmt(balance) }} DT</span>
        <span class="badge-lbl">Balance totale</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  traites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const W = 600
const H = 200
const pad = 30

function normalizeStatut(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}
function isStatutPaid(t) {
  const s = normalizeStatut(t.statut_label || t.statut || '')
  return ['paye','payer','en_caisse','caisse'].some(k => s.includes(k))
}

const data = computed(() => {
  const today = new Date()
  const points = {}

  for (const t of props.traites) {
    const key = t.date_echeance?.split('T')[0]
    if (!key) continue
    const d = new Date(key)
    if (isNaN(d)) continue
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!points[ym]) points[ym] = { reel: null, previsionnel: null }

    const amt = Number(t.montant) || 0
    const sign = t.type_traite === 'client' ? 1 : -1
    const paid = isStatutPaid(t)
    const isFuture = d > today

    if (paid && !isFuture) {
      if (points[ym].reel === null) points[ym].reel = 0
      points[ym].reel += amt * sign
    } else if (!paid && isFuture) {
      if (points[ym].previsionnel === null) points[ym].previsionnel = 0
      points[ym].previsionnel += amt * sign
    }
  }

  const sorted = Object.entries(points).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
  return {
    labels: sorted.map(([k]) => {
      const [y, m] = k.split('-')
      return new Date(+y, +m - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    }),
    reel: sorted.map(([, v]) => v.reel),
    previsionnel: sorted.map(([, v]) => v.previsionnel),
  }
})

const allVals = computed(() => [...data.value.reel, ...data.value.previsionnel].filter(v => v !== null))
const maxVal = computed(() => Math.max(...allVals.value.map(Math.abs), 1) * 1.15)
const n = computed(() => data.value.labels.length)

function yPos(val) {
  return H / 2 - (val / maxVal.value) * (H / 2 - 16)
}
function xPos(i) {
  return pad + (i / Math.max(n.value - 1, 1)) * (W - pad * 2)
}

const reelPoints = computed(() =>
  data.value.reel
    .map((v, i) => v !== null ? { x: xPos(i), y: yPos(v), i } : null)
    .filter(Boolean)
)
const prevPoints = computed(() =>
  data.value.previsionnel
    .map((v, i) => v !== null ? { x: xPos(i), y: yPos(v), i } : null)
    .filter(Boolean)
)

function areaPath(pts) {
  if (!pts.length) return ''
  const base = yPos(0)
  const d = [`M ${pts[0].x} ${base}`, ...pts.map(p => `L ${p.x} ${p.y}`), `L ${pts[pts.length-1].x} ${base}`, 'Z']
  return d.join(' ')
}

const totalReel = computed(() => data.value.reel.filter(v => v !== null).reduce((s, v) => s + v, 0))
const totalPrev = computed(() => data.value.previsionnel.filter(v => v !== null).reduce((s, v) => s + v, 0))
const balance = computed(() => Math.round(totalReel.value + totalPrev.value))

function fmt(n) {
  return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
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
.dot-purple { background: #6366f1; }
.chart-legend { display: flex; gap: 14px; }
.leg { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-m, #94a3b8); }
.leg-line { display: inline-block; width: 20px; height: 2.5px; border-radius: 2px; }
.leg-dashed { background: transparent !important; border-top: 2px dashed; }
.chart-placeholder { height: 200px; }
.shimmer { width: 100%; height: 100%; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.empty-state { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-m, #94a3b8); }
.empty-icon { font-size: 32px; opacity: 0.4; }
.empty-state p { font-size: 13px; margin: 0; }
.chart-body { display: flex; flex-direction: column; gap: 4px; }
.chart-area { width: 100%; }
.chart-svg { width: 100%; height: 200px; display: block; }
.x-labels { display: flex; justify-content: space-between; padding: 0 4px; }
.x-lbl { font-size: 9px; color: var(--text-m, #64748b); text-align: center; flex: 1; }
.summary-row { display: flex; gap: 10px; flex-wrap: wrap; }
.summary-badge { flex: 1; min-width: 120px; padding: 10px 14px; border-radius: 10px; display: flex; flex-direction: column; gap: 2px; }
.summary-badge.green { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); }
.summary-badge.amber { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
.summary-badge.blue { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); }
.summary-badge.red { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); }
.badge-val { font-size: 14px; font-weight: 700; color: var(--text, #e2e8f0); }
.badge-lbl { font-size: 10px; color: var(--text-m, #94a3b8); }
</style>