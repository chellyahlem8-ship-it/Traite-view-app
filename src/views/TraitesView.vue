<!-- ✅ CRÉER: src/views/TraitesView.vue -->
<template>
  <div class="traites-page">
    <AppSidebar />
    
    <main class="traites-main">
      <div class="traites-header">
        <div>
          <h1 class="traites-title">Traites</h1>
          <p class="traites-subtitle">Génération et gestion des effets de commerce</p>
        </div>
        <div class="header-badge">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
          {{ traitess.length }} traite(s)
        </div>
      </div>

      <div class="traites-layout">
        <div class="traites-form-panel">
          <TraiteForm />
        </div>
        <div class="traites-preview-panel">
          <TraitePreview />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/Sidebar.vue'
import TraiteForm from '@/components/traites/TraiteForm.vue'
import TraitePreview from '@/components/traites/TraitePreview.vue'
import { useTraite } from '@/composables/useTraite'

const { traitess } = useTraite()
</script>

<style scoped lang="scss">
.traites-page {
  display: flex;
  min-height: 100vh;
  background: #f8f7ff;
}

.traites-main {
  margin-left: 240px;
  flex: 1;
}

.traites-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px 0;
}

.traites-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e1b4b;
  margin: 0;
  letter-spacing: -0.02em;
}

.traites-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 4px 0 0;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 20px;
}

.traites-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  padding: 24px 32px 32px;
  align-items: start;
}

.traites-form-panel {
  position: sticky;
  top: 24px;
}

.traites-preview-panel {
  min-height: 600px;
}

@media (max-width: 1024px) {
  .traites-main {
    margin-left: 0;
  }
  .traites-layout {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  .traites-form-panel {
    position: static;
  }
}
</style>