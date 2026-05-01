<template>
  <div class="page-layout">
    <Sidebar />

    <main class="page-content">

      <!-- Loader initial -->
      <div v-if="loadingInit" class="loader-wrapper">
        <div class="spinner"></div>
        <span>Chargement de la société…</span>
      </div>

      <template v-else>

        <!-- Toast succès -->
        <Transition name="slide-down">
          <div v-if="successMsg" class="toast toast--success">
            <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ successMsg }}</span>
          </div>
        </Transition>
        <Transition name="slide-down">
          <div v-if="errorMsg" class="toast toast--error">
            <span>{{ errorMsg }}</span>
            <button class="toast-close" @click="errorMsg = null">✕</button>
          </div>
        </Transition>

        <!-- ═══ MODAL CONFIRMATION SUPPRESSION COMPTE ═══ -->
        <Transition name="modal-fade">
          <div v-if="confirmDeleteId !== null" class="modal-overlay" @click.self="confirmDeleteId = null">
            <div class="modal-card modal-card--danger">
              <div class="modal-header">
                <span class="modal-icon-danger">🗑️</span>
                <div>
                  <h3 class="modal-title">Supprimer ce compte bancaire ?</h3>
                  <p class="modal-subtitle">Cette action est irréversible.</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn--danger" :disabled="deletingCB" @click="handleDeleteCB">
                  <span v-if="deletingCB" class="btn-spinner btn-spinner--white"></span>
                  {{ deletingCB ? 'Suppression…' : '🗑️ Supprimer' }}
                </button>
                <button class="btn btn--secondary" @click="confirmDeleteId = null">Annuler</button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- ═══ SOCIÉTÉ DÉJÀ CRÉÉE ═══ -->
        <template v-if="societe">
          <!-- Carte info société -->
          <div class="societe-card">
            <div class="societe-card-header">
              <div class="societe-avatar">{{ initiales(societe.raisonSociale) }}</div>
              <div>
                <h2 class="societe-name">{{ societe.raisonSociale }}</h2>
                <span class="societe-badge">Ma Société</span>
              </div>
              <button class="btn-edit-icon" @click="startEdit" title="Modifier">✏️</button>
            </div>

            <div class="societe-info-grid">
              <div class="info-item" v-if="societe.email">
                <span class="info-icon">📧</span>
                <div><span class="info-label">Email</span><span class="info-value">{{ societe.email }}</span></div>
              </div>
              <div class="info-item" v-if="societe.adresse">
                <span class="info-icon">📍</span>
                <div><span class="info-label">Adresse</span><span class="info-value">{{ societe.adresse }}</span></div>
              </div>
              <div class="info-item" v-if="societe.telephone">
                <span class="info-icon">📞</span>
                <div><span class="info-label">Téléphone</span><span class="info-value">{{ societe.telephone }}</span></div>
              </div>
            </div>

            <!-- ── Comptes bancaires de la société ── -->
            <div class="comptes-section">
              <div class="comptes-section-header">
                <h3 class="comptes-title">🏦 Comptes Bancaires</h3>
                <button class="btn btn--primary btn--sm" @click="goAddCompteBancaire">
                  + Ajouter un compte
                </button>
              </div>

              <div v-if="loadingComptes" class="comptes-loading">
                <div class="spinner-sm"></div>
                <span>Chargement des comptes…</span>
              </div>

              <div v-else-if="comptesBancaires.length === 0" class="comptes-empty">
                <span>Aucun compte bancaire enregistré.</span>
                <button class="add-link" @click="goAddCompteBancaire">Ajouter maintenant →</button>
              </div>

              <div v-else class="comptes-list">
                <div v-for="compte in comptesBancairesSorted" :key="compte.id" class="compte-item">
                  <div class="compte-info">
                    <div class="compte-bank">
                      <span class="compte-bank-icon">🏛️</span>
                      <span class="compte-bank-name">{{ compte.banque?.nomBanque ?? '—' }}</span>
                    </div>
                    <div class="compte-rib">{{ formatRib(compte.rib) }}</div>
                    <div v-if="compte.adresse_agence" class="compte-agence">📍 {{ compte.adresse_agence }}</div>
                  </div>
                  <button
                    class="btn-delete-compte"
                    title="Supprimer ce compte"
                    @click="askDeleteCB(compte.id)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div class="societe-actions">
              <button class="btn btn--secondary" @click="startEdit">
                ✏️ Modifier la société
              </button>
            </div>
          </div>

          <!-- ── Formulaire de modification inline ── -->
          <div v-if="editMode" class="form-panel">
            <div class="form-panel-header">
              <h3 class="form-panel-title">✏️ Modifier la société</h3>
            </div>
            <div class="form-body">
              <div class="field-group">
                <label class="field-label">Raison Sociale <span class="required-star">*</span></label>
                <input v-model="editForm.raisonSociale" type="text" class="field-input" :class="{'field-input--error': editErrors.raisonSociale}" placeholder="Raison sociale" />
                <span v-if="editErrors.raisonSociale" class="field-error-text">{{ editErrors.raisonSociale }}</span>
              </div>
              <div class="field-group">
                <label class="field-label">Email</label>
                <input v-model="editForm.email" type="email" class="field-input" :class="{'field-input--error': editErrors.email}" placeholder="contact@societe.tn" />
                <span v-if="editErrors.email" class="field-error-text">{{ editErrors.email }}</span>
              </div>
              <div class="field-group">
                <label class="field-label">Adresse</label>
                <input v-model="editForm.adresse" type="text" class="field-input" placeholder="Adresse de la société" />
              </div>
              <div class="field-group">
                <label class="field-label">Téléphone</label>
                <input v-model="editForm.telephone" type="text" inputmode="numeric" class="field-input" placeholder="Ex : 71 000 000" />
              </div>
              <div class="form-actions">
                <button class="btn btn--primary" :disabled="saving" @click="handleUpdate">
                  <span v-if="saving" class="btn-spinner"></span>
                  {{ saving ? 'Enregistrement…' : '✓ Enregistrer les modifications' }}
                </button>
                <button class="btn btn--secondary" @click="cancelEdit">Annuler</button>
              </div>
            </div>
          </div>
        </template>

        <!-- ═══ PAS ENCORE DE SOCIÉTÉ ═══ -->
        <template v-else>
          <div class="form-panel">
            <div class="form-panel-header">
              <div class="header-icon">🏢</div>
              <div>
                <h2 class="form-panel-title">Créer ma société</h2>
                <p class="form-panel-subtitle">Vous n'avez pas encore créé de société. Une seule société est autorisée.</p>
              </div>
            </div>

            <div class="form-body">
              <div class="field-group">
                <label class="field-label">Raison Sociale <span class="required-star">*</span></label>
                <input v-model="createForm.raisonSociale" type="text" class="field-input" :class="{'field-input--error': createErrors.raisonSociale}" placeholder="Raison sociale" />
                <span v-if="createErrors.raisonSociale" class="field-error-text">{{ createErrors.raisonSociale }}</span>
              </div>
              <div class="field-group">
                <label class="field-label">Email</label>
                <input v-model="createForm.email" type="email" class="field-input" :class="{'field-input--error': createErrors.email}" placeholder="contact@societe.tn" />
                <span v-if="createErrors.email" class="field-error-text">{{ createErrors.email }}</span>
              </div>
              <div class="field-group">
                <label class="field-label">Adresse</label>
                <input v-model="createForm.adresse" type="text" class="field-input" placeholder="Adresse de la société" />
              </div>
              <div class="field-group">
                <label class="field-label">Téléphone</label>
                <input v-model="createForm.telephone" type="text" inputmode="numeric" class="field-input" placeholder="Ex : 71 000 000" />
              </div>
              <div class="form-actions">
                <button class="btn btn--primary" :disabled="saving" @click="handleCreate">
                  <span v-if="saving" class="btn-spinner"></span>
                  {{ saving ? 'Création…' : '✓ Créer la société' }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { societeApi, type Societe, type SocietePayload } from '@/api/societe.api'
import { comptesBancairesApi, type CompteBancaire } from '@/api/comptesBancaires.api'

const router = useRouter()

const societe = ref<Societe | null>(null)
const loadingInit = ref(false)
const saving = ref(false)
const editMode = ref(false)
const successMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

// ── Comptes bancaires ──────────────────────────────────────────────
const comptesBancaires = ref<CompteBancaire[]>([])
const comptesBancairesSorted = computed(() => [...comptesBancaires.value].reverse())
const loadingComptes = ref(false)
const confirmDeleteId = ref<number | null>(null)
const deletingCB = ref(false)

function formatRib(rib: string): string {
  const d = rib.replace(/\D/g, '').slice(0, 20)
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 6)
  const p3 = d.slice(6)
  return [p1, p2, p3].filter(Boolean).join(' ')
}

async function loadComptes(idSociete: number) {
  loadingComptes.value = true
  try {
    const res = await comptesBancairesApi.getAll()
    comptesBancaires.value = res.data.filter(
      c => c.titulaire_type === 'App\\Models\\Societe' && c.titulaire_id === idSociete
    )
  } catch {
    // silently fail
  } finally {
    loadingComptes.value = false
  }
}

function askDeleteCB(id: number) {
  confirmDeleteId.value = id
}

async function handleDeleteCB() {
  if (confirmDeleteId.value === null) return
  deletingCB.value = true
  try {
    await comptesBancairesApi.delete(confirmDeleteId.value)
    comptesBancaires.value = comptesBancaires.value.filter(c => c.id !== confirmDeleteId.value)
    confirmDeleteId.value = null
    showSuccess('Compte bancaire supprimé avec succès !')
  } catch {
    errorMsg.value = 'Erreur lors de la suppression du compte bancaire.'
    confirmDeleteId.value = null
  } finally {
    deletingCB.value = false
  }
}

// ── Formulaire création ──────────────────────────────────────────────
const createForm = reactive({ raisonSociale: '', email: '', adresse: '', telephone: '' })
const createErrors = reactive<{ raisonSociale?: string; email?: string }>({})

// ── Formulaire édition ────────────────────────────────────────────────
const editForm = reactive({ raisonSociale: '', email: '', adresse: '', telephone: '' })
const editErrors = reactive<{ raisonSociale?: string; email?: string }>({})

function initiales(nom: string): string {
  return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

onMounted(async () => {
  loadingInit.value = true
  try {
    const res = await societeApi.getAll()
    const list = Array.isArray(res.data) ? res.data : []
    if (list.length > 0) {
      societe.value = list[0]
      await loadComptes(list[0].idSociete)
    }
  } catch (error) {
    console.error('Erreur API Societe :', error)
  } finally {
    loadingInit.value = false
  }
})

function validateCreate(): boolean {
  Object.keys(createErrors).forEach(k => { delete createErrors[k as keyof typeof createErrors] })
  if (!createForm.raisonSociale.trim()) { createErrors.raisonSociale = 'La raison sociale est obligatoire.' }
  if (createForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
    createErrors.email = "Format d'email invalide."
  }
  return Object.keys(createErrors).length === 0
}

async function handleCreate() {
  if (!validateCreate()) return
  saving.value = true
  errorMsg.value = null
  try {
    const payload: SocietePayload = {
      raisonSociale: createForm.raisonSociale.trim(),
      email: createForm.email?.trim() || undefined,
      adresse: createForm.adresse?.trim() || undefined,
      telephone: createForm.telephone.trim() ? Number(createForm.telephone.trim()) : undefined,
    }
    const res = await societeApi.create(payload)
    societe.value = res.data
    await loadComptes(res.data.idSociete)
    showSuccess('Société créée avec succès !')
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Erreur lors de la création de la société.'
  } finally {
    saving.value = false
  }
}

function startEdit() {
  if (!societe.value) return
  editForm.raisonSociale = societe.value.raisonSociale
  editForm.email = societe.value.email ?? ''
  editForm.adresse = societe.value.adresse ?? ''
  editForm.telephone = String(societe.value.telephone ?? '')
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
  Object.keys(editErrors).forEach(k => { delete editErrors[k as keyof typeof editErrors] })
}

function validateEdit(): boolean {
  Object.keys(editErrors).forEach(k => { delete editErrors[k as keyof typeof editErrors] })
  if (!editForm.raisonSociale.trim()) { editErrors.raisonSociale = 'La raison sociale est obligatoire.' }
  if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
    editErrors.email = "Format d'email invalide."
  }
  return Object.keys(editErrors).length === 0
}

async function handleUpdate() {
  if (!societe.value || !validateEdit()) return
  const id = societe.value.idSociete
  if (!id) return
  saving.value = true
  errorMsg.value = null
  try {
    const payload: Partial<SocietePayload> = {
      raisonSociale: editForm.raisonSociale.trim(),
      email: editForm.email?.trim() || undefined,
      adresse: editForm.adresse?.trim() || undefined,
      telephone: editForm.telephone.trim() ? Number(editForm.telephone.trim()) : undefined,
    }
    const res = await societeApi.update(id, payload)
    societe.value = res.data
    editMode.value = false
    showSuccess('Société modifiée avec succès !')
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Erreur lors de la modification.'
  } finally {
    saving.value = false
  }
}

function goAddCompteBancaire() {
  const id = societe.value?.idSociete
  if (id) router.push({ name: 'CreateCompteBancaireForSociete', params: { societeId: id } })
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = null }, 4000)
}
</script>

<style scoped>
.page-layout { display: flex; min-height: 100vh; background: #f8f7ff; }
.page-content { flex: 1; margin-left: 240px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 40px 24px; gap: 20px; overflow-y: auto; }
.loader-wrapper { display: flex; align-items: center; gap: 12px; color: #7c3aed; font-size: 14px; }
.spinner { width: 24px; height: 24px; border: 3px solid #ede9fe; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.7s linear infinite; }
.spinner-sm { width: 16px; height: 16px; border: 2px solid #ede9fe; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Toasts ── */
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; max-width: 640px; width: 100%; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.toast--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
.toast-close { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: 0.6; font-size: 12px; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(15,10,40,0.45); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); padding: 32px 36px; max-width: 420px; width: 100%; display: flex; flex-direction: column; gap: 20px; }
.modal-card--danger { border-top: 4px solid #ef4444; }
.modal-header { display: flex; align-items: flex-start; gap: 14px; }
.modal-icon-danger { font-size: 28px; }
.modal-title { font-size: 17px; font-weight: 700; color: #1e1b4b; margin: 0 0 3px; font-family: 'Outfit', sans-serif; }
.modal-subtitle { font-size: 13px; color: #6b7280; margin: 0; font-family: 'Outfit', sans-serif; }
.modal-footer { display: flex; gap: 10px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.96); }

/* ── Société card ── */
.societe-card { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(109,40,217,0.1); padding: 32px 36px; max-width: 640px; width: 100%; display: flex; flex-direction: column; gap: 24px; }
.societe-card-header { display: flex; align-items: center; gap: 16px; }
.societe-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.societe-name { font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.societe-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #ede9fe; color: #6d28d9; font-family: 'Outfit', sans-serif; margin-top: 4px; }
.btn-edit-icon { margin-left: auto; background: none; border: none; font-size: 20px; cursor: pointer; padding: 6px; border-radius: 8px; }
.btn-edit-icon:hover { background: #f5f3ff; }
.societe-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 500px) { .societe-info-grid { grid-template-columns: 1fr; } }
.info-item { display: flex; align-items: flex-start; gap: 10px; }
.info-icon { font-size: 18px; margin-top: 2px; }
.info-label { display: block; font-size: 11px; color: #9ca3af; font-family: 'Outfit', sans-serif; }
.info-value { display: block; font-size: 14px; font-weight: 600; color: #1e1b4b; font-family: 'Outfit', sans-serif; }
.societe-actions { display: flex; gap: 12px; flex-wrap: wrap; }

/* ── Comptes bancaires section ── */
.comptes-section { display: flex; flex-direction: column; gap: 12px; }
.comptes-section-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.comptes-title { font-size: 15px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.comptes-loading { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #7c3aed; padding: 12px 0; }
.comptes-empty { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #9ca3af; padding: 14px 16px; background: #faf9ff; border-radius: 12px; border: 1.5px dashed #ddd6fe; }
.add-link { background: none; border: none; cursor: pointer; color: #7c3aed; font-size: 13px; font-weight: 600; text-decoration: underline; font-family: 'Outfit', sans-serif; }
.comptes-list { display: flex; flex-direction: column; gap: 8px; }
.compte-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #faf9ff; border: 1.5px solid #ede9fe; border-radius: 12px; transition: border-color 0.15s; }
.compte-item:hover { border-color: #c4b5fd; }
.compte-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.compte-bank { display: flex; align-items: center; gap: 6px; }
.compte-bank-icon { font-size: 14px; }
.compte-bank-name { font-size: 14px; font-weight: 600; color: #1e1b4b; font-family: 'Outfit', sans-serif; }
.compte-rib { font-family: 'Courier New', monospace; font-size: 13px; color: #7c3aed; letter-spacing: 1px; }
.compte-agence { font-size: 12px; color: #9ca3af; font-family: 'Outfit', sans-serif; }
.btn-delete-compte { background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 8px; opacity: 0.5; transition: all 0.15s; flex-shrink: 0; }
.btn-delete-compte:hover { opacity: 1; background: #fef2f2; }

/* ── Form panel ── */
.form-panel { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(109,40,217,0.1); padding: 36px 40px; max-width: 640px; width: 100%; display: flex; flex-direction: column; gap: 24px; }
.form-panel-header { display: flex; align-items: center; gap: 14px; }
.header-icon { font-size: 36px; }
.form-panel-title { font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0; font-family: 'Outfit', sans-serif; }
.form-panel-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0; font-family: 'Outfit', sans-serif; }
.form-body { display: flex; flex-direction: column; gap: 18px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 600; color: #374151; font-family: 'Outfit', sans-serif; }
.required-star { color: #ef4444; margin-left: 2px; }
.field-input { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'Outfit', sans-serif; color: #1f2937; background: #fff; transition: border-color 0.2s; outline: none; width: 100%; }
.field-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
.field-input--error { border-color: #ef4444 !important; }
.field-error-text { font-size: 12px; color: #ef4444; font-family: 'Outfit', sans-serif; }
.form-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }

/* ── Buttons ── */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Outfit', sans-serif; }
.btn--primary { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; box-shadow: 0 3px 10px rgba(109,40,217,0.3); }
.btn--primary:hover:not([disabled]) { opacity: 0.9; transform: translateY(-1px); }
.btn--primary[disabled] { opacity: 0.55; cursor: not-allowed; }
.btn--secondary { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
.btn--secondary:hover { background: #ede9fe; }
.btn--danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; box-shadow: 0 3px 10px rgba(239,68,68,0.3); }
.btn--danger:hover:not([disabled]) { opacity: 0.9; }
.btn--danger[disabled] { opacity: 0.55; cursor: not-allowed; }
.btn--sm { padding: 7px 14px; font-size: 13px; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
.btn-spinner--white { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }

@media (max-width: 768px) { .page-content { margin-left: 0; padding: 80px 16px 24px; } }
@media (max-width: 600px) { .form-panel, .societe-card { border-radius: 0; padding: 24px 16px; } }
</style>