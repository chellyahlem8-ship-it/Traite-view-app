<template>
  <button class="hamburger-btn" @click="toggleSidebar" :aria-expanded="isOpen" aria-label="Menu">
    <span class="hamburger-line" :class="{ open: isOpen }"></span>
    <span class="hamburger-line" :class="{ open: isOpen }"></span>
    <span class="hamburger-line" :class="{ open: isOpen }"></span>
  </button>

  <div class="sidebar-overlay" :class="{ visible: isOpen }" @click="closeSidebar"></div>

  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">

    <div class="sidebar-logo">
      <TraityLogo :size="28" show-text />
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" active-class="active" @click="closeSidebar">
        <span class="nav-icon">🏠</span> Tableau de bord
      </router-link>

      <router-link :to="{ name: 'Traites' }" class="nav-item" active-class="active" @click="closeSidebar">
        <span class="nav-icon">📄</span> Traites
      </router-link>

      <router-link :to="{ name: 'Tiers' }" class="nav-item" active-class="active" @click="closeSidebar">
        <span class="nav-icon">👥</span> Tiers
      </router-link>

      <router-link :to="{ name: 'Societe' }" class="nav-item" active-class="active" @click="closeSidebar">
        <span class="nav-icon">🏢</span> Société
      </router-link>

      <router-link :to="{ name: 'Utilisateurs' }" class="nav-item" active-class="active" @click="closeSidebar">
        <span class="nav-icon">👤</span> Utilisateurs
      </router-link>

      <router-link :to="{ name: 'Abonnements' }" class="nav-item" active-class="active" @click="closeSidebar">
        <span class="nav-icon">💳</span> Abonnements
      </router-link>

      <button class="nav-item" disabled>
        <span class="nav-icon">💰</span> Trésorerie
      </button>

      <button class="nav-item" disabled>
        <span class="nav-icon">⚙️</span> Paramètres
      </button>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="handleLogout">
        <span>🚪</span> Déconnexion
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import TraityLogo from '@/components/TraityLogo.vue'

const { logout } = useAuth()
const handleLogout = () => { logout() }

const isOpen = ref(false)
const toggleSidebar = () => { isOpen.value = !isOpen.value }
const closeSidebar  = () => { isOpen.value = false }
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.hamburger-btn {
  display: none;
  position: fixed;
  top: 0;
  left: 16px;
  z-index: 99999;
  background: #4c1d95;
  border: none;
  border-radius: 0 0 10px 10px;
  width: 48px;
  height: 48px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(76, 29, 149, 0.5);
  isolation: isolate;

  @media (max-width: 768px) {
    display: flex;
  }
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;

  &.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  &.open:nth-child(2) { opacity: 0; }
  &.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: 0;
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    display: block;
    pointer-events: none;
    &.visible {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #2e1065 0%, #4c1d95 100%);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  box-shadow: 4px 0 24px rgba(76, 29, 149, 0.3);
  font-family: 'Outfit', sans-serif;
  overflow: hidden;

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    &--open { transform: translateX(0); }
  }
}

.sidebar-logo {
  flex-shrink: 0;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-family: 'Outfit', sans-serif;
  flex-shrink: 0;

  &:hover:not([disabled]) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 600;
  }

  &[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.nav-icon { font-size: 16px; width: 20px; text-align: center; }

.sidebar-footer {
  flex-shrink: 0;
  padding: 12px 10px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Outfit', sans-serif;
  width: 100%;

  &:hover {
    background: rgba(239, 68, 68, 0.25);
    color: #fecaca;
  }
}
</style>