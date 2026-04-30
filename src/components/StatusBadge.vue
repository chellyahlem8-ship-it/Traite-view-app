<template>
  <span class="badge" :class="`badge--${variant}`">
    <span class="badge-dot"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type EtatType = 'payé' | 'non_payé' | 'non_échue' | 'en_caisse'
type TypeTiers = 'client' | 'fournisseur'

const props = defineProps<{
  value: EtatType | TypeTiers
}>()

const config: Record<string, { label: string; variant: string }> = {
  payé:          { label: 'Payé',        variant: 'success'  },
  non_payé:      { label: 'Non payé',    variant: 'danger'   },
  non_échue:     { label: 'Non échue',   variant: 'warning'  },
  en_caisse:     { label: 'En caisse',   variant: 'info'     },
  client:        { label: 'Client',      variant: 'client'   },
  fournisseur:   { label: 'Fournisseur', variant: 'fournisseur' },
}

const label   = computed(() => config[props.value]?.label   ?? props.value)
const variant = computed(() => config[props.value]?.variant ?? 'default')
</script>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Outfit', sans-serif;

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── États ────────────────────────────────────────── */
  &--success {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
    .badge-dot { background: #10b981; }
  }

  &--danger {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
    .badge-dot { background: #ef4444; }
  }

  &--warning {
    background: #fffbeb;
    color: #92400e;
    border: 1px solid #fde68a;
    .badge-dot { background: #f59e0b; }
  }

  &--info {
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
    .badge-dot { background: #3b82f6; }
  }

  /* ── Types tiers ──────────────────────────────────── */
  &--client {
    background: #f5f3ff;
    color: #5b21b6;
    border: 1px solid #ddd6fe;
    .badge-dot { background: #7c3aed; }
  }

  &--fournisseur {
    background: #fdf4ff;
    color: #7e22ce;
    border: 1px solid #e9d5ff;
    .badge-dot { background: #a855f7; }
  }

  &--default {
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    .badge-dot { background: #9ca3af; }
  }
}
</style>