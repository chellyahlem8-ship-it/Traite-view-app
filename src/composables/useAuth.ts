// ============================================================
// composables/useAuth.ts  — FIXED
// ============================================================

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth.api'
import type { LoginPayload, ForgotPasswordPayload } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const loading = ref(false)
  const errorMsg = ref<string | null>(null)
  const successMsg = ref<string | null>(null)

  async function login(payload: LoginPayload) {
    loading.value = true
    errorMsg.value = null

    try {
      const response = await authApi.login(payload)

      if (!response.access_token) {
        throw new Error('Token manquant dans la réponse API')
      }

      // FIX #7 — removed duplicate localStorage.setItem here.
      // authStore.setAuth() already calls localStorage.setItem(TOKEN_KEY, token).
      authStore.setAuth(response.access_token, response.utilisateur)

      // FIX #8 — role-aware redirect instead of always pushing to /dashboard.
      // Also honour the ?redirect= query param set by the navigation guard.
      const redirectPath = router.currentRoute.value.query.redirect as string | undefined
      if (redirectPath) {
        await router.push(redirectPath)
      } else {
        const role = authStore.currentRole
        if (role === 'admin') {
          await router.push({ name: 'Utilisateurs' })
        } else if (role === 'gestionnaire') {
          await router.push({ name: 'DashboardAbonnements' })
        } else {
          await router.push({ name: 'DashboardView' })
        }
      }

    } catch (e: unknown) {
      errorMsg.value =
        e instanceof Error ? e.message : 'Email ou mot de passe incorrect'
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(payload: ForgotPasswordPayload) {
    loading.value = true
    errorMsg.value = null
    successMsg.value = null

    try {
      const res = await authApi.forgotPassword(payload)
      successMsg.value = res.message
    } catch (e: unknown) {
      errorMsg.value =
        e instanceof Error ? e.message : "Erreur lors de l'envoi"
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    if (authStore.token) {
      await authApi.logout(authStore.token)
    }
    authStore.clearAuth()
    router.push('/login')
  }

  return {
    login,
    forgotPassword,
    logout,
    loading,
    errorMsg,
    successMsg,
  }
}