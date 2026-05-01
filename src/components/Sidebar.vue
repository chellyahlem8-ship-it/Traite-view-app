<template>
  <!-- Bouton hamburger (visible seulement sur mobile) -->
  <button class="hamburger-btn" @click="toggleSidebar" :aria-expanded="isOpen" aria-label="Menu">
    <span class="hamburger-line" :class="{ open: isOpen }"></span>
    <span class="hamburger-line" :class="{ open: isOpen }"></span>
    <span class="hamburger-line" :class="{ open: isOpen }"></span>
  </button>

  <!-- Overlay sombre (mobile uniquement) -->
  <div class="sidebar-overlay" :class="{ visible: isOpen }" @click="closeSidebar"></div>

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <div class="sidebar-logo">
      <TraityLogo :size="28" show-text />
    </div>

    <nav class="sidebar-nav">
      <router-link
        to="/dashboard"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">🏠</span> Tableau de bord
      </router-link>

      <router-link
        :to="{ name: 'Traites' }"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">📄</span> Traites
      </router-link>


      <router-link
        :to="{ name: 'Tiers' }"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">👥</span> Tiers
      </router-link>

      <router-link
        :to="{ name: 'CreateUtilisateur' }"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">👤</span> Utilisateurs
      </router-link>

      <router-link
        :to="{ name: 'BanquesCreate' }"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">🏦</span> Banques
      </router-link>

      <router-link
        :to="{ name: 'CreateCompteBancaire' }"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">💳</span> Comptes bancaires
      </router-link>
      <router-link
        :to="{ name: 'Abonnements' }"
        class="nav-item"
        active-class="active"
        @click="closeSidebar"
      >
        <span class="nav-icon">💳</span> Abonnements
      </router-link>

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

/* ── Hamburger ───────────────────────────────────────────────── */
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
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2.5px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.25s ease;
  transform-origin: center;

  &.open:nth-child(1) { transform: translateY(7px)  rotate(45deg);  }
  &.open:nth-child(2) { opacity: 0; transform: scaleX(0);           }
  &.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
}

/* ── Overlay ─────────────────────────────────────────────────── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 150;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;

  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
}

/* ── Sidebar ─────────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 200;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
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

  &[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .nav-icon { font-size: 16px; }
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

  &:hover { background: rgba(255, 255, 255, 0.2); }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hamburger-btn    { display: flex; }
  .sidebar-overlay  { display: block; }

  .sidebar {
    transform: translateX(-100%);
    &.sidebar--open { transform: translateX(0); }
  }
}

@supports (padding-top: env(safe-area-inset-top)) {
  .hamburger-btn { top: env(safe-area-inset-top); }
}
</style>