<template>
  <div class="checkout-page">
    <h1>Checkout</h1>
    <form @submit.prevent="submitCheckout">
      <div class="form-group">
        <label for="name">Vorname</label>
        <input type="text" id="name" v-model="formData.firstname" /> 
      </div>
      <div class="form-group">
        <label for="lastname">Nachname</label>
        <input type="text" id="lastname" v-model="formData.lastname" /> 
      </div>
        <div class="form-group">
          <label for="address">Adresse</label>
          <input type="text" id="address" v-model="formData.address" placeholder="Straße und Hausnummer" required />
        </div>
      <div class="form-group">
        <label for="city">Stadt</label>
        <input type="text" id="city" v-model="formData.city" placeholder="Stadt" required />
      </div>
      <div class="form-group">
        <label for="country">Land</label>
        <select id="country" v-model="formData.country" required>
          <option value="" disabled>Bitte wählen</option>
          <option v-for="country in countries" :key="country.code" :value="country.name">
            {{ country.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="email">E-Mail</label>
        <input type="email" id="email" v-model="formData.email" placeholder="Deine E-Mail-Adresse" required />
      </div>
      <div class="form-group">
        <label for="payment">Zahlungsmethode</label>
        <select id="payment" v-model="formData.payment" required>
          <option value="" disabled>Bitte wählen</option>
          <option value="credit-card">Kreditkarte</option>
          <option value="paypal">PayPal</option>
          <option value="bank-transfer">Banküberweisung</option>
        </select>
      </div>
      <button type="submit" class="checkout-button">Zahlungspflichtig bestellen</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from './auth.js';
import { cart } from './cartState.js';
import { useRouter } from 'vue-router';
const router = useRouter();
const authStore = useAuthStore();
const formData = ref({
  firstname: '', 
  lastname: '',  
  email: '',    
  address: '',  
  city: '',     
  payment: '',
  country: '',
});

const countries = ref([]);
const error = ref(null);

const fetchCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    countries.value = data
      .map(country => ({
        name: country.name.common,
        code: country.cca2,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Fehler beim Laden der Länder. Fallback wird verwendet.');
    countries.value = [
      { name: 'Deutschland', code: 'DE' },
      { name: 'Österreich', code: 'AT' },
      { name: 'Schweiz', code: 'CH' },
      { name: 'Frankreich', code: 'FR' },
      { name: 'Italien', code: 'IT' },
      { name: 'Spanien', code: 'ES' },
      { name: 'Vereinigte Staaten', code: 'US' },
      { name: 'Kanada', code: 'CA' },
      { name: 'Australien', code: 'AU' },
      { name: 'Japan', code: 'JP' },
    ];
  }
};

onMounted(fetchCountries);

const submitCheckout = async () => {
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstname: formData.value.firstname,
        lastname: formData.value.lastname,
        email: formData.value.email,
        address: formData.value.address, 
        city: formData.value.city,
        country: formData.value.country,
        payment: formData.value.payment,
        cart: cart.value,
        userId: authStore.user?.id || null
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Bestellung fehlgeschlagen');
    alert('Bestellung erfolgreich! Bestellnummer: ' + data.orderId);
    cart.value = [];  
    router.push('/');
  } catch (error) {
    alert('Fehler beim Bestellen: ' + error.message);
  }
};
</script>

<style scoped>
.checkout-page {
  max-width: 600px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 4rem; 
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.checkout-button {
  background-color: #0c4b47;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  width: 100%;
  transition: background-color 0.3s ease;
}

.checkout-button:hover {
  background-color: #097a6a;
}

/* ===== Responsive Checkout ===== */
@media (max-width: 768px) {
  .checkout-page {
    margin-top: 5rem;
    padding: 1.5rem;
    width: 95%;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .checkout-page {
    margin-top: 4.5rem;
    padding: 1rem;
    width: 100%;
    border-radius: 0;
  }
  
  h1 {
    font-size: 1.3rem;
  }
  
  .checkout-button {
    font-size: 1rem;
    padding: 0.7rem 1.2rem;
  }
}
</style>