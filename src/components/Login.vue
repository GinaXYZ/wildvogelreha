<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './auth.js';

const username = ref('');
const password = ref('');
const message = ref('');
const authStore = useAuthStore();
const router = useRouter();

const login = async () => {
  try {
    await authStore.login(username.value, password.value);
    message.value = 'Login erfolgreich!';
    import('./cartState.js').then(module => {
      module.mergeCarts();
    });
    router.push('/profile');
  } catch (error) {
    console.error('Login-Fehler:', error.message);
    message.value = error.message;
  }
};
</script>

<template>
  <div>
    <div class="login">
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input v-model="username" type="text" placeholder="Benutzername" required />
        <input v-model="password" type="password" placeholder="Passwort" required />
        <button type="submit">Login</button>
      </form>
      <p>{{ message }}</p>
      <p class="register-link">
        Noch kein Konto? <router-link to="/register">Hier registrieren</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-link a {
  color: #0c4b47;
  text-decoration: underline;
}
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 6rem;
  max-width: 400px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1rem;
  text-align: center;
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
}

.login input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.login button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0c4b47;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login button:hover {
  background-color: #097a6a;
}

/* ===== Responsive Login ===== */
@media (max-width: 768px) {
  .login {
    margin-top: 5rem;
  }
}

@media (max-width: 480px) {
  .login {
    margin-top: 4.5rem;
    padding: 1.5rem 0.8rem;
    width: 95%;
  }
  
  .login h1 {
    font-size: 1.5rem;
  }
}
</style>