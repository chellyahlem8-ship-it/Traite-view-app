<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-group">
        <div class="dot dot-green"></div>
        <h3>📆 Calendrier de trésorerie</h3>
      </div>
      <div class="nav-controls">
        <button class="nav-btn" @click="prevMonth">‹</button>
        <span class="month-label">{{ currentMonthLabel }}</span>
        <button class="nav-btn" @click="nextMonth">›</button>
      </div>
    </div>

    <div class="legend-row">
      <span class="leg-item"><span class="leg-sq" style="background:#ef4444"></span>Déficit</span>
      <span class="leg-item"><span class="leg-sq" style="background:#22c55e"></span>Excédent</span>
      <span class="leg-item"><span class="leg-sq" style="background:rgba(255,255,255,0.06)"></span>Neutre</span>
    </div>

    <div class="calendar-wrap">
      <div class="day-headers">
        <span v-for="d in ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']" :key="d" class="day-header">{{ d }}</span>
      </div>
      <div class="weeks-grid">
        <div v-for="(week, wi) in calendarWeeks" :key="wi" class="week-row">
          <div
            v-for="(day, di) in week"
            :key="di"
            :class="['day-cell', { 'other-month': day && !day.current, 'empty': !day }]"
            :style="day ? dayStyle(day) : {}"
            :title="day ? dayTooltip(day) : ''"
          >
            <span v-if="day" class="day-num">{{ day.date }}</span>
            <span v-if="day && day.netFlow !== 0" class="day-dot" :style="{ background: day.netFlow > 0 ? '#22c55e' : '#ef4444' }"></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedDay" class="day-detail">
      <strong>{{ selectedDay.label }}</strong> :
      <span :style="{ color: selectedDay.netFlow > 0 ? '#22c55e' : selectedDay.netFlow < 0 ? '#ef4444' : '#94a3b8' }">
        {{ selectedDay.netFlow > 0 ? '+' : '' }}{{ fmt(selectedDay.netFlow) }} DT
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  traites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-based

const currentMonthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

const cashflowMap = computed(() => {
  const map = {}
  for (const t of props.traites) {
    const key = t.date_echeance?.split('T')[0]
    if (!key) continue
    if (!map[key]) map[key] = 0
    const s = (t.statut_label || t.statut || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
    if (['paye','payer','en_caisse','caisse'].some(k => s.includes(k))) continue
    const amt = Number(t.montant) || 0
    if (t.type_traite === 'client') map[key] += amt
    else if (t.type_traite === 'fournisseur') map[key] -= amt
  }
  return map
})

const maxAbsFlow = computed(() => {
  const vals = Object.values(cashflowMap.value).map(Math.abs)
  return Math.max(...vals, 1)
})

const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  // Prev month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ date: d, current: false, dateStr, netFlow: cashflowMap.value[dateStr] || 0, label: dateStr })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ date: d, current: true, dateStr, netFlow: cashflowMap.value[dateStr] || 0, label: dateStr })
  }
  // Next month padding
  while (cells.length % 7 !== 0) {
    const d = cells.length - firstDay - daysInMonth + 1
    const dateStr = `${year}-${String(month + 2).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ date: d, current: false, dateStr, netFlow: 0, label: dateStr })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
})

const selectedDay = ref(null)

function dayStyle(day) {
  if (!day.current || day.netFlow === 0) return {}
  const intensity = Math.min(Math.abs(day.netFlow) / maxAbsFlow.value, 1)
  const alpha = 0.15 + intensity * 0.55
  const color = day.netFlow > 0 ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})`
  return { background: color, borderColor: day.netFlow > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }
}

function dayTooltip(day) {
  if (!day.current || day.netFlow === 0) return ''
  return `${day.dateStr}: ${day.netFlow > 0 ? '+' : ''}${fmt(day.netFlow)} DT`
}

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
  gap: 14px;
}
.chart-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.title-group { display: flex; align-items: center; gap: 8px; }
.title-group h3 { font-size: 15px; font-weight: 600; color: var(--text, #e2e8f0); margin: 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-green { background: #22c55e; }
.nav-controls { display: flex; align-items: center; gap: 8px; }
.nav-btn { background: rgba(255,255,255,0.08); border: none; color: var(--text, #e2e8f0); width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.nav-btn:hover { background: rgba(255,255,255,0.14); }
.month-label { font-size: 13px; font-weight: 600; color: var(--text, #e2e8f0); min-width: 130px; text-align: center; }
.legend-row { display: flex; gap: 14px; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-m, #94a3b8); }
.leg-sq { width: 10px; height: 10px; border-radius: 2px; }
.calendar-wrap { display: flex; flex-direction: column; gap: 4px; }
.day-headers { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.day-header { text-align: center; font-size: 10px; font-weight: 600; color: var(--text-m, #64748b); padding: 2px 0; }
.weeks-grid { display: flex; flex-direction: column; gap: 3px; }
.week-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.day-cell {
  aspect-ratio: 1;
  border-radius: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
  min-height: 34px;
}
.day-cell:hover { border-color: rgba(255,255,255,0.2) !important; }
.day-cell.other-month .day-num { opacity: 0.25; }
.day-num { font-size: 11px; font-weight: 500; color: var(--text, #e2e8f0); }
.day-dot { position: absolute; bottom: 3px; width: 4px; height: 4px; border-radius: 50%; }
.day-detail { font-size: 12px; color: var(--text-m, #94a3b8); padding: 8px 12px; background: rgba(255,255,255,0.04); border-radius: 8px; }
</style>