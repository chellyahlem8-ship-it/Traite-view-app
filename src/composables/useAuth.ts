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
      localStorage.setItem('traity_token', response.access_token)
      authStore.setAuth(response.access_token, response.utilisateur)
      await router.push('/dashboard')
    } catch (e: unknown) {
      errorMsg.value = e instanceof Error ? e.message : 'Email ou mot de passe incorrect'
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
      errorMsg.value = e instanceof Error ? e.message : 'Erreur lors de l\'envoi'
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

  return { login, forgotPassword, logout, loading, errorMsg, successMsg }
}