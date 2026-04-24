import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import LoginView from '@/views/LoginView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import TraitesView from '@/views/TraitesView.vue';
import CreateTier from '@/views/tiers/CreateTier.vue'; // Import de la nouvelle vue
import CreateBanque from '@/views/banques/CreateBanque.vue';

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
    // ✅ AJOUT DE LA ROUTE TIERS
    {
      path: '/tiers/create',
      name: 'CreateTier',
      component: CreateTier,
      meta: { requiresAuth: true },
    },

    {
      path: '/banques/create',
      name: 'BanquesCreate',
      component: CreateBanque,
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