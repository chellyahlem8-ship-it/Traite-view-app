<!-- Affiche TOUS les tiers -->
<SelectTier v-model="form.tier_id" />

<!-- Affiche SEULEMENT les clients -->
<SelectTier v-model="form.tier_id" filter-type="client" />

<!-- Affiche SEULEMENT les fournisseurs -->
<SelectTier v-model="form.tier_id" filter-type="fournisseur" />