<template>
  <div class="gest-shell">

    <Sidebar />

    <!-- ═══════════════════════════════════════════════
         CONTENU PRINCIPAL
    ════════════════════════════════════════════════ -->
    <div class="content-area">

      <!-- Topbar -->
      <header class="topbar">
        <!-- Breadcrumb + titre -->
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

        <!-- Actions topbar -->
        <div class="topbar__right">
          <!-- Indicateur société -->
          <div class="topbar__chip" v-if="auth.user?.idSociete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <span>Société #{{ auth.user.idSociete }}</span>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/Sidebar.vue'

const auth   = useAuthStore()
const router = useRouter()
const route  = useRoute()

const collapsed = ref(false)

const fullName = computed(() =>
  auth.user ? `${auth.user.prenom} ${auth.user.nom}` : '—'
)
const initials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase()
})

const pageTitles: Record<string, string> = {
  DashboardView:        'Dashboard',
  AbonnementsListView:  'Abonnements',
  AbonnementFormView:   'Nouvel abonnement',
  EditAbonnementView:   'Modifier un abonnement',
  SocieteView:          'Ma société',
  TraiteView:           'Traites',
  TraitesCreateView:    'Nouvelle traite',
}
const pageTitle = computed(() => pageTitles[route.name as string] ?? 'Page')

async function handleLogout() {
  auth.clearAuth()
  await router.push({ name: 'LoginView' })
}

// ── SVG Icons ──────────────────────────────────────────────
const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="3.5" cy="6" r="1"/>
    <circle cx="3.5" cy="12" r="1"/>
    <circle cx="3.5" cy="18" r="1"/>
  </svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>`,
  traite: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>`,
  plusCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>`,
  societe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>`,
}
</script>

<style scoped>
/* ── Variables ──────────────────────────────────────────── */
.gest-shell {
  --sidebar-w: 248px;
  --sidebar-w-col: 66px;
  --sidebar-bg: #0f2744;
  --sidebar-hover: rgba(255, 255, 255, 0.06);
  --sidebar-active: rgba(14, 165, 233, 0.15);
  --accent: #0ea5e9;
  --accent-light: rgba(14, 165, 233, 0.12);
  --page-bg: #f0f4f8;
  --topbar-bg: #ffffff;
  --text-on-dark: #e2e8f0;
  --text-muted-dark: #7ea4c5;
  --text-page: #1e293b;
  --text-page-muted: #64748b;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
  --transition: 0.26s cubic-bezier(0.4, 0, 0.2, 1);

  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--page-bg);
  font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
}

/* ── Sidebar ────────────────────────────────────────────── */
.sidebar {
  position: relative;
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width var(--transition);
  overflow: hidden;
  z-index: 10;
}
.sidebar--collapsed { width: var(--sidebar-w-col); }

/* Brand */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 22px 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  white-space: nowrap;
  overflow: hidden;
}
.brand__mark { flex-shrink: 0; display: flex; }
.brand__details { display: flex; flex-direction: column; }
.brand__title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -.2px;
}
.brand__subtitle {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-top: 1px;
}

/* Nav */
.sidebar__nav {
  flex: 1;
  padding: 14px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}
.sidebar__nav::-webkit-scrollbar { width: 2px; }
.sidebar__nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); }

.nav__group-title {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.25);
  padding: 14px 10px 5px;
  white-space: nowrap;
  overflow: hidden;
}

.nav__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--text-muted-dark);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition: background var(--transition), color var(--transition);
  margin-bottom: 1px;
  border-left: 2px solid transparent;
}
.nav__link:hover {
  background: var(--sidebar-hover);
  color: #fff;
}
.nav__link--active {
  background: var(--sidebar-active);
  color: var(--accent);
  border-left-color: var(--accent);
}

.nav__icon { display: flex; align-items: center; flex-shrink: 0; }
.nav__icon :deep(svg) { width: 17px; height: 17px; }

/* Footer */
.sidebar__footer {
  padding: 12px 8px 14px;
  border-top: 1px solid rgba(255,255,255,.07);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,.04);
}
.profile--mini { justify-content: center; }

.profile__avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile__meta { overflow: hidden; }
.profile__name {
  font-size: 12.5px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile__role {
  font-size: 10.5px;
  color: var(--accent);
  font-weight: 500;
  margin: 1px 0 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted-dark);
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
  white-space: nowrap;
  overflow: hidden;
}
.btn-logout:hover { background: rgba(239,68,68,.12); color: #f87171; }
.btn-logout svg { width: 16px; height: 16px; flex-shrink: 0; }

.sidebar__toggler {
  position: absolute;
  top: 50%;
  right: -11px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(14,165,233,.3);
  background: var(--sidebar-bg);
  color: var(--accent);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: background var(--transition);
}
.sidebar__toggler:hover { background: var(--sidebar-active); }
.sidebar__toggler svg { width: 12px; height: 12px; }

/* ── Content area ───────────────────────────────────────── */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar */
.topbar {
  height: 60px;
  background: var(--topbar-bg);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.topbar__left { display: flex; flex-direction: column; gap: 1px; }

.topbar__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-page);
  margin: 0;
  line-height: 1;
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
}

/* Page content */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}
.page-content::-webkit-scrollbar { width: 5px; }
.page-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

/* ── Transitions ────────────────────────────────────────── */
.slide-x-enter-active,
.slide-x-leave-active { transition: opacity .18s, transform .18s; }
.slide-x-enter-from,
.slide-x-leave-to    { opacity: 0; transform: translateX(-8px); }

.page-enter-active,
.page-leave-active { transition: opacity .2s, transform .2s; }
.page-enter-from   { opacity: 0; transform: translateY(6px); }
.page-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>