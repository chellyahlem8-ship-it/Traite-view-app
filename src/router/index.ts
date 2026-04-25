import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import LoginView from '@/views/LoginView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import TraitesView from '@/views/TraitesView.vue';
import TiersView from '@/views/tiers/TiersView.vue';
import CreateTier from '@/views/tiers/CreateTier.vue';
import EditTier from '@/views/tiers/EditTier.vue';
import CreateBanque from '@/views/banques/CreateBanque.vue';
import CreateCompteBancaire from '@/views/comptesBancaires/CreateCompteBancaire.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView, meta: { guest: true } },
    { path: '/forgot-password', component: ForgotPasswordView, meta: { guest: true } },
    {
      path: '/reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/traites',
      name: 'Traites',
      component: TraitesView,
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
    }
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login';
  if (to.meta.guest && auth.isAuthenticated) return '/dashboard';
  return true;
});

export default router;