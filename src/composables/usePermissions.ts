// ============================================================
// composables/usePermissions.ts
// Composable exposant la logique RBAC dans les composants.
// ============================================================

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import type { Permission, UserRole } from '@/types/rbac.types.ts'

/**
 * Composable principal RBAC.
 *
 * @example
 * const { can, isAdmin, hasRole } = usePermissions()
 * // Dans le template : v-if="can('abonnements:creer')"
 */
export function usePermissions() {
  const auth = useAuthStore()

  // ── Computed réactifs ──────────────────────────────────────

  /** Rôle courant de l'utilisateur */
  const role = computed(() => auth.currentRole)

  /** true si l'utilisateur est admin */
  const isAdmin = computed(() => auth.isAdmin)

  /** true si l'utilisateur est gestionnaire ou admin */
  const isGestionnaire = computed(() => auth.isGestionnaire)

  /** true si l'utilisateur est un utilisateur standard */
  const isStandardUser = computed(() => auth.isUtilisateur)

  // ── Fonctions proxy (mémoisées via computed si besoin) ─────

  /**
   * Alias lisible de `hasPermission` — préféré dans les templates.
   * @example can('abonnements:modifier')
   */
  const can = (permission: Permission): boolean => auth.hasPermission(permission)

  /**
   * Vérifie plusieurs permissions en AND.
   * @example canAll(['traites:lire', 'abonnements:lire'])
   */
  const canAll = (permissions: Permission[]): boolean => auth.hasAllPermissions(permissions)

  /**
   * Vérifie plusieurs permissions en OR.
   * @example canAny(['banques:creer', 'utilisateurs:creer'])
   */
  const canAny = (permissions: Permission[]): boolean => auth.hasAnyPermission(permissions)

  /**
   * Vérifie le rôle exact.
   * @example hasRole('gestionnaire')
   */
  const hasRole = (r: UserRole): boolean => auth.hasRole(r)

  /**
   * Vérifie un niveau minimal de rôle.
   * @example atLeast('gestionnaire') → true pour admin ET gestionnaire
   */
  const atLeast = (minRole: UserRole): boolean => auth.hasAtLeastRole(minRole)

  /**
   * Retourne 'disabled' ou undefined — pratique pour :disabled sur les boutons.
   * @example :disabled="disabled('utilisateurs:supprimer')"
   */
  const disabledIf = (permission: Permission): true | undefined =>
    !can(permission) ? true : undefined

  return {
    role,
    isAdmin,
    isGestionnaire,
    isStandardUser,
    can,
    canAll,
    canAny,
    hasRole,
    atLeast,
    disabledIf,
  }
}