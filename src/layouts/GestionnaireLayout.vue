<template>
  <div class="gest-shell">

    <!-- ═══════════════════════════════════════════════
         SIDEBAR (self-contained: hamburger + overlay inclus)
    ════════════════════════════════════════════════ -->
    <Sidebar />

    <!-- ═══════════════════════════════════════════════
         CONTENU PRINCIPAL
    ════════════════════════════════════════════════ -->
    <div class="content-area">

      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar__left">
          <h1 class="topbar__title">{{ pageTitle }}</h1>
          <div class="topbar__breadcrumb">
            <span>Gestionnaire</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="10">
              <polyline points="6 4 10 8 6 12"/>
            </svg>
            <span>{{ pageTitle }}</span>
          </div>
        </div>

        <div class="topbar__right">
          <!-- Indicateur société -->
          <div class="topbar__chip" v-if="auth.user?.idSociete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <span class="topbar__chip-text">Société #{{ auth.user.idSociete }}</span>
          </div>

          <!-- Avatar -->
          <div class="topbar__avatar">{{ initials }}</div>
        </div>
      </header>

      <!-- Contenu router -->
      <main class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/Sidebar.vue'

const auth  = useAuthStore()
const route = useRoute()

const initials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase()
})

const pageTitles: Record<string, string> = {
  DashboardView:        'Dashboard',
  DashboardAbonnements: 'Dashboard abonnements',
  Abonnements:          'Abonnements',
  AbonnementsCreate:    'Nouvel abonnement',
  AbonnementEdit:       'Modifier un abonnement',
  SocieteView:          'Ma société',
  Traites:              'Traites',
  TraitesCreate:        'Nouvelle traite',
}
const pageTitle = computed(() => pageTitles[route.name as string] ?? 'Page')
</script>

<style scoped>
/* ── Variables ──────────────────────────────────────────── */
.gest-shell {
  --sidebar-w: 240px;        /* doit correspondre à la width de Sidebar.vue */
  --topbar-h: 60px;
  --page-bg: #f0f4f8;
  --topbar-bg: #ffffff;
  --accent: #0ea5e9;
  --accent-light: rgba(14, 165, 233, 0.12);
  --text-page: #1e293b;
  --text-page-muted: #64748b;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);

  display: flex;
  min-height: 100vh;
  background: var(--page-bg);
  font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
}

/* ── Content area ───────────────────────────────────────── */
/*
  La sidebar est en position:fixed dans Sidebar.vue,
  donc elle ne prend pas de place dans le flux normal.
  On compense avec margin-left égal à sa largeur.
*/
.content-area {
  margin-left: var(--sidebar-w);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

/* ── Topbar ─────────────────────────────────────────────── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--topbar-h);
  background: var(--topbar-bg);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.topbar__left  { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }

.topbar__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-page);
  margin: 0;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--text-page-muted);
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.topbar__chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: var(--accent-light);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
}

.topbar__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(14,165,233,.35);
  flex-shrink: 0;
}

/* ── Page content ───────────────────────────────────────── */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}
.page-content::-webkit-scrollbar { width: 5px; }
.page-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

/* ── Transitions ────────────────────────────────────────── */
.page-enter-active,
.page-leave-active { transition: opacity .2s, transform .2s; }
.page-enter-from   { opacity: 0; transform: translateY(6px); }
.page-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 768px) {
  /*
    Sur mobile la sidebar se masque toute seule (géré dans Sidebar.vue).
    On supprime le margin-left et on ajoute un padding-top
    pour ne pas être masqué par le bouton hamburger fixe (48px).
  */
  .content-area {
    margin-left: 0;
    padding-top: 48px;
  }

  .topbar {
    padding: 0 16px;
  }

  .topbar__chip-text { display: none; }

  .page-content { padding: 20px 16px; }
}
</style>