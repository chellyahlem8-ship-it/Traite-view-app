<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-group">
        <div class="dot dot-amber"></div>
        <h3>🏦 Top Entités</h3>
      </div>
      <div class="period-toggle">
        <button :class="['tog-btn', { active: view === 'client' }]" @click="view = 'client'">Clients</button>
        <button :class="['tog-btn', { active: view === 'fournisseur' }]" @click="view = 'fournisseur'">Fournisseurs</button>
      </div>
    </div>

    <p class="subtitle">
      {{ view === 'client' ? 'Top clients qui vous doivent le plus' : 'Top fournisseurs à qui vous devez le plus' }}
    </p>

    <div v-if="loading" class="chart-placeholder">
      <div v-for="i in 5" :key="i" class="shimmer-row"></div>
    </div>
    <div v-else-if="!entities.length" class="empty-state">
      <div class="empty-icon">👥</div>
      <p>Aucune donnée disponible</p>
    </div>
    <div v-else class="entity-list">
      <div v-for="(e, i) in entities" :key="e.name" class="entity-row">
        <div class="rank">{{ i + 1 }}</div>
        <div class="avatar" :style="{ background: avatarColor(e.name) }">
          {{ e.name.charAt(0).toUpperCase() }}
        </div>
        <div class="entity-info">
          <span class="entity-name">{{ e.name }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: ((e.montant / maxMontant) * 100) + '%',
                background: view === 'client' ? 'linear-gradient(90deg,#6366f1,#818cf8)' : 'linear-gradient(90deg,#f43f5e,#fb7185)'
              }"
            ></div>
          </div>
        </div>
        <div class="entity-amount">
          <span class="amount">{{ fmtK(e.montant) }}</span>
          <span class="currency">DT</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  traites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const view = ref('client')

function normalizeStatut(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}
function isStatutPaid(t) {
  const s = normalizeStatut(t.statut_label || t.statut || '')
  return ['paye','payer','en_caisse','caisse'].some(k => s.includes(k))
}

const entities = computed(() => {
  const map = {}
  for (const t of props.traites) {
    if (t.type_traite !== view.value) continue
    if (isStatutPaid(t)) continue
    const name = t.tier_nom || 'Inconnu'
    map[name] = (map[name] || 0) + (Number(t.montant) || 0)
  }
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([name, montant]) => ({ name, montant: Math.round(montant) }))
})

const maxMontant = computed(() => Math.max(...entities.value.map(e => e.montant), 1))

function avatarColor(name) {
  const colors = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#6d28d9']
  return colors[name.charCodeAt(0) % colors.length]
}

function fmtK(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 0 })
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
  gap: 14px;
}
.chart-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.title-group { display: flex; align-items: center; gap: 8px; }
.title-group h3 { font-size: 15px; font-weight: 600; color: var(--text, #e2e8f0); margin: 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-amber { background: #f59e0b; }
.subtitle { font-size: 12px; color: var(--text-m, #94a3b8); margin: 0; }
.period-toggle { display: flex; gap: 4px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 3px; }
.tog-btn { padding: 4px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; background: transparent; color: var(--text-m, #94a3b8); transition: all 0.2s; }
.tog-btn.active { background: #f59e0b; color: #fff; }
.chart-placeholder { display: flex; flex-direction: column; gap: 10px; }
.shimmer-row { height: 36px; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.empty-state { height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-m, #94a3b8); }
.empty-icon { font-size: 32px; opacity: 0.4; }
.empty-state p { font-size: 13px; margin: 0; }
.entity-list { display: flex; flex-direction: column; gap: 10px; }
.entity-row { display: flex; align-items: center; gap: 10px; }
.rank { width: 20px; font-size: 11px; font-weight: 700; color: var(--text-m, #64748b); text-align: center; flex-shrink: 0; }
.avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
.entity-info { flex: 1; min-width: 0; }
.entity-name { font-size: 12px; color: var(--text, #e2e8f0); display: block; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s cubic-bezier(.4,0,.2,1); }
.entity-amount { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
.amount { font-size: 13px; font-weight: 700; color: var(--text, #e2e8f0); }
.currency { font-size: 10px; color: var(--text-m, #64748b); }
</style>