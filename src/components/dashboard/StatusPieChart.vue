<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-group">
        <div class="dot dot-rose"></div>
        <h3>🥧 Statuts des traites</h3>
      </div>
    </div>
    <div v-if="loading" class="chart-placeholder"><div class="shimmer"></div></div>
    <div v-else-if="total === 0" class="empty-state"><div class="empty-icon">🥧</div><p>Aucune traite à afficher</p></div>
    
    <div v-else class="pie-layout">
      <div class="donut-wrap">
        <svg viewBox="0 0 140 140" class="donut-svg">
          <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="20"/>
          <circle v-for="(seg, i) in segments" :key="i" cx="70" cy="70" r="52" fill="none" :stroke="seg.color" stroke-width="20" stroke-linecap="butt" :stroke-dasharray="`${seg.arc} ${circumference}`" :stroke-dashoffset="seg.offset" transform="rotate(-90 70 70)" class="pie-seg"/>
          <text x="70" y="64" text-anchor="middle" class="center-num">{{ total }}</text>
          <text x="70" y="80" text-anchor="middle" class="center-lbl">Traites</text>
        </svg>
      </div>
      <div class="pie-legend">
        <div v-for="seg in segments" :key="seg.label" class="leg-row">
          <div class="leg-color" :style="{ background: seg.color }"></div>
          <div class="leg-info"><span class="leg-label">{{ seg.label }}</span><div class="leg-bar-track"><div class="leg-bar-fill" :style="{ width: seg.pct + '%', background: seg.color }"></div></div></div>
          <div class="leg-stats"><span class="leg-count">{{ seg.count }}</span><span class="leg-pct">{{ seg.pct }}%</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ traites: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const R = 52; const circumference = 2 * Math.PI * R

function normalizeStatut(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() }
function isStatutPaid(t) { const s = normalizeStatut(t.statut_label || t.statut || ''); return ['paye','payer','en_caisse','caisse'].some(k => s.includes(k)) }

const counts = computed(() => {
  let pc = 0, uc = 0, pf = 0, uf = 0
  for (const t of props.traites) {
    const paid = isStatutPaid(t)
    if (t.type_traite === 'client') { if (paid) pc++; else uc++ } else { if (paid) pf++; else uf++ }
  }
  return { pc, uc, pf, uf }
})

const total = computed(() => Object.values(counts.value).reduce((s, v) => s + v, 0))
const segments = computed(() => {
  const { pc, uc, pf, uf } = counts.value
  const defs = [
    { label: 'Clients payés', count: pc, color: '#22c55e' },
    { label: 'Clients impayés', count: uc, color: '#6366f1' },
    { label: 'Fourn. payés', count: pf, color: '#10b981' },
    { label: 'Fourn. impayés', count: uf, color: '#f43f5e' },
  ]
  let offset = 0
  return defs.map(d => {
    const pct = total.value ? Math.round((d.count / total.value) * 100) : 0
    const arc = (d.count / total.value) * circumference
    const seg = { ...d, pct, arc, offset: -offset + circumference }
    offset += arc
    return seg
  })
})
</script>

<style scoped>
.chart-card { background: var(--card-bg, #1e2235); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 16px; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.chart-header { display: flex; align-items: center; justify-content: space-between; }
.title-group { display: flex; align-items: center; gap: 8px; }
.title-group h3 { font-size: 15px; font-weight: 600; color: var(--text, #e2e8f0); margin: 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-rose { background: #f43f5e; }
.chart-placeholder { height: 180px; }
.shimmer { width: 100%; height: 100%; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.empty-state { height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-m, #94a3b8); }
.empty-icon { font-size: 32px; opacity: 0.4; }
.empty-state p { font-size: 13px; margin: 0; }
.pie-layout { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
.donut-wrap { width: 130px; height: 130px; flex-shrink: 0; }
.donut-svg { width: 100%; height: 100%; }
.pie-seg { transition: stroke-dasharray 0.5s cubic-bezier(.4,0,.2,1); }
.center-num { font-size: 20px; font-weight: 800; fill: var(--text, #e2e8f0); }
.center-lbl { font-size: 9px; fill: var(--text-m, #94a3b8); }
.pie-legend { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 160px; }
.leg-row { display: flex; align-items: center; gap: 10px; }
.leg-color { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.leg-info { flex: 1; min-width: 0; }
.leg-label { font-size: 11px; color: var(--text-m, #94a3b8); display: block; margin-bottom: 3px; }
.leg-bar-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
.leg-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }
.leg-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.leg-count { font-size: 12px; font-weight: 700; color: var(--text, #e2e8f0); }
.leg-pct { font-size: 10px; color: var(--text-m, #64748b); }
</style>