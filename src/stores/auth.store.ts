import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost } from '@/api/apiClient' // <--- AJOUTER CET IMPORT
import type { AuthUser } from '@/types/auth.types'

const TOKEN_KEY = 'traity_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(accessToken: string, userData: AuthUser) {
    token.value = accessToken
    user.value = userData
    localStorage.setItem(TOKEN_KEY, accessToken)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  // ─────────────────────────────────────────────────────────────
  // AJOUTER CETTE FONCTION LOGOUT
  // ─────────────────────────────────────────────────────────────
  async function logout() {
    try {
      // On tente d'appeler l'API Laravel pour invalider le token côté serveur
      await apiPost('/logout', {})
    } catch (error) {
      // Si erreur 401 (token expiré) ou erreur réseau, on l'ignore.
      // L'important est de nettoyer le frontend.
      console.warn('Erreur lors de la déconnexion API (peut-être token expiré) :', error)
    } finally {
      // Dans tous les cas (succès ou erreur), on nettoie le store local
      clearAuth()
      
      // Redirection forcée vers la page de login (optionnel mais recommandé)
      // Note: On vérifie si on n'est pas déjà sur login pour éviter une boucle
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // AJOUTER 'logout' au retour
  // ─────────────────────────────────────────────────────────────
  return { token, user, isAuthenticated, setAuth, clearAuth, logout }
})