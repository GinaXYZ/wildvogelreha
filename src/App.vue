<template>
  <div>
    <PasswordGate v-if="!unlocked" />
    <div v-else class="app-container">
      <Header />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import PasswordGate from './components/PasswordGate.vue'
import { onMounted, ref } from 'vue';
import { useAuthStore } from './components/auth.js';
import { loadCartFromDB } from './components/cartState.js';

const authStore = useAuthStore();
const unlocked = ref(sessionStorage.getItem('site_unlocked') === 'true');

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