// ============================================================
// config/permissions.config.ts  — FIXED
// Source de vérité unique : qui peut faire quoi.
// ============================================================

import type { RolePermissionsMap, Permission, UserRole } from '@/types/rbac.types.ts'

// ── Permissions de base partagées par tous les rôles authentifiés ──
const BASE_PERMISSIONS: Permission[] = [
  'dashboard:lire',
  'traites:lire',
  'traites:creer',
  'statutsTraite:creer',
  'tiers:lire',
  'tiers:creer',
  'tiers:modifier',
  'tiers:supprimer',
  'societe:lire',
  'societes:modifier',

  // FIX #3 — comptesBancaires:creer was used in the router but never granted to any role.
  // All authenticated users need to create bank accounts for their tiers/societe.
  'comptesBancaires:lire',
  'comptesBancaires:creer',
  'comptesBancaires:modifier',
  'comptesBancaires:supprimer',


]

// ── Permissions propres au gestionnaire ───────────────────────────
const GESTIONNAIRE_PERMISSIONS: Permission[] = [
  ...BASE_PERMISSIONS,
  'abonnements:lire',
  'abonnements:creer',
  'abonnements:modifier',
  'abonnements:supprimer',
  'dashboard_abonnements:lire',
  'societes:creer',
  'societes:lire',
]

// ── Permissions admin = tout ───────────────────────────────────────
const ADMIN_PERMISSIONS: Permission[] = [
  ...GESTIONNAIRE_PERMISSIONS,
  'utilisateurs:lire',
  'utilisateurs:creer',
  'utilisateurs:modifier',
  'utilisateurs:supprimer',
  'banques:lire',
  'banques:creer',
  'banques:modifier',
  'banques:supprimer',
]

/**
 * Table de vérité centrale.
 * Pour ajouter un rôle : l'ajouter ici + dans UserRole.
 */
export const ROLE_PERMISSIONS: RolePermissionsMap = {
  admin: ADMIN_PERMISSIONS,
  gestionnaire: GESTIONNAIRE_PERMISSIONS,
  utilisateur: BASE_PERMISSIONS,
}

/**
 * Ordre de priorité des rôles (index 0 = plus privilégié).
 * Utilisé pour les comparaisons hiérarchiques (atLeastRole).
 */
export const ROLE_HIERARCHY: UserRole[] = ['admin', 'gestionnaire', 'utilisateur']

/**
 * Retourne true si `userRole` a la permission `permission`.
 * Fonctionne sans store — utilisable dans les guards et les tests.
 */
export function roleHasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

/**
 * Retourne true si `userRole` est au moins aussi privilégié que `minRole`.
 * Ex : atLeastRole('admin', 'gestionnaire') → true
 *      atLeastRole('utilisateur', 'gestionnaire') → false
 */
export function atLeastRole(userRole: UserRole, minRole: UserRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole)
  const minIndex  = ROLE_HIERARCHY.indexOf(minRole)
  // Index plus bas = rôle plus élevé dans la hiérarchie
  return userIndex !== -1 && userIndex <= minIndex
}