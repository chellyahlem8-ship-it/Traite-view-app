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
        <!-- Total traites : nombre uniquement, pas de montant -->
        <div class="stat-card stat-card--total">
          <span class="stat-icon">📄</span>
          <div>
            <div class="stat-value">{{ traites.length }}</div>
            <div class="stat-label">Total traites</div>
          </div>
        </div>

        <!-- Trésorerie : +client -fournisseur -->
        <div class="stat-card stat-card--tresorerie">
          <span class="stat-icon">🏦</span>
          <div>
            <div class="stat-value" :class="tresorerie >= 0 ? 'val-positive' : 'val-negative'">
              {{ formatMontant(Math.abs(tresorerie)) }}
            </div>
            <div class="stat-label">Trésorerie</div>
            <div class="stat-sub">{{ tresorerie >= 0 ? '▲ Encaissements nets' : '▼ Décaissements nets' }}</div>
          </div>
        </div>

        <!-- Cartes par statut : nombre de traites uniquement (pas de montant) -->
        <div
          v-for="st in statuts"
          :key="st.id"
          class="stat-card stat-card--dynamic"
          :class="getStatCardClass(st.statut)"
        >
          <span class="stat-icon">{{ getStatIcon(st.statut) }}</span>
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

      <!-- ── Modal Modifier Statut d'une Traite ──────────────────────── -->
      <Transition name="fade">
        <div v-if="showEditStatutModal" class="modal-overlay" @click.self="closeEditStatutModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3 class="modal-title">Modifier le statut de la traite</h3>
              <button class="modal-close-btn" @click="closeEditStatutModal">✕</button>
            </div>
            <p class="modal-subtitle">
              Traite #{{ editingTraite?.id }} —
              <strong>{{ formatMontant(editingTraite?.montant ?? 0) }}</strong>
            </p>
            <!-- UTILISATION DE LA LISTE FILTRÉE ICI -->
            <div class="statut-options">
              <label
                v-for="st in availableStatutsForEdit"
                :key="st.id"
                class="statut-option"
                :class="{ 'statut-option--selected': editingStatutId === st.id }"
                @click="editingStatutId = st.id"
              >
                <input
                  type="radio"
                  :value="st.id"
                  v-model="editingStatutId"
                  class="statut-radio"
                />
                <span :class="['badge-statut', getBadgeClass(st.statut)]">
                  <span class="badge-dot"></span>
                  {{ st.statut }}
                </span>
              </label>
            </div>
            <div class="modal-actions">
              <button class="btn btn--secondary-outline" @click="closeEditStatutModal">Annuler</button>
              <button
                class="btn btn--primary"
                :disabled="!editingStatutId || savingEditStatut"
                @click="saveEditStatut"
              >
                {{ savingEditStatut ? 'Enregistrement…' : 'Enregistrer' }}
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

                <td class="td-montant">
                  <span class="montant-value">{{ formatMontant(traite.montant) }}</span>
                </td>

                <td class="td-date">{{ formatDate(traite.date_emission) }}</td>

                <td class="td-date">
                  <span :class="['echeance-text', isOverdue(traite) ? 'echeance--overdue' : '']">
                    {{ formatDate(traite.date_echeance) }}
                    <span v-if="isOverdue(traite)" class="overdue-badge">En retard</span>
                  </span>
                </td>

                <td class="td-banque">
                  <span v-if="getBanqueName(traite)" class="banque-chip">
                    🏦 {{ getBanqueName(traite) }}
                  </span>
                  <span v-else class="no-data">—</span>
                </td>

                <td class="td-tiers">
                  <span v-if="traite.tireur">{{ traite.tireur.raison_sociale }}</span>
                  <span v-else class="no-data">—</span>
                </td>

                <td class="td-etat" @click.stop>
                  <div class="etat-cell">
                    <span :class="['badge-statut', getBadgeClassForTraite(traite)]">
                      <span class="badge-dot"></span>
                      {{ getDisplayLabel(traite) }}
                    </span>
                    <button
                      class="edit-statut-btn"
                      title="Modifier le statut"
                      @click.stop="openEditStatut(traite)"
                    >
                      ✏️
                    </button>
                  </div>
                </td>

                <td class="td-type">
                  <span :class="['badge-type', traite.type_traite === 'client' ? 'badge-type--client' : 'badge-type--fournisseur']">
                    {{ traite.type_traite === 'client' ? '👤 Client' : '🏭 Fournisseur' }}
                  </span>
                </td>

                <td class="td-action" @click.stop>
                  <button class="link-btn" @click="editTraite(traite)">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <p>Aucune traite trouvée.</p>
          <span>Modifiez vos filtres ou ajoutez une nouvelle traite.</span>
        </div>

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
import { fetchTraites, fetchStatuts, fetchComptesBancaires } from '@/api/traite.api'
import { banquesApi } from '@/api/banques.api'
import type { StatutTraite } from '@/types/traite.types'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface BanqueRaw {
  id?: number
  nomBanque?: string
  nom_banque?: string
  nom?: string
  name?: string
}

interface CompteBancaireRaw {
  id?: number
  rib?: string
  banque?: BanqueRaw
  banques_id?: number
}

interface StatutTraiteRaw {
  id: number
  statut: string
}

interface TraiteAPI {
  id: number
  montant: number
  type_traite: 'fournisseur' | 'client'
  date_emission: string
  date_echeance: string
  comptes_bancaires_id: number
  statuts_traites_id: number
  tireur_id?: number
  tireur_type?: string
  compteBancaire?: CompteBancaireRaw
  compte_bancaire?: CompteBancaireRaw
  statutTraite?: StatutTraiteRaw
  statut_traite?: StatutTraiteRaw
  tireur?: { id: number; raison_sociale: string }
}

const traites        = ref<TraiteAPI[]>([])
const statuts        = ref<StatutTraite[]>([])
const allBanques     = ref<BanqueRaw[]>([])
const allComptes     = ref<CompteBancaireRaw[]>([])

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

const showEditStatutModal = ref(false)
const editingTraite       = ref<TraiteAPI | null>(null)
const editingStatutId     = ref<number | null>(null)
const savingEditStatut    = ref(false)

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

// ── LOGIQUE CORRIGÉE : Filtrage des statuts pour la modal ─────────────────────
// Règle 2 : Client = (En caisse, Impayée, Non échue) | Fournisseur = (Payée, Impayée, Non échue)
const availableStatutsForEdit = computed(() => {
  if (!editingTraite.value) return []

  const type = editingTraite.value.type_traite
  const allowedLabels = type === 'client' 
    ? ['En caisse', 'Impayée', 'Non échue'] 
    : ['Payée', 'Impayée', 'Non échue']

  // On filtre la liste complète des statuts venant de la base
  return statuts.value.filter(s => allowedLabels.includes(s.statut))
})

function getBanqueName(traite: TraiteAPI): string | null {
  const cbEager = traite.compteBancaire ?? traite.compte_bancaire
  if (cbEager?.banque) {
    return cbEager.banque.nomBanque ?? cbEager.banque.nom_banque ?? cbEager.banque.nom ?? cbEager.banque.name ?? null
  }
  const compte = allComptes.value.find(c => c.id === traite.comptes_bancaires_id)
  if (compte?.banque) {
    return compte.banque.nomBanque ?? compte.banque.nom_banque ?? compte.banque.nom ?? null
  }
  if (compte && (compte as any).banques_id) {
    const banque = allBanques.value.find(b => b.id === (compte as any).banques_id)
    if (banque) return banque.nomBanque ?? banque.nom ?? null
  }
  return null
}

// ── Comptage par statut (nombre uniquement) ──
function countByStatut(id: number): number {
  return traites.value.filter(t => t.statuts_traites_id === id).length
}

// ── Trésorerie : +client, -fournisseur ──
const tresorerie = computed(() =>
  traites.value
    .filter(t => {
      const rel = t.statutTraite ?? t.statut_traite
      const label = (rel as any)?.statut ?? ''
      const s = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      // Réglé = "payée" (fourn) ou "en caisse" (client) — hors "non", "impay", "annul"
      if (s.includes('impay') || s.includes('non') || s.includes('annul')) return false
      return s.startsWith('pay') || s.includes('caisse')
    })
    .reduce((sum, t) => {
      const m = Number(t.montant)
      return sum + (t.type_traite === 'client' ? m : -m)
    }, 0)
)

function getRawStatutLabel(traite: TraiteAPI): string {
  const rel = traite.statutTraite ?? traite.statut_traite
  if (rel?.statut) return rel.statut
  if (traite.statuts_traites_id) {
    const found = statuts.value.find(s => s.id === traite.statuts_traites_id)
    if (found) return found.statut
  }
  return 'Non échue'
}

function isOverdue(traite: TraiteAPI): boolean {
  const label = getRawStatutLabel(traite)
  const s = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (s.includes('pay') && !s.includes('non')) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(traite.date_echeance) < today
}

function getDisplayLabel(traite: TraiteAPI): string {
  return getRawStatutLabel(traite)
}

function getBadgeClass(statut: string): string {
  const s = statut.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (s.includes('caisse'))                                               return 'badge-statut--caisse'
  if (s.includes('pay') && !s.includes('non') && !s.includes('im'))      return 'badge-statut--success'
  if (s.includes('impay') || s.includes('impaye'))                        return 'badge-statut--danger'
  if (s.includes('echu') && !s.includes('non'))                           return 'badge-statut--info'
  if (s.includes('non') && s.includes('echu'))                            return 'badge-statut--warning'
  return 'badge-statut--warning'
}

function getBadgeClassForTraite(traite: TraiteAPI): string {
  return getBadgeClass(getDisplayLabel(traite))
}

function getStatIcon(statut: string): string {
  const s = statut.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (s.includes('caisse'))                                          return '🏦'
  if (s.includes('pay') && !s.includes('non') && !s.includes('im')) return '✅'
  if (s.includes('impay'))                                           return '❌'
  if (s.includes('echu') && !s.includes('non'))                      return '🚨'
  if (s.includes('non') && s.includes('echu'))                       return '⏳'
  return '🏷'
}

function getStatCardClass(statut: string): string {
  const s = statut.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (s.includes('caisse'))                                          return 'stat-card--caisse'
  if (s.includes('pay') && !s.includes('non') && !s.includes('im')) return 'stat-card--payee'
  if (s.includes('impay'))                                           return 'stat-card--impayee'
  if (s.includes('echu') && !s.includes('non'))                      return 'stat-card--echue'
  return 'stat-card--non-echue'
}

function getToken(): string | null {
  return localStorage.getItem('traity_token') || localStorage.getItem('auth_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function loadAll() {
  loading.value = true
  try {
    const [traiteRes, statutRes] = await Promise.all([
      fetchTraites(),
      fetchStatuts(),
    ])
    statuts.value = statutRes.data
    traites.value = traiteRes.data as TraiteAPI[]

    const [banquesRes, comptesRes] = await Promise.all([
      banquesApi.getAll(),
      fetchComptesBancaires(),
    ])
    allBanques.value = banquesRes.data as BanqueRaw[]
    allComptes.value = comptesRes.data as CompteBancaireRaw[]

  } catch (e) {
    console.error(e)
    showToast('Erreur lors du chargement des données.', 'error')
  } finally {
    loading.value = false
  }
}

function openEditStatut(traite: TraiteAPI) {
  editingTraite.value    = traite
  editingStatutId.value  = traite.statuts_traites_id
  showEditStatutModal.value = true
}

function closeEditStatutModal() {
  showEditStatutModal.value = false
  editingTraite.value       = null
  editingStatutId.value     = null
}

async function saveEditStatut() {
  if (!editingTraite.value || !editingStatutId.value) return
  savingEditStatut.value = true

  try {
    // ✅ Utiliser PUT /traites/{id} avec statuts_traites_id — persiste en base
    const res = await fetch(`${API_BASE_URL}/traites/${editingTraite.value.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ statuts_traites_id: editingStatutId.value }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur serveur' }))
      throw new Error(err.message || 'Erreur serveur')
    }

    // Mettre à jour localement sans recharger
    const foundStatut = statuts.value.find(s => s.id === editingStatutId.value)
    const idx = traites.value.findIndex(t => t.id === editingTraite.value!.id)
    if (idx !== -1) {
      traites.value = traites.value.map((t, i) => {
        if (i !== idx) return t
        return {
          ...t,
          statuts_traites_id: editingStatutId.value!,
          statutTraite:  foundStatut ? { id: foundStatut.id, statut: foundStatut.statut } : t.statutTraite,
          statut_traite: foundStatut ? { id: foundStatut.id, statut: foundStatut.statut } : t.statut_traite,
        }
      })
    }

    showToast('Statut mis à jour avec succès.', 'success')
    closeEditStatutModal()
  } catch (err: any) {
    showToast(err.message || 'Erreur lors de la mise à jour.', 'error')
  } finally {
    savingEditStatut.value = false
  }
}

const filteredTraites = computed(() => {
  let list = [...traites.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.tireur?.raison_sociale?.toLowerCase().includes(q) ||
      getBanqueName(t)?.toLowerCase().includes(q)        ||
      String(t.montant).includes(q)
    )
  }

  if (filterStatutId.value !== '')
    list = list.filter(t => t.statuts_traites_id === Number(filterStatutId.value))

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

async function cancelSelected() {
  if (!selectedIds.value.length) return
  try {
    await Promise.all(
      selectedIds.value.map(id =>
        fetch(`${API_BASE_URL}/traites/${id}/status`, {
          method: 'PATCH',
          headers: authHeaders(),
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

function sortBy(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

function goToCreate() {
  router.push({ name: 'TraitesCreate' })
}

function editTraite(t: TraiteAPI) {
  router.push({ name: 'TraitesEdit', params: { id: t.id } })
}

function openAddStatut() {
  router.push({ name: 'CreateStatutTraite' })
}

function formatMontant(n: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  }).format(n)
}

function formatDate(d: string): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
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

/* ── Stats ─────────────────────────────────────────────────── */
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
  min-width: 130px;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
  flex: 1;

  &--total       { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
  &--tresorerie  { background: linear-gradient(135deg, #0891b2, #0e7490); }
  &--payee       { background: linear-gradient(135deg, #059669, #047857); }
  &--non-echue   { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
  &--echue       { background: linear-gradient(135deg, #dc2626, #b91c1c); }
  &--impayee     { background: linear-gradient(135deg, #dc2626, #b91c1c); }
  &--dynamic     { background: linear-gradient(135deg, #0891b2, #0e7490); }
  &--caisse { background: linear-gradient(135deg, #0891b2, #0e7490); }
}

.stat-icon  { font-size: 22px; }
.stat-value {
  font-size: 20px; font-weight: 700; line-height: 1;
  &.val-positive { color: #6ee7b7; }
  &.val-negative { color: #fca5a5; }
}
.stat-label { font-size: 11px; opacity: 0.85; margin-top: 3px; text-transform: capitalize; }
.stat-sub   { font-size: 10px; opacity: 0.75; margin-top: 2px; }

/* ── Toast ─────────────────────────────────────────────────── */
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

/* ── Modal ─────────────────────────────────────────────────── */
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
  max-width: 440px;
  box-shadow: 0 8px 32px rgba(109,40,217,0.18);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 6px;
  &:hover { background: #f3f4f6; color: #374151; }
}

.modal-subtitle {
  margin: -8px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.statut-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.statut-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 2px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #ddd6fe; background: #faf9ff; }
  &--selected { border-color: #8b5cf6; background: #f5f3ff; }
}

.statut-radio { display: none; }

/* ── Panneau ─────────────────────────────────────────────── */
.table-panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(109, 40, 217, 0.07);
  overflow: hidden;
}

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

.badge-statut {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Outfit', sans-serif;
  &--caisse {
  background: #ecfeff; color: #164e63; border: 1px solid #a5f3fc;
  .badge-dot { background: #06b6d4; }
}

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &--success {
    background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;
    .badge-dot { background: #10b981; }
  }
  &--danger {
    background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;
    .badge-dot { background: #ef4444; }
  }
  &--info {
    background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;
    .badge-dot { background: #3b82f6; }
  }
  &--warning {
    background: #fffbeb; color: #92400e; border: 1px solid #fde68a;
    .badge-dot { background: #f59e0b; }
  }
}

.badge-type {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;

  &--client      { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  &--fournisseur { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
}

.etat-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.edit-statut-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 3px 5px;
  border-radius: 6px;
  opacity: 0.55;
  transition: opacity 0.15s, background 0.15s;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: #ede9fe;
  }
}

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

.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #9ca3af;
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  p    { font-size: 15px; font-weight: 600; color: #6b7280; margin: 0 0 6px; }
  span { font-size: 13px; }
}

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

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,   .slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>