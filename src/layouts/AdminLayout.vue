<template>
  <div class="admin-shell">

    <Sidebar/>

    <!-- ═══════════════════════════════════════════════
         MAIN
    ════════════════════════════════════════════════ -->
    <div class="main" :class="{ 'main--expanded': collapsed }">

      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar__left">
          <div class="topbar__breadcrumb">
            <span class="breadcrumb__root">Admin</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" width="12">
              <polyline points="6 4 10 8 6 12"/>
            </svg>
            <span class="breadcrumb__page">{{ currentPageLabel }}</span>
          </div>
        </div>
        <div class="topbar__right">
          <div class="topbar__status">
            <span class="status-dot" />
            <span>Système actif</span>
          </div>
          <div class="topbar__time">{{ clock }}</div>
        </div>
      </header>

      <!-- Contenu de la page -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/Sidebar.vue'

const auth   = useAuthStore()
const router = useRouter()
const route  = useRoute()

const collapsed = ref(false)
const clock     = ref('')

// ── Horloge ────────────────────────────────────────────────
let clockTimer: ReturnType<typeof setInterval>
function updateClock() {
  clock.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
onMounted(() => { updateClock(); clockTimer = setInterval(updateClock, 1000) })
onUnmounted(() => clearInterval(clockTimer))

// ── User ───────────────────────────────────────────────────
const fullName = computed(() =>
  auth.user ? `${auth.user.prenom} ${auth.user.nom}` : '—'
)
const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase()
})

// ── Page courante ──────────────────────────────────────────
const pageLabels: Record<string, string> = {
  Utilisateurs:           'Utilisateurs',
  CreateUtilisateur:      'Nouvel utilisateur',
  CreateBanque:           'Créer une banque',
  Abonnements:            'Abonnements',
  AbonnementsCreate:      'Nouvel abonnement',
  AbonnementEdit:         'Modifier un abonnement',
  DashboardAbonnements:   'Dashboard abonnements',
  SocieteView:            'Société',
  DashboardView:          'Dashboard',
  Traites:                'Traites',
  TraitesCreate:          'Nouvelle traite',
}
const currentPageLabel = computed(() => pageLabels[route.name as string] ?? 'Page')

// ── Navigation ─────────────────────────────────────────────
const adminNavItems = [
  {
    route: 'UtilisateursView',
    label: 'Utilisateurs',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
  {
    route: 'CreateBanque',
    label: 'Banques',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/>
      <polyline points="5 22 5 12 2 12 12 3 22 12 19 12 19 22"/>
      <line x1="9" y1="22" x2="9" y2="14"/>
      <line x1="15" y1="22" x2="15" y2="14"/>
    </svg>`,
  },
]

const gestionNavItems = [
  {
    route: 'DashboardView',
    label: 'Dashboard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>`,
  },
  {
    route: 'AbonnementsListView',
    label: 'Abonnements',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>`,
  },
  {
    route: 'TraiteView',
    label: 'Traites',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>`,
  },
  {
    route: 'SocieteView',
    label: 'Société',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>`,
  },
]

// ── Logout ─────────────────────────────────────────────────
async function handleLogout() {
  auth.clearAuth()
  await router.push({ name: 'LoginView' })
}
</script>

<style scoped>
/* ── Variables ──────────────────────────────────────────── */
.admin-shell {
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 68px;
  --sidebar-bg: #0b0f1a;
  --sidebar-border: rgba(129, 140, 248, 0.1);
  --nav-hover: rgba(129, 140, 248, 0.08);
  --nav-active-bg: rgba(129, 140, 248, 0.15);
  --nav-active-border: #818cf8;
  --accent: #818cf8;
  --accent-dim: rgba(129, 140, 248, 0.5);
  --topbar-bg: #0e1220;
  --page-bg: #111827;
  --text-primary: #f1f5f9;
  --text-secondary: #64748b;
  --text-muted: #334155;
  --transition: 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--page-bg);
  font-family: 'Outfit', 'DM Sans', sans-serif;
}

/* ── Sidebar ──────────────────────────────────────────────── */
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  transition: width var(--transition);
  overflow: hidden;
  flex-shrink: 0;
  z-index: 10;
}
.sidebar--collapsed { width: var(--sidebar-w-collapsed); }

/* Brand */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 18px 20px;
  border-bottom: 1px solid var(--sidebar-border);
  white-space: nowrap;
  overflow: hidden;
}
.brand__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.brand__text { display: flex; flex-direction: column; line-height: 1; }
.brand__name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -.3px;
  color: var(--text-primary);
}
.brand__tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
  margin-top: 2px;
}

/* Nav */
.sidebar__nav {
  flex: 1;
  padding: 16px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}
.sidebar__nav::-webkit-scrollbar { width: 3px; }
.sidebar__nav::-webkit-scrollbar-thumb { background: var(--sidebar-border); border-radius: 2px; }

.nav__section-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.6px;
  color: var(--text-muted);
  padding: 12px 8px 6px;
  white-space: nowrap;
  overflow: hidden;
  margin: 0;
}

.nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  transition: background var(--transition), color var(--transition);
  margin-bottom: 2px;
  border-left: 2px solid transparent;
}
.nav__item:hover {
  background: var(--nav-hover);
  color: var(--text-primary);
}
.nav__item--active {
  background: var(--nav-active-bg);
  color: var(--accent);
  border-left-color: var(--nav-active-border);
}

.nav__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.nav__icon :deep(svg) { width: 18px; height: 18px; }

.nav__label { flex: 1; }

/* Footer */
.sidebar__footer {
  padding: 12px 10px 16px;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  overflow: hidden;
}
.user-block--mini { justify-content: center; }

.user-block__avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.user-block__info { overflow: hidden; }
.user-block__name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
.user-block__role {
  font-size: 11px;
  color: var(--accent);
  font-weight: 500;
  margin: 1px 0 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
  white-space: nowrap;
  overflow: hidden;
}
.logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; }
.logout-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

/* Toggle */
.sidebar__toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--sidebar-border);
  background: var(--sidebar-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: background var(--transition), color var(--transition);
}
.sidebar__toggle:hover { background: var(--nav-hover); color: var(--accent); }
.sidebar__toggle svg { width: 13px; height: 13px; }

/* ── Main ───────────────────────────────────────────────── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left var(--transition);
}

/* Topbar */
.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: var(--topbar-bg);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.breadcrumb__root { color: var(--text-muted); }
.breadcrumb__page { color: var(--text-primary); font-weight: 600; }

.topbar__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.topbar__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 6px #34d39966;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .5; }
}

.topbar__time {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent);
  letter-spacing: .5px;
}

/* Page content */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}
.page-content::-webkit-scrollbar { width: 5px; }
.page-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 3px; }

/* ── Transitions ────────────────────────────────────────── */
.fade-x-enter-active,
.fade-x-leave-active { transition: opacity .2s, transform .2s; }
.fade-x-enter-from,
.fade-x-leave-to    { opacity: 0; transform: translateX(-6px); }

.page-enter-active,
.page-leave-active { transition: opacity .2s, transform .2s; }
.page-enter-from   { opacity: 0; transform: translateX(8px); }
.page-leave-to     { opacity: 0; transform: translateX(-8px); }
</style>