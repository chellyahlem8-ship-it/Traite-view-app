<!-- ✅ CONSERVER - TraitePreview.vue UNIQUE -->
<template>
  <div class="traite-preview-wrapper">
    <!-- État vide -->
    <div v-if="!current" class="preview-empty">
      <div class="empty-icon-container">
        <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="4" width="48" height="56" rx="4"/>
          <line x1="16" y1="16" x2="48" y2="16"/>
          <line x1="16" y1="24" x2="48" y2="24"/>
          <line x1="16" y1="32" x2="36" y2="32"/>
          <line x1="16" y1="40" x2="48" y2="40"/>
          <line x1="16" y1="48" x2="30" y2="48"/>
        </svg>
      </div>
      <p class="empty-title">Aperçu de la traite</p>
      <p class="empty-subtitle">
        Remplissez le formulaire et cliquez sur « Générer » pour voir l'aperçu
      </p>
    </div>

    <!-- Aperçu avec traite -->
    <div v-else class="preview-content">
      <!-- Navigation entre traites -->
      <div v-if="count > 1" class="preview-nav">
        <button class="nav-btn" :disabled="currentIndex === 0" @click="navigatePrev">
          <svg viewBox="0 0 20 20" fill="currentColor" class="nav-btn-icon">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>

        <div class="nav-pills">
          <button
            v-for="i in count"
            :key="i - 1"
            class="nav-pill"
            :class="{ 'nav-pill-active': currentIndex === i - 1 }"
            @click="navigateTo(i - 1)"
          >
            {{ i }}
          </button>
        </div>

        <button class="nav-btn" :disabled="currentIndex === count - 1" @click="navigateNext">
          <svg viewBox="0 0 20 20" fill="currentColor" class="nav-btn-icon">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <div class="preview-label">
        Traite {{ currentIndex + 1 }} sur {{ count }}
      </div>

      <!-- ✅ Image unifiée -->
      <div class="traite-document">
        <div
          class="traite-overlay"
          :style="{ backgroundImage: `url('/traite-bg.png')` }"
        >
          <span class="traite-field traite-field-numero" :style="positions.numero">{{ current.numero }}</span>
          <span class="traite-field traite-field-tireur" :style="positions.tireur">{{ current.client }}</span>
          <span class="traite-field traite-field-tire" :style="positions.tire">{{ current.fournisseur }}</span>
          <span class="traite-field traite-field-banque" :style="positions.banque">{{ current.banque }}</span>
          <span class="traite-field traite-field-rib" :style="positions.rib">{{ current.rib }}</span>
          <span class="traite-field traite-field-montant-chiffres" :style="positions.montantChiffres">{{ current.montant.toFixed(3) }} DT</span>
          <span class="traite-field traite-field-montant-lettres" :style="positions.montantLettres">{{ current.montantLettres }}</span>
          <span class="traite-field traite-field-date-echeance" :style="positions.dateEcheance">{{ formatDate(current.dateEcheance) }}</span>
          <span class="traite-field traite-field-date-emission" :style="positions.dateEmission">{{ formatDate(current.dateEmission) }}</span>
          <span class="traite-field traite-field-lieu" :style="positions.lieu">{{ current.lieu }}</span>
          <span class="traite-field traite-field-beneficiaire" :style="positions.beneficiaire">{{ current.beneficiaire }}</span>
          <span class="traite-field traite-field-signature" :style="positions.signature">{{ current.client }}</span>
        </div>
      </div>

      <!-- Info montant -->
      <div class="preview-info">
        <div class="info-chip">
          <span class="info-chip-label">Montant</span>
          <span class="info-chip-value">{{ current.montant.toFixed(3) }} DT</span>
        </div>
        <div class="info-chip">
          <span class="info-chip-label">Échéance</span>
          <span class="info-chip-value">{{ formatDate(current.dateEcheance) }}</span>
        </div>
        <div class="info-chip">
          <span class="info-chip-label">N°</span>
          <span class="info-chip-value">{{ current.numero }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTraite } from '@/composables/useTraite'
import type { TraiteFieldPositions } from '@/types/traite.types'

const {
  current,
  currentIndex,
  count,
  navigateTo,
  navigateNext,
  navigatePrev
} = useTraite()

const positions: TraiteFieldPositions = {
  numero:           { top: '4%',  right: '6%' },
  tireur:           { top: '14%', left: '4%' },
  tire:             { top: '14%', left: '52%' },
  banque:           { top: '22%', left: '52%' },
  rib:              { top: '28%', left: '52%' },
  montantChiffres:  { top: '34%', right: '8%' },
  montantLettres:   { top: '42%', left: '4%',  width: '92%' },
  dateEcheance:     { top: '54%', right: '8%' },
  dateEmission:     { top: '60%', left: '4%' },
  lieu:             { top: '54%', left: '4%' },
  beneficiaire:     { top: '66%', left: '4%' },
  signature:        { bottom: '12%', right: '8%' }
}

function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>