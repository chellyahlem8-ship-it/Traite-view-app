import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoginView from '@/views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import TiersView from '@/views/tiers/TiersView.vue'
import CreateTier from '@/views/tiers/CreateTier.vue'
import EditTier from '@/views/tiers/EditTier.vue'
import CreateBanque from '@/views/banques/CreateBanque.vue'
import CreateCompteBancaire from '@/views/comptesBancaires/CreateCompteBancaire.vue'
import TraitesView from '@/views/TraiteView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    // ── AUTH ───────────────────────────────────────────────────
    { path: '/', redirect: '/login' },
    { path: '/login',           component: LoginView,          meta: { guest: true } },
    { path: '/signup',          component: () => import('@/views/SignupView.vue'), meta: { guest: true } },
    { path: '/forgot-password', component: ForgotPasswordView, meta: { guest: true } },
    { path: '/reset-password',  component: () => import('@/views/ResetPasswordView.vue') },

    // ── DASHBOARD ──────────────────────────────────────────────
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },

    // ── TRAITES ────────────────────────────────────────────────
    {
      path: '/traites',
      name: 'Traites',
      component: TraitesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/traites/creer',
      name: 'TraitesCreate',
      component: () => import('@/views/TraitesCreateView.vue'),
      meta: { requiresAuth: true },
    },

    // ── STATUTS TRAITE ─────────────────────────────────────────
    {
      path: '/statuts-traite/creer',
      name: 'CreateStatutTraite',
      component: () => import('@/views/CreateStatutTraite.vue'),
      meta: { requiresAuth: true },
    },

    // ── TIERS ──────────────────────────────────────────────────
    {
      path: '/tiers',
      name: 'Tiers',
      component: TiersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tiers/create',
      name: 'CreateTier',
      component: CreateTier,
      meta: { requiresAuth: true },
    },
    {
      path: '/tiers/:id/edit',
      name: 'EditTier',
      component: EditTier,
      meta: { requiresAuth: true },
    },
    {
      path: '/tiers/:tierId/comptes-bancaires/create',
      name: 'CreateCompteBancaireForTier',
      component: () => import('@/views/tiers/CreateCompteBancaireForTier.vue'),
      meta: { requiresAuth: true },
    },

    // ── BANQUES ────────────────────────────────────────────────
    {
      path: '/banques/create',
      name: 'BanquesCreate',
      component: CreateBanque,
      meta: { requiresAuth: true },
    },

    // ── COMPTES BANCAIRES ──────────────────────────────────────
    {
      path: '/comptes-bancaires/create',
      name: 'CreateCompteBancaire',
      component: CreateCompteBancaire,
      meta: { requiresAuth: true },
    },

    // ── SOCIÉTÉ ────────────────────────────────────────────────
    {
      path: '/societe',
      name: 'Societe',
      component: () => import('@/views/societe/SocieteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/societe/:societeId/comptes-bancaires/create',
      name: 'CreateCompteBancaireForSociete',
      component: () => import('@/views/societe/CreateCompteBancaireForSociete.vue'),
      meta: { requiresAuth: true },
    },

    // ── UTILISATEURS ───────────────────────────────────────────
    {
      path: '/utilisateurs',
      name: 'Utilisateurs',                                        // ← nouvelle route liste
      component: () => import('@/views/UtilisateursView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/utilisateurs/creer',
      name: 'CreateUtilisateur',
      component: () => import('@/views/CreateUtilisateur.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.meta.guest && auth.isAuthenticated) return '/dashboard'
  return true
})

export default router