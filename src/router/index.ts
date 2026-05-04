// ============================================================
// router/index.ts  — FIXED
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteMeta, UserRole } from '@/types/rbac.types'
import { useAuthStore } from '@/stores/auth.store'

const AdminLayout        = () => import('@/layouts/AdminLayout.vue')
const GestionnaireLayout = () => import('@/layouts/GestionnaireLayout.vue')
const PublicLayout       = () => import('@/layouts/PublicLayout.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // ── Auth (sans layout) ────────────────────────────────
    { path: '/', redirect: '/login' },
    { path: '/login',           name: 'LoginView',          component: () => import('@/views/LoginView.vue') },
    { path: '/signup',          name: 'SignupView',          component: () => import('@/views/SignupView.vue') },
    { path: '/forgot-password', name: 'ForgotPasswordView', component: () => import('@/views/ForgotPasswordView.vue') },
    { path: '/reset-password',  name: 'ResetPasswordView',  component: () => import('@/views/ResetPasswordView.vue') },

    // ── PublicLayout (utilisateur + gestionnaire + admin) ─
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: 'create-compte-bancaire',
          name: 'CreateCompteBancaireForSociete',
          component: () => import('@/views/public/CreateCompteBancaireForSociete.vue'),
          // FIX #9 — was missing meta entirely (unauthenticated access)
          meta: { requiresAuth: true, permission: 'comptesBancaires:creer' } satisfies RouteMeta,
        },
        {
          path: 'dashboard',
          name: 'DashboardView',
          component: () => import('@/views/public/DashboardView.vue'),
          meta: { requiresAuth: true } satisfies RouteMeta,
        },
        {
          path: 'traites',
          name: 'Traites',
          component: () => import('@/views/public/TraiteView.vue'),
          meta: { requiresAuth: true, permission: 'traites:lire' } satisfies RouteMeta,
        },
        {
          path: 'traites/creer',
          name: 'TraitesCreate',
          component: () => import('@/views/public/TraitesCreateView.vue'),
          meta: { requiresAuth: true, permission: 'traites:creer' } satisfies RouteMeta,
        },
        {
          path: 'statuts-traites/creer',
          name: 'CreateStatutTraite',
          component: () => import('@/views/public/CreateStatutTraite.vue'),
          meta: { requiresAuth: true, permission: 'statutsTraite:creer' } satisfies RouteMeta,
        },
        {
          path: 'tiers',
          name: 'Tiers',
          component: () => import('@/views/public/tiers/TiersView.vue'),
          meta: { requiresAuth: true, permission: 'tiers:lire' } satisfies RouteMeta,
        },
        {
          path: 'tiers/create',
          name: 'CreateTier',
          component: () => import('@/views/public/tiers/CreateTier.vue'),
          meta: { requiresAuth: true, permission: 'tiers:creer' } satisfies RouteMeta,
        },
        {
          path: 'tiers/:id/edit',
          name: 'EditTier',
          component: () => import('@/views/public/tiers/EditTier.vue'),
          meta: { requiresAuth: true, permission: 'tiers:modifier' } satisfies RouteMeta,
        },
        {
          path: 'tiers/:tierId/comptes-bancaires/create',
          name: 'CreateCompteBancaireForTier',
          component: () => import('@/views/public/tiers/CreateCompteBancaireForTier.vue'),
          meta: { requiresAuth: true, permission: 'comptesBancaires:creer' } satisfies RouteMeta,
        },
        {
          path: 'societe',
          name: 'Societe',
          component: () => import('@/views/public/SocieteView.vue'),
          meta: { requiresAuth: true, permission: 'societes:lire' } satisfies RouteMeta,
        },
        {
          path: 'societe/:societeId/comptes-bancaires/create',
          name: 'CreateCompteBancaireForSocieteAuth',
          component: () => import('@/views/public/CreateCompteBancaireForSociete.vue'),
          meta: { requiresAuth: true, permission: 'comptesBancaires:creer' } satisfies RouteMeta,
        },
      ],
    },

    // ── Routes Admin ──────────────────────────────────────
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, roles: ['admin'] satisfies UserRole[] } satisfies RouteMeta,
      children: [
        {
          path: 'utilisateurs',
          name: 'Utilisateurs',
          component: () => import('@/views/admin/UtilisateursView.vue'),
          meta: { requiresAuth: true, roles: ['admin'] satisfies UserRole[], permission: 'utilisateurs:lire' } satisfies RouteMeta,
        },
        {
          path: 'utilisateurs/creer',
          name: 'CreateUtilisateur',
          component: () => import('@/views/admin/CreateUtilisateur.vue'),
          meta: { requiresAuth: true, roles: ['admin'] satisfies UserRole[], permission: 'utilisateurs:creer' } satisfies RouteMeta,
        },
        {
          path: 'banques/create',
          name: 'CreateBanque',
          component: () => import('@/views/admin/CreateBanque.vue'),
          meta: { requiresAuth: true, roles: ['admin'] satisfies UserRole[], permission: 'banques:creer' } satisfies RouteMeta,
        },
      ],
    },

    // ── Routes Gestionnaire ───────────────────────────────
    {
      path: '/gestionnaire',
      component: GestionnaireLayout,
      meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[] } satisfies RouteMeta,
      children: [
        {
          path: 'abonnements',
          name: 'Abonnements',
          component: () => import('@/views/gestionnaire/AbonnementsListView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[], permission: 'abonnements:lire' } satisfies RouteMeta,
        },
        {
          path: 'abonnements/creer',
          name: 'AbonnementsCreate',
          component: () => import('@/views/gestionnaire/AbonnementFormView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[], permission: 'abonnements:creer' } satisfies RouteMeta,
        },
        {
          path: 'abonnements/:id/edit',
          name: 'AbonnementEdit',
          component: () => import('@/views/gestionnaire/EditAbonnementView.vue'),
          props: true,
          meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[], permission: 'abonnements:modifier' } satisfies RouteMeta,
        },
        {
          path: 'abonnements/:id',
          name: 'AbonnementsShow',
          component: () => import('@/views/gestionnaire/AbonnementFormView.vue'),
          props: true,
          meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[], permission: 'abonnements:lire' } satisfies RouteMeta,
        },
        {
          path: 'societe',
          name: 'SocieteView',
          component: () => import('@/views/public/SocieteView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[] } satisfies RouteMeta,
        },
        {
          path: 'dashboard',
          name: 'DashboardAbonnements',
          component: () => import('@/views/gestionnaire/AbonnementsDashboard.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'gestionnaire'] satisfies UserRole[], permission: 'dashboard_abonnements:lire' } satisfies RouteMeta,
        },
      ],
    },

    // ── Fallback ──────────────────────────────────────────
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/LoginView.vue') },
  ],
})

// ── Navigation Guard ──────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  const meta = to.meta as RouteMeta

  // 1. Public route → allow
  if (!meta.requiresAuth) return next()

  // 2. No token at all → genuine unauthenticated user
  //    ⚠️  Do NOT check auth.isAuthenticated here — it requires user to be loaded,
  //    which isn't the case after a page refresh. We only check the token.
  if (!auth.token) {
    return next({ name: 'LoginView', query: { redirect: to.fullPath } })
  }

  // 3. Token present but user not yet loaded (page refresh / cold start)
  //    Fetch the user profile; on 401 clearAuth() is called internally.
  if (!auth.user) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    await auth.fetchCurrentUser(baseUrl)
    // After hydration, re-check the full isAuthenticated (token + user)
    if (!auth.isAuthenticated) return next({ name: 'LoginView' })
  }

  // 4. Role check
  if (meta.roles && meta.roles.length > 0) {
    const userRole = auth.currentRole as UserRole
    if (!meta.roles.includes(userRole)) {
      const fallback = getDefaultRouteForRole(userRole)
      if (to.name === fallback.name) return next()   // anti-loop
      return next(fallback)
    }
  }

  // 5. Permission check
  if (meta.permission && !auth.hasPermission(meta.permission)) {
    const fallback = getDefaultRouteForRole(auth.currentRole as UserRole)
    if (to.name === fallback.name) return next()     // anti-loop
    return next(fallback)
  }

  return next()
})

function getDefaultRouteForRole(role: UserRole | null) {
  switch (role) {
    case 'admin':        return { name: 'Utilisateurs' }
    case 'gestionnaire': return { name: 'DashboardAbonnements' }
    default:             return { name: 'DashboardView' }
  }
}

export default router