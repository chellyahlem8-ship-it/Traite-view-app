<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <TraityLogo :size="28" show-text />
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <span class="nav-icon">🏠</span> Tableau de bord
      </router-link>

      <router-link to="/traites" class="nav-item" active-class="active">
        <span class="nav-icon">📄</span> Traites
      </router-link>

      <!-- ✅ AVANT : <button class="nav-item" disabled> -->
      <!-- ✅ APRÈS : router-link vers la route qui existe maintenant -->
      <router-link to="/tiers/create" class="nav-item" active-class="active">
        <span class="nav-icon">👥</span> Tiers
      </router-link>

      <router-link to="/banques/create" class="nav-item" active-class="active">
        <span class="nav-icon">🏦</span> Banques
      </router-link>
      <router-link to="/comptes-bancaires/create" class="nav-item" active-class="active">
        <span class="nav-icon">🏦</span> Comptes bancaires
      </router-link>

      <!-- ❌ Ceux-ci restent disabled car pas de route encore -->
      <button class="nav-item" disabled>
        <span class="nav-icon">💰</span> Trésorerie
      </button>
      <button class="nav-item" disabled>
        <span class="nav-icon">⚙️</span> Paramètres
      </button>
    </nav>

    <button class="logout-btn" @click="handleLogout">
      <span>🚪</span> Déconnexion
    </button>
  </aside>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'

const { logout } = useAuth()
const handleLogout = () => { logout() }
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-logo {
  margin-bottom: 36px;
  :deep(.traity-name) { color: #fff; }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;

  &:hover:not([disabled]) {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 600;
  }

  // Boutons désactivés
  &[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .nav-icon {
    font-size: 16px;
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: background 0.2s;
  margin-top: auto;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>