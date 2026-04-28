<template>
  <div class="traite-preview-wrapper">

    <div v-if="count > 1" class="preview-nav">
      <button class="nav-btn" :disabled="currentIndex === 0" @click="navigatePrev">
        <svg viewBox="0 0 20 20" fill="currentColor" class="nav-btn-icon">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
      <div class="nav-pills">
        <button v-for="i in count" :key="i" class="nav-pill"
          :class="{ 'nav-pill-active': currentIndex === i - 1 }"
          @click="navigateTo(i - 1)">{{ i }}</button>
      </div>
      <button class="nav-btn" :disabled="currentIndex === count - 1" @click="navigateNext">
        <svg viewBox="0 0 20 20" fill="currentColor" class="nav-btn-icon">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>

    <div v-if="count > 1" class="preview-label">Traite {{ currentIndex + 1 }} / {{ count }}</div>

    <div class="traite-document-wrapper">
      <div class="traite-document">
        <div class="traite-overlay">
          <img :src="traiteBg" class="traite-bg-img" alt="Lettre de change" />

          <!-- Numéro traite (haut droite, rouge) -->
          <span class="tf tf-numero" style="top:8.5%; left:61%;">{{ D.numero }}</span>

          <!-- Date d'échéance -->
          <span class="tf tf-date" style="top:15.8%; left:30%;">{{ D.dateEcheance ? fmt(D.dateEcheance) : '' }}</span>

          <!-- Lieu d'émission -->
          <span class="tf tf-lieu" style="top:12%; left:50%;">{{ D.lieu }}</span>

          <!-- Date d'émission -->
          <span class="tf tf-date" style="top:17%; left:50%;">{{ D.dateEmission ? fmt(D.dateEmission) : '' }}</span>

          <!-- Montant en chiffres -->
          <span class="tf tf-montant-chiffres" style="top:25%; left:79%;">{{ D.montant ? D.montant.toFixed(3) : '' }}</span>

          <!-- RIB du Tiré (corps principal) -->
          <span class="tf tf-rib" style="top:23.5%; left:29.9%; max-width:38%;">{{ fmtRib(D.rib) }}</span>

          <!-- Tireur -->
          <span class="tf tf-nom" style="top:35%; left:10%; max-width:18%;">{{ nomTireur }}</span>

          <!-- Bénéficiaire -->
          <span class="tf tf-nom" style="top:36.5%; left:37%; max-width:28%;">{{ nomBeneficiaire }}</span>

          <!-- Montant chiffres 2e occurrence -->
          <span class="tf tf-montant-chiffres" style="top:38%; left:85%;">{{ D.montant ? D.montant.toFixed(3) : '' }}</span>

          <!-- Montant en lettres -->
          <span class="tf tf-montant-lettres" style="top:47%; left:15%; max-width:70%;">{{ D.montantLettres }}</span>

          <!-- TALON - LIGNE 1 -->
          <span class="tf tf-small" style="top:55.5%; left:7%;  max-width:10%;">{{ D.lieu }}</span>
          <span class="tf tf-small" style="top:55.5%; left:20%;">{{ D.dateEmission ? fmt(D.dateEmission) : '' }}</span>
          <span class="tf tf-small" style="top:55.5%; left:35%;">{{ D.dateEcheance ? fmt(D.dateEcheance) : '' }}</span>

          <!-- TALON - LIGNE 2 : RIB + Banque -->
          <span class="tf tf-rib" style="top:63.5%; left:3%; max-width:35%;">{{ fmtRib(D.rib) }}</span>
          <span class="tf tf-small" style="top:63.5%; left:74%; max-width:22%;">{{ D.banqueNom }}</span>

          <!-- Zone "Accepté" - nom du Tiré -->
          <span class="tf tf-small" style="bottom:25%; left:55%; max-width:15%;">{{ nomTire }}</span>
        </div>
      </div>

      <div v-if="!hasAnyData" class="preview-hint-overlay">
        <div class="preview-hint-box">
          <svg viewBox="0 0 20 20" fill="currentColor" class="hint-icon">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          Commencez à remplir le formulaire pour voir l'aperçu
        </div>
      </div>
    </div>

    <div v-if="hasAnyData" class="preview-info">
      <div class="info-chip">
        <span class="info-chip-label">Montant</span>
        <span class="info-chip-value">{{ D.montant ? D.montant.toFixed(3)+' DT' : '—' }}</span>
      </div>
      <div class="info-chip">
        <span class="info-chip-label">Échéance</span>
        <span class="info-chip-value">{{ D.dateEcheance ? fmt(D.dateEcheance) : '—' }}</span>
      </div>
      <div class="info-chip">
        <span class="info-chip-label">N°</span>
        <span class="info-chip-value">{{ D.numero || '—' }}</span>
      </div>
      <div class="info-chip info-chip-role info-chip-tireur">
        <span class="info-chip-label">Tireur</span>
        <span class="info-chip-value">{{ nomTireur || '—' }}</span>
      </div>
      <div class="info-chip info-chip-role info-chip-tire">
        <span class="info-chip-label">Tiré</span>
        <span class="info-chip-value">{{ nomTire || '—' }}</span>
      </div>
      <div class="info-chip">
        <span class="info-chip-label">Banque</span>
        <span class="info-chip-value">{{ D.banqueNom || '—' }}</span>
      </div>
      <div class="info-chip">
        <span class="info-chip-label">RIB</span>
        <span class="info-chip-value rib-chip">{{ fmtRib(D.rib) || '—' }}</span>
      </div>
      <div class="info-chip">
        <span class="info-chip-label">Type</span>
        <span class="info-chip-value" style="text-transform:capitalize;">{{ D.typeTraite || '—' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import traiteBg from '@/assets/traite.png';
import { useTraite } from '@/composables/useTraite';
import { montantEnLettres } from '@/utils/numberToWords';

const { formState, current, currentIndex, count, navigateTo, navigateNext, navigatePrev } = useTraite();

function fmt(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Formate un RIB tunisien de 20 chiffres en groupes : XX XXX XXXXXXXXXXXXXXX XX
 */
function fmtRib(raw: string | undefined | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 20) return raw;
  return `${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5,18)} ${digits.slice(18,20)}`;
}

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

const D = computed(() => {
  if (current.value) return { ...current.value };
  const f = formState.value;
  const m = f.montantTotal > 0 ? f.montantTotal : null;
  return {
    numero:         '',
    typeTraite:     f.typeTraite,
    montant:        m,
    montantLettres: m ? montantEnLettres(m) : '',
    dateEmission:   todayStr(),
    dateEcheance:   '',
    lieu:           f.lieu,
    beneficiaire:   f.beneficiaire,
    tireurNom:      f.tireurNom,
    banqueNom:      f.banqueNom,
    rib:            f.rib,
  };
});

const nomTireur = computed<string>(() => {
  if (D.value.typeTraite === 'client') return D.value.beneficiaire;
  return D.value.tireurNom;
});

const nomTire = computed<string>(() => {
  if (D.value.typeTraite === 'client') return D.value.tireurNom;
  return D.value.beneficiaire;
});

const nomBeneficiaire = computed<string>(() => {
  if (D.value.typeTraite === 'client') return D.value.beneficiaire;
  return D.value.tireurNom;
});

const hasAnyData = computed(() =>
  !!(D.value.tireurNom || D.value.banqueNom || D.value.rib ||
     D.value.montant   || D.value.lieu      || D.value.beneficiaire)
);
</script>

<style scoped lang="scss">
.traite-preview-wrapper {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9e5f5;
  box-shadow: 0 4px 16px rgba(124,58,237,.08), 0 2px 6px rgba(0,0,0,.04);
  overflow: hidden;
  padding: 20px 24px 24px;
}

/* ── Navigation ─────────────────────────────────── */
.preview-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}
.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid #e9e5f5;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all .15s ease;

  &:hover:not(:disabled) {
    border-color: #7c3aed;
    color: #7c3aed;
    background: #f5f3ff;
  }
  &:disabled {
    opacity: .35;
    cursor: not-allowed;
  }
}
.nav-btn-icon { width: 16px; height: 16px; }
.nav-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.nav-pill {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1.5px solid transparent;
  background: #f5f3ff;
  color: #6b7280;
  font-size: .8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all .15s ease;

  &:hover { border-color: #7c3aed; color: #7c3aed; }
  &-active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
}
.preview-label {
  text-align: center;
  font-size: .8rem;
  font-weight: 600;
  color: #6d28d9;
  margin-bottom: 12px;
}

/* ── Document wrapper ───────────────────────────── */
.traite-document-wrapper { position: relative; }
.traite-document {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9e5f5;
  box-shadow: 0 2px 12px rgba(0,0,0,.12);
  background: #f8f8f8;
}

/* ── Overlay principal ──────────────────────────── */
/*
  Principe responsive :
  - L'overlay a un aspect-ratio fixe (926/607) → sa hauteur suit sa largeur.
  - font-size: 1.5% → 1.5% de la LARGEUR du conteneur parent.
    (En CSS, % sur font-size est relatif à la largeur du parent pour les
     éléments en position absolute à l'intérieur d'un bloc.)
    Ex. : conteneur 400px → base 6px | 700px → 10.5px | 1000px → 15px
  - Tous les .tf-* utilisent des `em` relatifs à cette base.
  - top/left/bottom/max-width en % → relatifs aux dimensions de l'overlay.
  - Aucun pixel ni vw sur les éléments positionnés.
*/
.traite-overlay {
  position: relative;
  width: 100%;
  aspect-ratio: 926 / 607;
  overflow: hidden;
  display: block;
  font-size: 80%; /* base responsive : 2.2% de la largeur du conteneur */
}

.traite-bg-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: fill;
  display: block;
  user-select: none;
  pointer-events: none;
}

/* ── Hint overlay ───────────────────────────────── */
.preview-hint-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,.45);
  backdrop-filter: blur(1.5px);
  border-radius: 8px;
  pointer-events: none;
}
.preview-hint-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(124,58,237,.9);
  color: #fff;
  font-size: .82rem;
  font-weight: 600;
  border-radius: 30px;
  box-shadow: 0 4px 16px rgba(124,58,237,.35);
  white-space: nowrap;
}
.hint-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ══════════════════════════════════════════════════
   CHAMPS POSITIONNÉS — ZÉRO PIXEL, 100% RESPONSIVE
   Toutes les tailles sont en `em` relatifs à la
   font-size de .traite-overlay (= 1.5% du conteneur).
   ══════════════════════════════════════════════════ */

.tf {
  position: absolute;
  font-family: 'Arial', 'Helvetica', sans-serif;
  color: #00008B;
  font-weight: 600;
  line-height: 1.2;
  font-size: 1em;        /* = 2.2% de la largeur du conteneur */
  white-space: nowrap;
  overflow: visible;
  pointer-events: none;
}

.tf-numero {
  font-family: 'Courier New', monospace !important;
  font-size: 1.05em !important;
  font-weight: 700;
  color: #8B0000;
  letter-spacing: 0.03em;
}

.tf-date {
  font-family: 'Courier New', monospace !important;
  font-size: 0.9em !important;
  color: #00008B;
  font-weight: 700;
}

.tf-montant-chiffres {
  font-size: 0.95em !important;
  font-weight: 800;
  color: #00008B;
}

.tf-montant-lettres {
  font-size: 0.79em !important;
  font-style: italic;
  font-weight: 600;
  white-space: normal;
  line-height: 1.4;
  color: #000080;
}

.tf-rib {
  font-family: 'Courier New', monospace !important;
  letter-spacing: 0.09em;
  word-spacing: 3.1em;   /* em au lieu de px fixe → scale avec la taille */
  font-size: 0.85em !important;
  font-weight: 700;
  color: #000080;
}

.tf-nom {
  font-size: 1em !important;
  font-weight: 700;
  color: #00008B;
  white-space: normal;
  line-height: 1.3;
}

.tf-banque {
  font-size: 7em !important;
  font-weight: 600;
  white-space: normal;
  color: #000080;
}

.tf-lieu {
  font-size: 1.05em !important;
  font-weight: 600;
  color: #000080;
}

.tf-small {
  font-size: 0.9em !important;
  font-weight: 500;
  white-space: nowrap;
  color: #000080;
}

.tf-signature {
  font-size: 0.78em !important;
  font-weight: 600;
  color: #000080;
}

/* ── Chips résumé ───────────────────────────────── */
.preview-info {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.info-chip {
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: #f5f3ff;
  border-radius: 8px;
}
.info-chip-label {
  font-size: .65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #9ca3af;
  margin-bottom: 3px;
}
.info-chip-value {
  font-size: .82rem;
  font-weight: 700;
  color: #1e1b4b;
  text-align: center;

  &.rib-chip {
    font-family: 'Courier New', monospace;
    font-size: .72rem;
    letter-spacing: .5px;
  }
}

.info-chip-role {
  border: 1.5px solid transparent;
  .info-chip-label { font-size: .6rem; letter-spacing: .08em; }
}
.info-chip-tireur {
  background: #fef3c7;
  border-color: rgba(217,119,6,.25);
  .info-chip-label { color: #b45309; }
  .info-chip-value { color: #92400e; }
}
.info-chip-tire {
  background: #dbeafe;
  border-color: rgba(59,130,246,.25);
  .info-chip-label { color: #1d4ed8; }
  .info-chip-value { color: #1e3a5f; }
}
</style>