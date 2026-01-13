<script setup>
import { ref } from 'vue';
import { useAuthStore } from './auth.js';

const authStore = useAuthStore();

const firstname = ref('');
const lastname = ref('');
const email = ref('');
const telefon = ref('');
const msg = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

const submitContact = async () => {
  if (!firstname.value?.trim() || !lastname.value?.trim() || !email.value?.trim() || !telefon.value?.trim()) {
    error.value = 'Bitte füllen Sie alle Pflichtfelder aus.';
    return;
  }

  try {
    loading.value = true; 
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
        telefon: telefon.value,
        msg: msg.value
      }),
    });

    const data = await response.json();

    if (res.ok) {
          message.value = 'Vielen Dank! Ihre Nachricht wurde erfolgreich versendet. Wir melden uns bald bei Ihnen.';
      firstname.value = '';
      lastname.value = '';
      email.value = '';
      telefon.value = '';
      msg.value = '';  
    } else {
      error.value = data.error || 'Fehler beim Senden der Nachricht';
    }
  } catch (err) {
    error.value = 'Netzwerkfehler. Bitte versuchen Sie es später erneut.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="contact-page">
    <div class="contact-container">
      <h1>Kontakt</h1>
      <p class="contact-intro">
        Haben Sie einen verletzten Vogel gefunden oder Fragen zu unserer Arbeit? 
        Kontaktieren Sie uns gerne!
      </p>
      
      <form @submit.prevent="submitContact" class="contact-form">
        <div class="form-row">
          <input 
            v-model="firstname" 
            type="text" 
            placeholder="Vorname *" 
            required 
            :disabled="loading"
          />
          <input 
            v-model="lastname" 
            type="text" 
            placeholder="Nachname *" 
            required 
            :disabled="loading"
          />
        </div>
        
        <input 
          v-model="email" 
          type="email" 
          placeholder="E-Mail Adresse *" 
          required 
          :disabled="loading"
        />
        
        <input 
          v-model="telefon" 
          type="tel" 
          placeholder="Telefonnummer *" 
          required 
          :disabled="loading"
        />
            <textarea
            v-model="msg" 
            placeholder="Deine Nachricht (optional)" 
            :disabled="loading"
            class="message-textarea"
            ></textarea>
        
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="loading"
        >
          {{ loading ? 'Wird gesendet...' : 'Nachricht senden' }}
        </button>
      </form>
      
      <p class="error-message" v-if="error">{{ error }}</p>
      <p class="success-message" v-if="message">{{ message }}</p>
      
      <div class="contact-info">
        <h3>Weitere Kontaktmöglichkeiten</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>📞<br> Notfall-Hotline</strong>
            <p>0123 / 456 789</p>
            <small>24/7 für Notfälle</small>
          </div>
          <div class="info-item">
            <strong>📧<br> E-Mail</strong>
            <p>info@wildvogelreha-nord.de</p>
            <small>Antwort binnen 24h</small>
          </div>
          <div class="info-item">
            <strong>📍<br> Adresse</strong>
            <p>Musterstraße 123<br>12345 Brandenburg</p>
            <small>Termine nach Vereinbarung</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-family: 'Helvetica', sans-serif;
}

.contact-container {
  max-width: 600px;
  width: 100%;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  color: #0c4b47;
  margin-top: 5rem;
}

.contact-container h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #0c4b47;
}

.contact-intro {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #666;
  line-height: 1.5;
}

.contact-form {
  margin-bottom: 3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #0c4b47;
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  background: #0c4b47;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #097a6a 0%, #0a3a36 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}
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
.success-message {
  color: #155724;
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  background: #d4edda;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
}

.contact-info {
  border-top: 2px solid #e9ecef;
  padding-top: 2rem;
}

.contact-info h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #0c4b47;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.info-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #0c4b47;
}

.info-item p {
  margin: 0.5rem 0;
  font-weight: bold;
}

.info-item small {
  color: #666;
  font-size: 0.9rem;
}


@media (max-width: 768px) {
  .contact-page {
    padding: 1rem;
  }
  
  .contact-container {
    padding: 2rem 1.5rem;
    margin-top: 5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-container h1 {
    font-size: 1.8rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .contact-page {
    padding: 0.5rem;
  }
  
  .contact-container {
    padding: 1.5rem 1rem;
    margin-top: 4.5rem;
  }
  
  .contact-container h1 {
    font-size: 1.5rem;
  }
  
  .contact-intro {
    font-size: 1rem;
  }
  
  input,
  .message-textarea {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
  
  .submit-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
  
  .info-item {
    padding: 1rem;
  }
}
.message-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.message-textarea:focus {
  outline: none;
  border-color: #0c4b47;
}

.message-textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}
</style>