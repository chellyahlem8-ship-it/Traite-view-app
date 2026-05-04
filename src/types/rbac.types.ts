// ============================================================
// types/rbac.types.ts
// ============================================================

export type UserRole = 'admin' | 'gestionnaire' | 'utilisateur'

export type Permission =
  // ── Utilisateurs ─────────────────────────────────────────
  | 'utilisateurs:lire'
  | 'utilisateurs:creer'
  | 'utilisateurs:modifier'
  | 'utilisateurs:supprimer'

  // ── Banques ──────────────────────────────────────────────
  | 'banques:lire'
  | 'banques:creer'
  | 'banques:modifier'
  | 'banques:supprimer'

  // ── Abonnements ──────────────────────────────────────────
  | 'abonnements:lire'
  | 'abonnements:creer'
  | 'abonnements:modifier'
  | 'abonnements:supprimer'

  // ── Sociétés ─────────────────────────────────────────────
  | 'societes:lire'
  | 'societes:modifier'
  | 'societes:creer'
  | 'societe:lire'

  // ── Traites ──────────────────────────────────────────────
  | 'traites:lire'
  | 'traites:creer'

  // ── Tiers ────────────────────────────────────────────────
  | 'tiers:lire'
  | 'tiers:creer'
  | 'tiers:modifier'
  | 'tiers:supprimer'

  // ── Comptes bancaires ─────────────────────────────────────
  | 'comptesBancaires:lire'
  | 'comptesBancaires:creer'
  | 'comptesBancaires:modifier'
  | 'comptesBancaires:supprimer'

  // ── Statuts traite ────────────────────────────────────────
  | 'statutsTraite:creer'

  // ── Dashboard ────────────────────────────────────────────
  | 'dashboard:lire'
  | 'dashboard_abonnements:lire'

export type RolePermissionsMap = Record<UserRole, Permission[]>

export type ProtectedRouteName =
  | 'CreateUtilisateur'
  | 'Utilisateurs'
  | 'CreateBanque'
  | 'AbonnementsCreate'
  | 'Abonnements'
  | 'AbonnementEdit'
  | 'SocieteView'
  | 'DashboardView'
  | 'TraitesCreate'
  | 'Traites'
  | 'Tiers'
  | 'CreateTier'
  | 'EditTier'
  | 'DashboardAbonnements'

export interface RouteMeta {
  requiresAuth?: boolean
  roles?: UserRole[]
  permission?: Permission
}