<template>
  <div class="app-container">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import { onMounted } from 'vue';
import { useAuthStore } from './components/auth.js';
import { loadCartFromDB } from './components/cartState.js';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
  loadCartFromDB();
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