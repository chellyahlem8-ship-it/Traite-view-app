<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- ── Toast ──────────────────────────────────────────── -->
      <Transition name="slide-down">
        <div v-if="toastMsg" :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']">
          <span>{{ toastMsg }}</span>
          <button class="toast-close" @click="toastMsg = null">✕</button>
        </div>
      </Transition>

      <!-- ══════════════════════════════════════════════════════
           MODE LISTE
      ══════════════════════════════════════════════════════ -->
      <template v-if="mode === 'list'">
        <div class="page-header">
          <h1 class="page-title">Utilisateurs</h1>
        </div>

        <!-- Stats -->
        <div class="stats-bar">
          <div class="stat-card stat-card--total">
            <span class="stat-icon">👥</span>
            <div>
              <div class="stat-value">{{ utilisateurs.length }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
          <div class="stat-card stat-card--admin">
            <span class="stat-icon">🛡️</span>
            <div>
              <div class="stat-value">{{ countRole('super') + countRole('admin') }}</div>
              <div class="stat-label">Admins</div>
            </div>
          </div>
          <div class="stat-card stat-card--user">
            <span class="stat-icon">👤</span>
            <div>
              <div class="stat-value">{{ countRole('user') + countRole('gestionnaire') + countRole('comptable') + countRole('commercial') }}</div>
              <div class="stat-label">Utilisateurs</div>
            </div>
          </div>
        </div>

        <!-- Panneau tableau -->
        <div class="table-panel">
          <!-- Barre d'action -->
          <div class="action-bar">

            <!-- Recherche -->
            <div class="search-wrapper">
              <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
              <input v-model="search" type="text" class="search-input" placeholder="Chercher…" />
            </div>
            <!-- Nouveau utilisateur -->
            <button class="btn-new" @click="openCreate">
              ＋ Nouveau utilisateur
            </button>
          </div>

          <!-- Loader -->
          <div v-if="loading" class="loader-wrapper">
            <div class="spinner"></div>
            <span>Chargement des utilisateurs…</span>
          </div>

          <!-- Tableau -->
          <div v-else-if="filtered.length > 0" class="table-wrapper">
            <table class="u-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>role</th>
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in paginated" :key="u.idUtilisateur">
                  <td><input type="checkbox" /></td>
                  <td class="td-id">{{ u.idUtilisateur }}</td>
                  <td class="td-name">{{ u.nom }} {{ u.prenom }}</td>
                  <td class="td-email">{{ u.email }}</td>
                  <td class="td-role">
                    <span :class="['role-badge', `role-badge--${u.role}`]">{{ u.role }}</span>
                  </td>
                  <td class="td-actions">
                    <button class="icon-btn icon-btn--edit" title="Modifier" @click="openEdit(u)">
                      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                    </button>
                    <button class="icon-btn icon-btn--delete" title="Supprimer" @click="confirmDelete(u)">
                      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vide -->
          <div v-else class="empty-state">
            <p>{{ search ? 'Aucun résultat pour "' + search + '".' : 'Aucun utilisateur. Créez-en un.' }}</p>
          </div>

          <!-- Pagination -->
          <div v-if="filtered.length > 0" class="pagination-bar">
            <span class="pagination-info">Showing {{ pageStart + 1 }} to {{ pageEnd }} of {{ filtered.length }} entries</span>
            <div class="pagination-controls">
              <button class="page-btn" :disabled="page === 1" @click="page--">‹</button>
              <button
                v-for="p in totalPages" :key="p"
                class="page-btn" :class="{ active: page === p }"
                @click="page = p"
              >{{ p }}</button>
              <button class="page-btn" :disabled="page === totalPages" @click="page++">›</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════
           MODE FORMULAIRE (créer / modifier)
      ══════════════════════════════════════════════════════ -->
      <template v-else>
        <div class="form-page">

          <Transition name="toast">
            <div v-if="showSuccessToast" class="toast toast--success">
              <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              <span>{{ mode === 'create' ? 'Utilisateur créé avec succès !' : 'Utilisateur mis à jour !' }}</span>
            </div>
          </Transition>
          <Transition name="toast">
            <div v-if="generalError" class="toast toast--error">
              <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              <span>{{ generalError }}</span>
            </div>
          </Transition>

          <FormCreerUtilisateur
            v-model="formData"
            :loading="loading"
            :errors="errors"
            :societes="societes"
            :edit-mode="mode === 'edit'"
            @submit="handleSubmit"
            @cancel="backToList"
          />
        </div>
      </template>

    </main>

    <!-- ── Modal confirmation suppression ──────────────────── -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal-card">
          <div class="modal-icon">🗑️</div>
          <h3 class="modal-title">Supprimer l'utilisateur ?</h3>
          <p class="modal-body">
            Vous allez supprimer <strong>{{ deleteTarget.nom }} {{ deleteTarget.prenom }}</strong>.
            Cette action est irréversible.
          </p>
          <div class="modal-actions">
            <button class="btn btn--danger" :disabled="loading" @click="doDelete">
              {{ loading ? 'Suppression…' : 'Supprimer' }}
            </button>
            <button class="btn btn--outline" @click="deleteTarget = null">Annuler</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import FormCreerUtilisateur from '@/components/FormCreerUtilisateur.vue'
import type { UtilisateurFormData, UtilisateurFormErrors } from '@/components/FormCreerUtilisateur.vue'
import { useUtilisateurs } from '@/composables/useUtilisateurs'
import type { Utilisateur } from '@/types/utilisateurs'

// ── Composable ────────────────────────────────────────────────
const {
  formState, errors: rawErrors, loading, success, generalError,
  societes, utilisateurs,
  createUtilisateur, updateUtilisateur, deleteUtilisateur,
  fetchUtilisateurs, resetForm, fillForm,
} = useUtilisateurs()

// ── Mode d'affichage ──────────────────────────────────────────
type Mode = 'list' | 'create' | 'edit'
const mode          = ref<Mode>('list')
const editTarget    = ref<Utilisateur | null>(null)
const deleteTarget  = ref<Utilisateur | null>(null)

// ── Toast ─────────────────────────────────────────────────────
const toastMsg  = ref<string | null>(null)
const toastType = ref<'success' | 'error'>('success')
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = null }, 3500)
}

// ── Recherche + pagination ────────────────────────────────────
const search   = ref('')
const page     = ref(1)
const perPage  = 10

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return utilisateurs.value
  return utilisateurs.value.filter(u =>
    `${u.nom} ${u.prenom} ${u.email} ${u.role}`.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const pageStart  = computed(() => (page.value - 1) * perPage)
const pageEnd    = computed(() => Math.min(pageStart.value + perPage, filtered.value.length))
const paginated  = computed(() => filtered.value.slice(pageStart.value, pageEnd.value))

watch(search, () => { page.value = 1 })

// ── Helpers stats ─────────────────────────────────────────────
function countRole(r: string) {
  return utilisateurs.value.filter(u => u.role === r).length
}

// ── Form data (v-model bridge) ────────────────────────────────
const formData = computed<UtilisateurFormData>({
  get: () => ({
    nom:        formState.nom,
    prenom:     formState.prenom,
    role:       formState.role,
    email:      formState.email,
    motDePasse: formState.motDePasse,
    idSociete:  formState.idSociete,
  }),
  set: (val: UtilisateurFormData) => {
    formState.nom        = val.nom
    formState.prenom     = val.prenom
    formState.role       = val.role
    formState.email      = val.email
    formState.motDePasse = val.motDePasse
    formState.idSociete  = val.idSociete
  },
})

const errors = computed<UtilisateurFormErrors>(() => rawErrors)
const showSuccessToast = computed(() => success.value)

// ── Actions ───────────────────────────────────────────────────
function openCreate() {
  resetForm()
  editTarget.value = null
  mode.value = 'create'
}

function openEdit(u: Utilisateur) {
  editTarget.value = u
  fillForm(u)
  mode.value = 'edit'
}

function backToList() {
  mode.value = 'list'
  resetForm()
  editTarget.value = null
}

async function handleSubmit() {
  if (mode.value === 'create') {
    await createUtilisateur()
    if (success.value) {
      setTimeout(() => {
        backToList()
        fetchUtilisateurs()
        showToast('Utilisateur créé avec succès !')
      }, 1200)
    }
  } else if (mode.value === 'edit' && editTarget.value) {
    await updateUtilisateur(editTarget.value.idUtilisateur)
    if (success.value) {
      setTimeout(() => {
        backToList()
        fetchUtilisateurs()
        showToast('Utilisateur mis à jour !')
      }, 1200)
    }
  }
}

function confirmDelete(u: Utilisateur) {
  deleteTarget.value = u
}

async function doDelete() {
  if (!deleteTarget.value) return
  await deleteUtilisateur(deleteTarget.value.idUtilisateur)
  deleteTarget.value = null
  showToast('Utilisateur supprimé.')
}

// ── Init ──────────────────────────────────────────────────────
onMounted(() => fetchUtilisateurs())
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Layout ────────────────────────────────────────────────── */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f7ff;
  font-family: 'Outfit', sans-serif;
}

.page-content {
  flex: 1;
  margin-left: 240px;
  padding: 32px 28px;
  min-height: 100vh;
  position: relative;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 72px 16px 24px;
  }
}

/* ── Header ────────────────────────────────────────────────── */
.page-header { margin-bottom: 20px; }
.page-title  { font-size: 22px; font-weight: 700; color: #1e1b4b; margin: 0; }

/* ── Stats ─────────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid #ede9fe;
  background: #fff;
  box-shadow: 0 1px 4px rgba(91,33,182,.07);
  min-width: 140px;

  .stat-icon  { font-size: 24px; }
  .stat-value { font-size: 20px; font-weight: 700; color: #1e1b4b; }
  .stat-label { font-size: 11px; color: #8b5cf6; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }

  &--total { border-left: 3px solid #7c3aed; }
  &--admin { border-left: 3px solid #dc2626; }
  &--user  { border-left: 3px solid #059669; }
}

/* ── Toast (liste) ─────────────────────────────────────────── */
.toast {
  position: fixed; top: 24px; right: 24px; z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,.12); max-width: 360px;

  &--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  &--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
}
.toast-close { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; margin-left:auto; padding:0 0 0 8px; }
.toast-icon  { width:18px; height:18px; flex-shrink:0; }

/* ── Panneau tableau ───────────────────────────────────────── */
.table-panel {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ede9fe;
  box-shadow: 0 2px 12px rgba(91,33,182,.06);
  overflow: hidden;
}

/* ── Barre d'actions ───────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f3ff;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 160px;
  max-width: 340px;
}
.search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px; color: #a1a1aa; pointer-events: none;
}
.search-input {
  width: 100%; padding: 9px 12px 9px 34px;
  border: 1.5px solid #ddd6fe; border-radius: 8px;
  font-size: 13px; outline: none; background: #fafafa;
  font-family: inherit; box-sizing: border-box;
  &:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
}

.btn-new {
  margin-left: auto;
  padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 700;
  background: #7c3aed; color: #fff; border: none; cursor: pointer;
  white-space: nowrap; box-shadow: 0 2px 8px rgba(124,58,237,.3);
  transition: all .15s;
  &:hover { background: #6d28d9; transform: translateY(-1px); }
}

/* ── Loader ────────────────────────────────────────────────── */
.loader-wrapper {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 24px; color: #7c3aed; font-size: 14px;
}
.spinner {
  width: 24px; height: 24px;
  border: 3px solid #ede9fe; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tableau ───────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }

.u-table {
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background: #faf9ff;
    border-bottom: 2px solid #ede9fe;
  }

  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 12px; font-weight: 700;
    color: #374151; letter-spacing: .04em;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid #f5f3ff;
    transition: background .12s;
    &:hover { background: #faf9ff; }
    &:last-child { border-bottom: none; }
  }

  td {
    padding: 13px 16px;
    font-size: 14px; color: #374151;
    vertical-align: middle;
  }
}

.td-id    { font-weight: 600; color: #6b7280; font-size: 13px; }
.td-name  { font-weight: 600; color: #1e1b4b; }
.td-email { color: #4b5563; }

/* Rôle badge */
.role-badge {
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700; text-transform: lowercase; letter-spacing: .02em;
  background: #f3f4f6; color: #374151;

  &--super   { background: #fef3c7; color: #92400e; }
  &--admin   { background: #fee2e2; color: #991b1b; }
  &--gestionnaire { background: #dbeafe; color: #1e40af; }
  &--comptable    { background: #d1fae5; color: #065f46; }
  &--commercial   { background: #ede9fe; color: #5b21b6; }
  &--user    { background: #f3f4f6; color: #374151; }
}

/* Actions icônes */
.td-actions { white-space: nowrap; display: flex; gap: 8px; align-items: center; }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
  svg { width: 16px; height: 16px; }

  &--edit {
    background: #f5f3ff; color: #7c3aed;
    &:hover { background: #ede9fe; }
  }
  &--delete {
    background: #fef2f2; color: #dc2626;
    &:hover { background: #fee2e2; }
  }
}

/* ── Vide ──────────────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 60px 24px;
  color: #9ca3af; font-size: 14px;
}

/* ── Pagination ────────────────────────────────────────────── */
.pagination-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-top: 1px solid #f5f3ff;
  font-size: 13px; color: #6b7280; flex-wrap: wrap; gap: 10px;
}

.pagination-controls { display: flex; gap: 6px; }

.page-btn {
  min-width: 32px; height: 32px; padding: 0 10px;
  border-radius: 8px; border: 1.5px solid #ddd6fe;
  background: #fff; color: #374151; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .12s;
  &:hover:not(:disabled):not(.active) { border-color: #7c3aed; color: #7c3aed; }
  &.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
  &:disabled { opacity: .4; cursor: not-allowed; }
}

/* ── Page formulaire ───────────────────────────────────────── */
.form-page {
  min-height: calc(100vh - 64px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 16px;
  position: relative;
}

/* ── Modal suppression ─────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9998;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

.modal-card {
  background: #fff; border-radius: 16px;
  padding: 32px 28px; max-width: 400px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  text-align: center;
}

.modal-icon  { font-size: 40px; margin-bottom: 12px; }
.modal-title { font-size: 18px; font-weight: 700; color: #1e1b4b; margin: 0 0 10px; }
.modal-body  { font-size: 14px; color: #6b7280; margin: 0 0 24px; line-height: 1.5; }
.modal-actions { display: flex; gap: 12px; }

.btn {
  flex: 1; padding: 11px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer; border: none;
  font-family: inherit; transition: all .15s;
  &--danger  { background: #dc2626; color: #fff; &:hover { background: #b91c1c; } }
  &--outline { background: #fff; color: #6b7280; border: 1.5px solid #ddd6fe; &:hover { border-color: #7c3aed; color: #7c3aed; } }
  &:disabled { opacity: .55; cursor: not-allowed; }
}

/* ── Transitions ───────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-12px); }

.toast-enter-active, .toast-leave-active { transition: all .3s cubic-bezier(.4,0,.2,1); }
.toast-enter-from { opacity: 0; transform: translateY(-12px) scale(.97); }
.toast-leave-to   { opacity: 0; transform: translateY(-8px)  scale(.97); }

.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-active .modal-card, .modal-leave-active .modal-card { transition: transform .2s ease; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card       { transform: scale(.95); }
</style>