<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- ── Titre ──────────────────────────────────────────── -->
      <div class="page-header">
        <h1 class="page-title">Abonnements</h1>
      </div>

      <!-- ── Statistiques rapides ───────────────────────────── -->
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-icon">📋</span>
          <div>
            <div class="stat-value">{{ abonnements.length }}</div>
            <div class="stat-label">Total abonnements</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div>
            <div class="stat-value">{{ nbActifs }}</div>
            <div class="stat-label">Actifs</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⚠️</span>
          <div>
            <div class="stat-value">{{ nbExpires }}</div>
            <div class="stat-label">Expirés</div>
          </div>
        </div>
      </div>

      <!-- ── Toasts ─────────────────────────────────────────── -->
      <Transition name="slide-down">
        <div
          v-if="toastMsg"
          :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']"
        >
          <span>{{ toastMsg }}</span>
          <button class="toast-close" @click="toastMsg = null">✕</button>
        </div>
      </Transition>

      <!-- ── Panneau principal ──────────────────────────────── -->
      <div class="table-panel">

        <!-- Barre d'actions -->
        <div class="action-bar">
          <button class="btn btn--primary" @click="goCreate">
            <span>＋</span> Ajouter un abonnement
          </button>
          <button
            class="btn btn--secondary"
            :disabled="!selectedId"
            @click="goEdit"
          >
            ✏️ Modifier abonnement
          </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="loader-wrapper">
          <div class="spinner" />
          <span>Chargement des abonnements…</span>
        </div>

        <!-- Tableau -->
        <div v-else-if="abonnements.length > 0" class="table-wrapper">
          <table class="tiers-table">
            <thead>
              <tr>
                <th></th>
                <th>SOCIÉTÉ</th>
                <th>TARIF</th>
                <th>DURÉE</th>
                <th>DATE DÉBUT</th>
                <th>DATE FIN</th>
                <th>JOURS RESTANTS</th>
                <th>STATUT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ab in abonnements"
                :key="ab.idAbonnement"
                :class="{ selected: selectedId === ab.idAbonnement }"
                @click="selectRow(ab.idAbonnement)"
              >
                <!-- Avatar -->
                <td class="td-avatar">
                  <div class="avatar">
                    {{ initiales(ab.societe?.nomSociete ?? '?') }}
                  </div>
                </td>

                <!-- Société -->
                <td class="td-name">
                  <span class="tier-name">{{ ab.societe?.nomSociete ?? '—' }}</span>
                </td>

                <!-- Tarif -->
                <td>
                  <span class="badge badge--purple">{{ ab.tarif?.nomTarif ?? '—' }}</span>
                </td>

                <!-- Durée -->
                <td>
                  <span class="badge badge--blue">{{ ab.duree }}</span>
                </td>

                <!-- Date début -->
                <td class="td-date">{{ formatDate(ab.dateDebut) }}</td>

                <!-- Date fin -->
                <td class="td-date">{{ formatDate(ab.dateFin) }}</td>

                <!-- Jours restants -->
                <td>
                  <span :class="['badge', joursClass(ab)]">
                    {{ ab.joursRestants !== null ? ab.joursRestants + ' j' : '—' }}
                  </span>
                </td>

                <!-- Statut -->
                <td>
                  <span :class="['badge', ab.isActif ? 'badge--actif' : 'badge--expire']">
                    {{ ab.isActif ? 'Actif' : 'Expiré' }}
                  </span>
                </td>

                <!-- Action -->
                <td class="td-action">
                  <button class="link-btn" @click.stop="editRow(ab.idAbonnement)">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vide -->
        <div v-else class="empty-state">
          <p>Aucun abonnement trouvé. Commencez par en créer un.</p>
        </div>

      </div>

      <!-- ── Modal confirmation suppression ────────────────── -->
      <Transition name="fade">
        <div v-if="confirmTarget" class="modal-overlay" @click.self="confirmTarget = null">
          <div class="modal">
            <div class="modal-icon">🗑️</div>
            <h3 class="modal-title">Supprimer cet abonnement ?</h3>
            <p class="modal-body">
              L'abonnement de
              <strong>{{ confirmTarget.societe?.nomSociete }}</strong>
              sera définitivement supprimé.
            </p>
            <div class="modal-actions">
              <button class="btn btn--secondary" @click="confirmTarget = null">Annuler</button>
              <button class="btn btn--danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Suppression…' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useAbonnements } from '@/composables/useAbonnements'
import type { Abonnement } from '@/composables/useAbonnements'

const router = useRouter()

// ── Composable ────────────────────────────────────────────────
const { abonnements, loading, error, fetchAbonnements, deleteAbonnement } = useAbonnements()

// ── Stats ─────────────────────────────────────────────────────
const nbActifs  = computed(() => abonnements.value.filter(a => a.isActif).length)
const nbExpires = computed(() => abonnements.value.filter(a => a.isExpire).length)

// ── Sélection ─────────────────────────────────────────────────
const selectedId = ref<number | null>(null)

function selectRow(id: number): void {
  selectedId.value = selectedId.value === id ? null : id
}

// ── Toast ─────────────────────────────────────────────────────
const toastMsg  = ref<string | null>(null)
const toastType = ref<'success' | 'error'>('success')

function showToast(msg: string, type: 'success' | 'error' = 'success'): void {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = null }, 4000)
}

// ── Suppression ───────────────────────────────────────────────
const confirmTarget = ref<Abonnement | null>(null)
const deleting      = ref(false)

async function doDelete(): Promise<void> {
  if (!confirmTarget.value) return
  deleting.value = true
  try {
    await deleteAbonnement(confirmTarget.value.idAbonnement)
    showToast('Abonnement supprimé avec succès !', 'success')
  } catch {
    showToast('Erreur lors de la suppression.', 'error')
  } finally {
    deleting.value      = false
    confirmTarget.value = null
  }
}

// ── Navigation ────────────────────────────────────────────────
function goCreate(): void { router.push({ name: 'AbonnementsCreate' }) }
function goEdit(): void   { if (selectedId.value) router.push({ name: 'AbonnementEdit', params: { id: selectedId.value } }) }
function editRow(id: number): void { router.push({ name: 'AbonnementEdit', params: { id } }) }

// ── Helpers ───────────────────────────────────────────────────
function initiales(nom: string): string {
  return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function joursClass(ab: Abonnement): string {
  if (ab.isExpire || ab.joursRestants === null) return 'badge--expire'
  if (ab.joursRestants <= 30) return 'badge--warning'
  return 'badge--actif'
}

// ── Chargement initial ────────────────────────────────────────
onMounted(async () => {
  await fetchAbonnements()
  if (error.value) showToast(error.value, 'error')
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

/* ── Layout ─────────────────────────────────────────────────── */
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

/* ── Header ─────────────────────────────────────────────────── */
.page-header { display: flex; align-items: center; justify-content: space-between; }

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

/* ── Stats bar ──────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  border-radius: 14px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.25);
}

.stat-icon  { font-size: 24px; }
.stat-value { font-size: 22px; font-weight: 700; line-height: 1; }
.stat-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }

/* ── Toast ──────────────────────────────────────────────────── */
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

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
  &:hover { opacity: 1; background: rgba(0,0,0,0.06); }
}

/* ── Panneau ─────────────────────────────────────────────────── */
.table-panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(109, 40, 217, 0.07);
  overflow: hidden;
}

/* ── Barre d'actions ────────────────────────────────────────── */
.action-bar {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ebff;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-family: inherit;

  &--primary {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    box-shadow: 0 3px 10px rgba(109, 40, 217, 0.3);
    &:hover { opacity: 0.9; transform: translateY(-1px); }
  }

  &--secondary {
    background: #f5f3ff;
    color: #6d28d9;
    border: 1px solid #ddd6fe;
    &:hover:not([disabled]) { background: #ede9fe; }
    &[disabled] { opacity: 0.45; cursor: not-allowed; }
  }

  &--danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #fff;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.55; cursor: not-allowed; }
  }
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

/* ── Tableau ─────────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }

.tiers-table {
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background: #faf9ff;
    border-bottom: 1px solid #ede9fe;
  }

  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #8b5cf6;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  tbody tr {
    border-bottom: 1px solid #f5f3ff;
    cursor: pointer;
    transition: background 0.15s;

    &:hover      { background: #faf9ff; }
    &:last-child { border-bottom: none; }

    &.selected {
      background: #f5f3ff;
      td { color: #4c1d95; }
    }
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #374151;
    vertical-align: middle;
  }
}

/* ── Cellules ────────────────────────────────────────────────── */
.td-avatar { width: 52px; }

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.td-name {
  .tier-name { display: block; font-weight: 600; color: #1e1b4b; }
}

.td-date {
  font-size: 13px;
  color: #6b7280;
}

.td-action { white-space: nowrap; }

/* ── Badges ──────────────────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  &--purple  { background: #f5f3ff; color: #5b21b6; }
  &--blue    { background: #e0f2fe; color: #0369a1; }
  &--actif   { background: #dcfce7; color: #166534; }
  &--expire  { background: #fee2e2; color: #991b1b; }
  &--warning { background: #fef9c3; color: #854d0e; }
}

.link-btn {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  &:hover { text-decoration: underline; }
}

/* ── État vide ───────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #9ca3af;
  font-size: 14px;
}

/* ── Modal ───────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 18px;
  padding: 32px 36px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.modal-icon  { font-size: 36px; margin-bottom: 12px; }
.modal-title { font-size: 18px; font-weight: 700; color: #1e1b4b; margin: 0 0 8px; }
.modal-body  { font-size: 14px; color: #6b7280; margin: 0 0 24px; }

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* ── Transitions ─────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { opacity: 0; transform: translateY(-12px); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }
</style>