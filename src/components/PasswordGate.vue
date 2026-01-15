<template>
  <div class="password-gate">
    <div class="gate-inner">
      <h2>Passwort</h2>

      <div class="mode-switch">
        <button :class="{active: mode==='account'}" @click="mode='account'">Account Login</button>
        <button :class="{active: mode==='simple'}" @click="mode='simple'">Einfaches Passwort</button>
      </div>

      <div v-if="mode === 'account'" class="account-login">
        <input v-model="username" placeholder="Benutzername" />
        <input v-model="password" type="password" placeholder="Passwort" @keyup.enter="tryUnlockAccount" />
        <div class="actions">
          <button @click="tryUnlockAccount">Login</button>
        </div>
      </div>

      <div v-else class="simple-login">
        <input v-model="input" @keyup.enter="tryUnlockSimple" placeholder="Gib das Passwort ein" />
        <div class="actions">
          <button @click="tryUnlockSimple">Öffnen</button>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from './auth.js';

const input = ref('');
const username = ref('');
const password = ref('');
const error = ref('');
const mode = ref('account'); // 'account' or 'simple'
const authStore = useAuthStore();

async function tryUnlockSimple() {
  const SECRET = 'passwort';
  if (input.value === SECRET) {
    sessionStorage.setItem('site_unlocked', 'true');
    error.value = '';
    window.dispatchEvent(new CustomEvent('site-unlocked'));
  } else {
    error.value = 'Falsches Passwort';
  }
}

async function tryUnlockAccount() {
  error.value = '';
  if (!username.value || !password.value) {
    error.value = 'Bitte Benutzername und Passwort eingeben';
    return;
  }
  try {
    await authStore.login(username.value, password.value);
    // mark site unlocked
    sessionStorage.setItem('site_unlocked', 'true');
    window.dispatchEvent(new CustomEvent('site-unlocked'));
  } catch (e) {
    try {
      const msg = (e && e.message) ? e.message : 'Login fehlgeschlagen';
      error.value = msg;
    } catch { error.value = 'Login fehlgeschlagen'; }
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
.mode-switch { display:flex; gap:0.5rem; }
.mode-switch button { padding: 0.4rem 0.8rem; border:1px solid #ccc; background:#fff; }
.mode-switch button.active { background:#0c4b47; color:#fff; border-color:#0c4b47; }
.account-login input, .simple-login input { display:block; margin:6px 0; }
</style>
