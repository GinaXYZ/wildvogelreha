<template>
  <div class="password-gate">
    <div class="gate-inner">
      <h2>Passwort</h2>
      <input v-model="input" @keyup.enter="tryUnlock" placeholder="Gib das Passwort ein" />
      <div class="actions">
        <button @click="tryUnlock">Öffnen</button>
      </div>
      <p v-if="error" class="error">Falsches Passwort</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const input = ref('');
const error = ref(false);
const SECRET = 'passwort'; // hard-coded credential as requested

function tryUnlock() {
  if (input.value === SECRET) {
    sessionStorage.setItem('site_unlocked', 'true');
    error.value = false;
    const ev = new CustomEvent('site-unlocked');
    window.dispatchEvent(ev);
  } else {
    error.value = true;
  }
}
</script>

<style scoped>
.password-gate {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff; /* white page */
  z-index: 9999;
}
.gate-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}
input { padding: 0.5rem; min-width: 220px; }
.actions button { padding: 0.5rem 1rem; }
.error { color: #b00; font-size: 0.9rem; }
</style>
