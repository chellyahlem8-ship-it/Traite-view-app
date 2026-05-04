// ============================================================
// stores/auth.store.ts  — FIXED
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/types/auth.types'
import type { UserRole, Permission } from '@/types/rbac.types'
import { roleHasPermission, atLeastRole } from '@/config/permissions.config'

const TOKEN_KEY = 'traity_token'

/**
 * Normalise n'importe quel rôle backend en l'un des 3 rôles internes.
 * - 'admin'                                → admin
 * - 'gestionnaire' | 'gestionnaire_abonnement' → gestionnaire   ← FIX #4
 * - tout le reste (comptable, financier…)  → 'utilisateur'
 */
function normalizeRole(raw: string | null | undefined): UserRole {
  if (raw === 'admin') return 'admin'
  // FIX #4 — handle both backend variants for gestionnaire
  if (raw === 'gestionnaire' || raw === 'gestionnaire_abonnement') return 'gestionnaire'
  return 'utilisateur'
}

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user  = ref<AuthUser | null>(null)

  // ── Getters ────────────────────────────────────────────────

  /**
   * True only when both token AND user are present.
   * Used for full auth checks AFTER hydration.
   * The router guard checks auth.token separately for the pre-hydration step.
   */
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * Rôle NORMALISÉ : toujours 'admin' | 'gestionnaire' | 'utilisateur'
   */
  const currentRole = computed<UserRole | null>(() =>
    user.value ? normalizeRole(user.value.role) : null,
  )

  /** Rôle brut tel que renvoyé par le backend (pour affichage) */
  const rawRole = computed<string | null>(() =>
    user.value?.role ?? null,
  )

  const isAdmin        = computed(() => currentRole.value === 'admin')
  const isGestionnaire = computed(() => currentRole.value === 'gestionnaire' || currentRole.value === 'admin')
  const isUtilisateur  = computed(() => currentRole.value === 'utilisateur')

  // ── RBAC ───────────────────────────────────────────────────

  function hasRole(role: UserRole): boolean {
    return currentRole.value === role
  }

  function hasAtLeastRole(minRole: UserRole): boolean {
    if (!currentRole.value) return false
    return atLeastRole(currentRole.value, minRole)
  }

  function hasPermission(permission: Permission): boolean {
    if (!currentRole.value) return false
    return roleHasPermission(currentRole.value, permission)
  }

  function hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((p) => hasPermission(p))
  }

  function hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((p) => hasPermission(p))
  }

  // ── Actions ────────────────────────────────────────────────

  function setAuth(accessToken: string, userData: AuthUser) {
    token.value = accessToken
    user.value  = userData
    localStorage.setItem(TOKEN_KEY, accessToken)
  }

  function clearAuth() {
    token.value = null
    user.value  = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function fetchCurrentUser(baseUrl: string): Promise<void> {
    if (!token.value) return
    try {
      const res = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (!res.ok) { clearAuth(); return }
      user.value = await res.json()
    } catch {
      clearAuth()
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    currentRole,
    rawRole,
    isAdmin,
    isGestionnaire,
    isUtilisateur,
    hasRole,
    hasAtLeastRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    setAuth,
    clearAuth,
    fetchCurrentUser,
  }
})