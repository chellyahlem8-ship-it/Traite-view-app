<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- ── En-tête ───────────────────────────────────────────── -->
      <div class="page-header">
        <h1 class="page-title">Traites</h1>
        <div class="header-actions">
          <button class="btn btn--secondary-outline" @click="openAddStatut">
            <span>＋</span> Ajouter Statut Traite
          </button>
          <button class="btn btn--primary" @click="goToCreate">
            <span>＋</span> Ajouter Traite
          </button>
        </div>
      </div>

      <!-- ── Cartes statistiques ───────────────────────────────── -->
      <div class="stats-bar">
        <div class="stat-card stat-card--total">
          <span class="stat-icon">📄</span>
          <div>
            <div class="stat-value">{{ traites.length }}</div>
            <div class="stat-label">Total traites</div>
          </div>
        </div>
        <div class="stat-card stat-card--montant">
          <span class="stat-icon">💰</span>
          <div>
            <div class="stat-value">{{ formatMontant(totalMontant) }}</div>
            <div class="stat-label">Montant total</div>
          </div>
        </div>
        <div
          v-for="st in statuts"
          :key="st.id"
          class="stat-card stat-card--dynamic"
        >
          <span class="stat-icon">🏷</span>
          <div>
            <div class="stat-value">{{ countByStatut(st.id) }}</div>
            <div class="stat-label">{{ st.statut }}</div>
          </div>
        </div>
      </div>

      <!-- ── Toast ─────────────────────────────────────────────── -->
      <Transition name="slide-down">
        <div v-if="toastMsg" :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']">
          <span>{{ toastMsg }}</span>
          <button class="toast-close" @click="toastMsg = null">✕</button>
        </div>
      </Transition>

      <!-- ── Modal Ajouter Statut Traite ──────────────────────── -->
      <Transition name="fade">
        <div v-if="showStatutModal" class="modal-overlay" @click.self="showStatutModal = false">
          <div class="modal-box">
            <h3 class="modal-title">Ajouter un statut de traite</h3>
            <input
              v-model="newStatut"
              class="modal-input"
              type="text"
              placeholder="Ex: En attente, Remis en banque…"
              @keyup.enter="saveStatut"
            />
            <div class="modal-actions">
              <button class="btn btn--secondary-outline" @click="showStatutModal = false">Annuler</button>
              <button class="btn btn--primary" :disabled="!newStatut.trim() || savingStatut" @click="saveStatut">
                {{ savingStatut ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ── Panneau principal ─────────────────────────────────── -->
      <div class="table-panel">

        <!-- Barre de filtre / recherche -->
        <div class="filter-bar">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              class="search-input"
              type="text"
              placeholder="Rechercher par tiers, banque, montant…"
            />
          </div>

          <div class="filters">
            <!-- Filtre statut : options chargées depuis l'API -->
            <select v-model="filterStatutId" class="filter-select">
              <option value="">Tous les états</option>
              <option v-for="st in statuts" :key="st.id" :value="st.id">
                {{ st.statut }}
              </option>
            </select>

            <select v-model="filterType" class="filter-select">
              <option value="">Tous les types</option>
              <option value="client">Client</option>
              <option value="fournisseur">Fournisseur</option>
            </select>
          </div>
        </div>

        <!-- Actions sélection -->
        <div class="action-bar" v-if="selectedIds.length > 0">
          <span class="selection-info">{{ selectedIds.length }} traite(s) sélectionnée(s)</span>
          <button class="btn btn--danger-outline" @click="cancelSelected">
            🚫 Annuler la sélection
          </button>
          <button class="btn btn--secondary-outline" @click="selectedIds = []">
            Désélectionner
          </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="loader-wrapper">
          <div class="spinner"></div>
          <span>Chargement des traites…</span>
        </div>

        <!-- Tableau -->
        <div v-else-if="paginatedTraites.length > 0" class="table-wrapper">
          <table class="traites-table">
            <thead>
              <tr>
                <th class="th-check">
                  <input type="checkbox" class="custom-checkbox"
                    :checked="allPageSelected" @change="toggleSelectAll" />
                </th>
                <th
                  v-for="col in columns"
                  :key="col.key"
                  @click="col.sortable ? sortBy(col.key) : null"
                  :class="['sortable-th', { 'th--sortable': col.sortable, 'th--active': sortKey === col.key }]"
                >
                  {{ col.label }}
                  <span v-if="col.sortable" class="sort-icon">
                    {{ sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="traite in paginatedTraites"
                :key="traite.id"
                :class="{ selected: selectedIds.includes(traite.id) }"
                @click="toggleSelect(traite.id)"
              >
                <td class="td-check" @click.stop>
                  <input type="checkbox" class="custom-checkbox"
                    :checked="selectedIds.includes(traite.id)"
                    @change="toggleSelect(traite.id)" />
                </td>

                <!-- Montant -->
                <td class="td-montant">
                  <span class="montant-value">{{ formatMontant(traite.montant) }}</span>
                </td>

                <!-- Date émission -->
                <td class="td-date">{{ formatDate(traite.date_emission) }}</td>

                <!-- Date échéance -->
                <td class="td-date">
                  <span :class="['echeance-text', isOverdue(traite) ? 'echeance--overdue' : '']">
                    {{ formatDate(traite.date_echeance) }}
                    <span v-if="isOverdue(traite)" class="overdue-badge">En retard</span>
                  </span>
                </td>

                <!-- Banque -->
                <td class="td-banque">
                  <span v-if="traite.compteBancaire?.banque" class="banque-chip">
                    🏦 {{ traite.compteBancaire.banque.nomBanque }}
                  </span>
                  <span v-else class="no-data">—</span>
                </td>

                <!-- Tiers (tireur) -->
                <td class="td-tiers">
                  <span v-if="traite.tireur">{{ traite.tireur.raison_sociale }}</span>
                  <span v-else class="no-data">—</span>
                </td>

                <!-- Statut -->
                <td class="td-etat">
                  <StatusBadge
                    v-if="traite.statutTraite"
                    :value="traite.statutTraite.statut"
                    kind="etat"
                  />
                  <span v-else class="no-data">—</span>
                </td>

                <!-- Type -->
                <td class="td-type">
                  <StatusBadge :value="traite.type_traite" kind="type" />
                </td>

                <!-- Action -->
                <td class="td-action" @click.stop>
                  <button class="link-btn" @click="editTraite(traite)">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vide -->
        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <p>Aucune traite trouvée.</p>
          <span>Modifiez vos filtres ou ajoutez une nouvelle traite.</span>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" v-if="totalPages > 1">
          <span class="pagination-info">
            {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredTraites.length) }}
            sur {{ filteredTraites.length }} traite(s)
          </span>
          <div class="pagination-controls">
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button
              v-for="p in visiblePages" :key="p"
              class="page-btn" :class="{ 'page-btn--active': p === currentPage }"
              @click="currentPage = p"
            >{{ p }}</button>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { fetchTraites, fetchStatuts } from '@/api/traite.api'
import type { StatutTraite } from '@/types/traite.types'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// ── Types locaux (réponse réelle du backend) ──────────────────
interface TraiteAPI {
  id: number
  montant: number
  type_traite: 'fournisseur' | 'client'
  date_emission: string
  date_echeance: string
  comptes_bancaires_id: number
  statuts_traites_id: number
  tireur_id: number
  tireur_type: string
  compteBancaire?: {
    id: number
    rib: string
    banque?: { id: number; nomBanque: string }
  }
  statutTraite?: { id: number; statut: string }
  tireur?: { id: number; raison_sociale: string }
}

// ── Colonnes ──────────────────────────────────────────────────
const columns = [
  { key: 'montant',       label: 'MONTANT',         sortable: true  },
  { key: 'date_emission', label: "DATE D'ÉMISSION",  sortable: true  },
  { key: 'date_echeance', label: "DATE D'ÉCHÉANCE",  sortable: true  },
  { key: 'banque',        label: 'BANQUE',           sortable: false },
  { key: 'tireur',        label: 'TIERS',            sortable: false },
  { key: 'statut',        label: 'ÉTAT',             sortable: false },
  { key: 'type_traite',   label: 'TYPE',             sortable: false },
  { key: 'action',        label: '',                 sortable: false },
]

// ── État ──────────────────────────────────────────────────────
const traites        = ref<TraiteAPI[]>([])
const statuts        = ref<StatutTraite[]>([])
const loading        = ref(false)
const toastMsg       = ref<string | null>(null)
const toastType      = ref<'success' | 'error'>('success')
const selectedIds    = ref<number[]>([])
const searchQuery    = ref('')
const filterStatutId = ref<number | ''>('')
const filterType     = ref('')
const sortKey        = ref('date_echeance')
const sortDir        = ref<'asc' | 'desc'>('asc')
const currentPage    = ref(1)
const pageSize       = 8

// ── Modal Statut ──────────────────────────────────────────────
const showStatutModal = ref(false)
const newStatut       = ref('')
const savingStatut    = ref(false)

function openAddStatut() {
  router.push({ name: 'CreateStatutTraite' })
}

async function saveStatut() {
  if (!newStatut.value.trim()) return
  savingStatut.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_BASE_URL}/statuts-traites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ statut: newStatut.value.trim() }),
    })
    if (!res.ok) throw new Error()
    const json = await res.json()
    statuts.value.push(json.data)
    showStatutModal.value = false
    showToast('Statut créé avec succès.', 'success')
  } catch {
    showToast('Erreur lors de la création du statut.', 'error')
  } finally {
    savingStatut.value = false
  }
}

// ── Fetch données ─────────────────────────────────────────────
async function loadAll() {
  loading.value = true
  try {
    const [traiteRes, statutRes] = await Promise.all([
      fetchTraites(),
      fetchStatuts(),
    ])
    traites.value = traiteRes.data as TraiteAPI[]
    statuts.value = statutRes.data
  } catch {
    showToast('Erreur lors du chargement des données.', 'error')
  } finally {
    loading.value = false
  }
}

// ── Stats ─────────────────────────────────────────────────────
const totalMontant   = computed(() => traites.value.reduce((s, t) => s + Number(t.montant), 0))
const countByStatut  = (id: number) => traites.value.filter(t => t.statuts_traites_id === id).length

// ── Filtres + Tri ─────────────────────────────────────────────
const filteredTraites = computed(() => {
  let list = [...traites.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.tireur?.raison_sociale?.toLowerCase().includes(q)          ||
      t.compteBancaire?.banque?.nomBanque?.toLowerCase().includes(q) ||
      String(t.montant).includes(q)
    )
  }

  if (filterStatutId.value !== '')
    list = list.filter(t => t.statuts_traites_id === filterStatutId.value)

  if (filterType.value)
    list = list.filter(t => t.type_traite === filterType.value)

  list.sort((a, b) => {
    let va: any, vb: any
    if (sortKey.value === 'montant') { va = Number(a.montant); vb = Number(b.montant) }
    else { va = (a as any)[sortKey.value]; vb = (b as any)[sortKey.value] }
    const cmp = typeof va === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''))
    return sortDir.value === 'asc' ? cmp : -cmp
  })

  return list
})

// ── Pagination ────────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(filteredTraites.value.length / pageSize))
const paginatedTraites = computed(() =>
  filteredTraites.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)
const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = Math.max(1, currentPage.value - 2); i <= Math.min(totalPages.value, currentPage.value + 2); i++)
    pages.push(i)
  return pages
})

watch([searchQuery, filterStatutId, filterType], () => { currentPage.value = 1 })

// ── Sélection ─────────────────────────────────────────────────
const allPageSelected = computed(() =>
  paginatedTraites.value.length > 0 &&
  paginatedTraites.value.every(t => selectedIds.value.includes(t.id))
)

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  idx >= 0 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

function toggleSelectAll() {
  if (allPageSelected.value)
    selectedIds.value = selectedIds.value.filter(id => !paginatedTraites.value.find(t => t.id === id))
  else
    paginatedTraites.value.forEach(t => { if (!selectedIds.value.includes(t.id)) selectedIds.value.push(t.id) })
}

// Annuler les traites sélectionnées (updateStatus)
async function cancelSelected() {
  if (!selectedIds.value.length) return
  try {
    const token = localStorage.getItem('auth_token')
    await Promise.all(
      selectedIds.value.map(id =>
        fetch(`${API_BASE_URL}/traites/${id}/status`, {
          method: 'PATCH',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
      )
    )
    showToast('Traite(s) annulée(s) avec succès.', 'success')
    selectedIds.value = []
    await loadAll()
  } catch {
    showToast("Erreur lors de l'annulation.", 'error')
  }
}

// ── Tri ───────────────────────────────────────────────────────
function sortBy(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

// ── Navigation ────────────────────────────────────────────────
function goToCreate() {
  router.push({ name: 'TraitesCreate' })
}

function editTraite(t: TraiteAPI) {
  // router.push({ name: 'EditTraite', params: { id: t.id } })
  showToast(`Modification de la traite #${t.id}`, 'success')
}

// ── Helpers ───────────────────────────────────────────────────
function formatMontant(n: number): string {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(n)
}

function formatDate(d: string): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(t: TraiteAPI): boolean {
  const nonPayeStatut = statuts.value.find(s => s.statut.toLowerCase().includes('non_pay') || s.statut.toLowerCase() === 'non payé')
  const isNonPaye = nonPayeStatut ? t.statuts_traites_id === nonPayeStatut.id : false
  return isNonPaye && new Date(t.date_echeance) < new Date()
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = null }, 4000)
}

onMounted(loadAll)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

/* ── Layout ──────────────────────────────────────────────────── */
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

/* ── Header ──────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── Boutons ─────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;

  &--primary {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    box-shadow: 0 3px 10px rgba(109, 40, 217, 0.3);
    &:hover { opacity: 0.9; transform: translateY(-1px); }
    &[disabled] { opacity: 0.45; cursor: not-allowed; transform: none; }
  }
  &--secondary-outline {
    background: #f5f3ff;
    color: #6d28d9;
    border: 1px solid #ddd6fe;
    &:hover { background: #ede9fe; }
    &[disabled] { opacity: 0.45; cursor: not-allowed; }
  }
  &--danger-outline {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
    &:hover { background: #fee2e2; }
  }
}

/* ── Stats ───────────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.stat-card {
  color: #fff;
  border-radius: 14px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
  flex: 1;

  &--total   { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
  &--montant { background: linear-gradient(135deg, #5b21b6, #4c1d95); }
  &--dynamic { background: linear-gradient(135deg, #0891b2, #0e7490); }
}

.stat-icon  { font-size: 22px; }
.stat-value { font-size: 20px; font-weight: 700; line-height: 1; }
.stat-label { font-size: 11px; opacity: 0.85; margin-top: 3px; text-transform: capitalize; }

/* ── Toast ───────────────────────────────────────────────────── */
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
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
  &:hover { opacity: 1; background: rgba(0,0,0,.06); }
}

/* ── Modal ───────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 28px 28px 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(109,40,217,0.18);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.modal-input {
  padding: 10px 14px;
  border: 1px solid #ddd6fe;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  color: #1e1b4b;
  outline: none;
  &:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ── Panneau ─────────────────────────────────────────────────── */
.table-panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(109, 40, 217, 0.07);
  overflow: hidden;
}

/* ── Filter bar ──────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0ebff;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 340px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  color: #1e1b4b;
  background: #faf9ff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &::placeholder { color: #9ca3af; }
  &:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12); }
}

.filters { display: flex; gap: 10px; flex-wrap: wrap; }

.filter-select {
  padding: 9px 32px 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  color: #374151;
  background: #faf9ff;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238b5cf6' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s;
  &:focus { border-color: #8b5cf6; }
}

/* ── Action bar ──────────────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #fdf4ff;
  border-bottom: 1px solid #e9d5ff;
  flex-wrap: wrap;
}

.selection-info {
  font-size: 13px;
  font-weight: 600;
  color: #6d28d9;
  margin-right: auto;
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

/* ── Table ───────────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }

.traites-table {
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background: #faf9ff;
    border-bottom: 2px solid #ede9fe;
  }

  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #8b5cf6;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    user-select: none;
  }

  .th--sortable { cursor: pointer; transition: color 0.15s; &:hover { color: #6d28d9; } }
  .th--active   { color: #4c1d95; }
  .sort-icon    { margin-left: 4px; opacity: 0.6; font-size: 10px; }

  tbody tr {
    border-bottom: 1px solid #f5f3ff;
    cursor: pointer;
    transition: background 0.15s;
    &:hover      { background: #faf9ff; }
    &:last-child { border-bottom: none; }
    &.selected   { background: #f5f3ff; td { color: #4c1d95; } }
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #374151;
    vertical-align: middle;
  }
}

.th-check, .td-check { width: 44px; }

.custom-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7c3aed;
}

/* ── Cellules ────────────────────────────────────────────────── */
.td-montant .montant-value {
  font-weight: 700;
  color: #1e1b4b;
  font-size: 15px;
}

.td-date { color: #6b7280; font-size: 13px; }

.echeance-text {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.echeance--overdue { color: #dc2626; font-weight: 600; }

.overdue-badge {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
}

.banque-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f5f3ff;
  color: #5b21b6;
  border: 1px solid #ddd6fe;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.no-data { color: #d1d5db; }

.link-btn {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: 'Outfit', sans-serif;
  &:hover { text-decoration: underline; }
}

/* ── Vide ────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #9ca3af;
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  p    { font-size: 15px; font-weight: 600; color: #6b7280; margin: 0 0 6px; }
  span { font-size: 13px; }
}

/* ── Pagination ──────────────────────────────────────────────── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #f0ebff;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info { font-size: 13px; color: #6b7280; }
.pagination-controls { display: flex; gap: 6px; }

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;

  &:hover:not([disabled]):not(.page-btn--active) {
    background: #f5f3ff;
    border-color: #c4b5fd;
    color: #7c3aed;
  }
  &--active {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(109, 40, 217, 0.3);
  }
  &[disabled] { opacity: 0.4; cursor: not-allowed; }
}

/* ── Transitions ─────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,   .slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>