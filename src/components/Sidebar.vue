<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <TraityLogo :size="28" show-text />
    </div>
    
    <nav class="sidebar-nav">
      <!-- ✅ MODIFIÉ : ajout router-link pour Tableau de bord -->
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <span class="nav-icon">🏠</span> Tableau de bord
      </router-link>

      <!-- ✅ MODIFIÉ : remplaçé <a> par <router-link> vers /traites -->
      <router-link to="/traites" class="nav-item" active-class="active">
        <span class="nav-icon">📄</span> Traites
      </router-link>

      <!-- ❌ NON MODIFIÉS : les autres restent des <a> pour l'instant -->
      <a class="nav-item">
        <span class="nav-icon">💰</span> Trésorerie
      </a>
      <a class="nav-item">
        <span class="nav-icon">🏦</span> Banques
      </a>
      <a class="nav-item">
        <span class="nav-icon">👥</span> Tiers
      </a>
      <a class="nav-item">
        <span class="nav-icon">⚙️</span> Paramètres
      </a>
    </nav>

    <button class="logout-btn" @click="handleLogout">
      <span>🚪</span> Déconnexion
    </button>
  </aside>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'
// ✅ AJOUTÉ : import de useRoute si vous voulez un state actif custom (optionnel)
// import { useRoute } from 'vue-router'
// const route = useRoute()

const { logout } = useAuth()

const handleLogout = () => {
  logout()
}
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
  :deep(.traity-name) { color: #fff ; }
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
  color: rgba(255,255,255,0.75);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none; /* ✅ IMPORTANT : supprime le soulignement du router-link */

  &:hover { background: rgba(255,255,255,0.12); color: #fff; }
  &.active { background: rgba(255,255,255,0.2); color: #fff; font-weight: 600; }
  .nav-icon { font-size: 16px; }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: background 0.2s;
  margin-top: auto;
  
  &:hover { background: rgba(255,255,255,0.2); }
}
</style>