<template>
  <div>
    <PasswordGate v-if="!unlocked" />
    <div v-else class="app-container">
      <Header v-if="!hideHeader" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import PasswordGate from './components/PasswordGate.vue'
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from './components/auth.js';
import { loadCartFromDB } from './components/cartState.js';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const unlocked = ref(sessionStorage.getItem('site_unlocked') === 'true');
const route = useRoute();

const hideHeader = computed(() => {
  // hide header for the isolated project route
  return route.name === 'ProjektAppointments' || route.path === '/projekt';
});

function handleGlobalUnlock() {
  unlocked.value = true;
}

onMounted(() => {
  authStore.initAuth();
  loadCartFromDB();
  window.addEventListener('site-unlocked', handleGlobalUnlock);
});
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Default header height */
}

@media (max-width: 900px) {
  .main-content {
    padding-top: 65px;
  }
}

@media (max-width: 600px) {
  .main-content {
    padding-top: 60px;
  }
}

@media (max-width: 400px) {
  .main-content {
    padding-top: 55px;
  }
}
</style>