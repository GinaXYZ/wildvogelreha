<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const confirmPassword = ref(''); 
const firstname = ref('');
const lastname = ref('');
const email = ref('');
const message = ref('');
const error = ref('');
const router = useRouter();

const register = async () => {

  error.value = '';
  message.value = '';
  

  if (password.value !== confirmPassword.value) {
    error.value = 'Die Passwörter stimmen nicht überein.';
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
      }),
    });

    if (res.ok) {
      message.value = 'Registrierung erfolgreich! Sie werden zur Login-Seite weitergeleitet.';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Registrierung fehlgeschlagen');
    }
  } catch (err) {
    console.error('Registrierungsfehler:', err.message);
    error.value = err.message; 
  }
};
</script>

<template>
  <div class="register">
    <h1>Registrierung</h1>
    <form @submit.prevent="register">
      <input v-model="username" type="text" placeholder="Benutzername" required />
      <input v-model="password" type="password" placeholder="Passwort" required />
      <input v-model="confirmPassword" type="password" placeholder="Passwort wiederholen" required />
      <input v-model="firstname" type="text" placeholder="Vorname" required />
      <input v-model="lastname" type="text" placeholder="Nachname" required />
      <input v-model="email" type="email" placeholder="E-Mail" required />
      <button type="submit" class="submit">Registrieren</button>
    </form>
    <p class="error-message" v-if="error">{{ error }}</p>
    <p class="success-message" v-if="message">{{ message }}</p>
    <p class="login-link">
      Bereits ein Konto? <router-link to="/login">Hier einloggen</router-link>
    </p>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .register,
  .checkout-page,
  .contact-page {
    width: 100% !important;
    min-width: 0;
    padding: 1rem !important;
    margin-top: 2rem !important;
  }
  input, select, textarea {
    font-size: 1rem;
  }
}
.register {
  max-width: 1200px;
  width: 50%;
  margin: auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  margin-top: 10rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.submit {
  background-color: #0c4b47;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  width: 100%;
  margin-top: 2rem;
  position: center;
  transition: background-color 0.3s ease;
}

.error-message {
  color: red;
  margin-top: 1rem;
}

.success-message {
  color: green;
  margin-top: 1rem;
}

.login-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.login-link a {
  color: #0c4b47;
  text-decoration: underline;
}

.submit:hover {
  background-color: #083330;
}
</style>