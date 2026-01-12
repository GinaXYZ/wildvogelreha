<template>
  <div class="profile">
    <h1>Mein Profil</h1>
    <div v-if="loading" class="loading">Lade Profil...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="tabs">
        <button :class="{active: activeTab==='profil'}" @click="activeTab='profil'">Profil</button>
        <button :class="{active: activeTab==='orders'}" @click="activeTab='orders'">Bestellungen</button>
        <button
          v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'staff'"
          :class="{active: activeTab==='staff'}"
          @click="activeTab='staff'"
        >
          Mitarbeiterbereich
        </button>
      </div>
      <div v-if="activeTab==='profil'" class="profile-details">
        <p><strong>ID:</strong> {{ profile.id }}</p>
        <p><strong>Benutzername:</strong> {{ profile.username }}</p>
        <p><strong>Vorname:</strong> {{ profile.firstname }}</p>
        <p><strong>Nachname:</strong> {{ profile.lastname }}</p>
        <p><strong>E-Mail:</strong> {{ profile.email }}</p>
        <p><strong>Rolle:</strong> {{ profile.role }}</p>
        <p><strong>Registriert seit:</strong> {{ formatDate(profile.date) }}</p>
      </div>
      <div v-else-if="activeTab==='orders'" class="orders-tab">
        <div v-if="ordersLoading">Lade Bestellungen...</div>
        <div v-else-if="ordersError" class="error">{{ ordersError }}</div>
        <div v-else>
          <div v-if="orders.length === 0">Keine Bestellungen gefunden.</div>
          <div v-for="order in orders" :key="order.id" class="order-box">
            <p><strong>Bestellnummer:</strong> {{ order.id }}</p>
            <p><strong>Name:</strong> {{ order.firstname }} {{ order.lastname }}</p>
            <p><strong>Datum:</strong> {{ formatDate(order.created_at) }}</p>
            <p><strong>Zahlungsart:</strong> {{ order.payment }}</p>
            <p><strong>Versandadresse:</strong>
              {{ [order.address, order.city, order.country].filter(Boolean).join(', ') }}
            </p>
            <p><strong>Lieferadresse:</strong>
              {{ [order.address, order.city, order.country].filter(Boolean).join(', ') }}
            </p>
            <p><strong>Gesamtbetrag:</strong>
              {{
                order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
              }} €
            </p>
            <div>
              <strong>Bearbeitungsstatus:</strong>
              <span
                class="status-square"
                :class="{
                  green: order.status === 'success',
                  red: order.status === 'error',
                  yellow: order.status === 'pending',
                  orange: order.status === 'shipped',
                  black: order.status === 'canceled'
                }"
                :title="statusText(order.status)"
              ></span>
              <template v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'staff'">
                <select v-model="order.status" @change="updateOrderStatus(order)">
                  <option value="pending">In Bearbeitung</option>
                  <option value="shipped">Versandt</option>
                  <option value="success">Erfolgreich</option>
                  <option value="error">Nicht erfolgreich</option>
                  <option value="canceled">Storniert</option>
                </select>
              </template>
              <template v-else>
                {{ statusText(order.status) }}
              </template>
            </div>
            <ul>
              <li v-for="item in order.items" :key="item.product_id">
                <img :src="item.image" alt="" style="height:2em;vertical-align:middle;margin-right:0.5em;">
                {{ item.title }} – Menge: {{ item.quantity }} – Einzelpreis: {{ item.price }} €
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        v-else-if="activeTab==='staff' && (authStore.user?.role === 'admin' || authStore.user?.role === 'staff')"
        class="staff-tab"
      >
        <Staff />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from './auth.js';
import Staff from './Staff.vue';

const profile = ref(null);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('profil');
const orders = ref([]);
const ordersLoading = ref(false);
const ordersError = ref(null);
const authStore = useAuthStore();

const fetchOrders = async () => {
  ordersLoading.value = true;
  ordersError.value = null;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Fehler beim Laden der Bestellungen');
    orders.value = await res.json();
  } catch (err) {
    ordersError.value = err.message;
  } finally {
    ordersLoading.value = false;
  }
};

const fetchProfile = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(errorResponse.error || 'Sie müssen sich anmelden, um auf Ihr Profil zuzugreifen.');
    }
    profile.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
  fetchOrders();
});
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

const statusText = (status) => {
  if (status === 'success') return 'Erfolgreich';
  if (status === 'error') return 'Nicht erfolgreich';
  if (status === 'pending') return 'In Bearbeitung';
  if (status === 'shipped') return 'Versandt';
  if (status === 'canceled') return 'Storniert';
  return 'Unbekannt';
};
const updateOrderStatus = async (order) => {
  try {
    await fetch('/api/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status: order.status }),
    });
  } catch (e) {
    alert('Fehler beim Aktualisieren des Status');
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.8rem;
  justify-content: center;
}
.tabs button {
  background: #eee;
  color: #0c4b47;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: none;
  outline: none;
  border: none;
}
.tabs button.active {
  background: #0c4b47;
  color: #fff;
}
.tabs button:hover {
  border-color: #0c4b47;
  transform: translateY(-2px);
}
.order-box {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 2rem;
  padding: 1rem;
  text-align: left;
}
.profile {
  padding: 2rem; 
  margin: 12rem auto;
  position: relative; 
  max-width: 1200px;
  width: 100%;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
}

.error {
  text-align: center;
  color: red;
  font-size: 1.2rem;
}

.profile-details p {
  margin: 0.5rem 0;
}

.profile-details strong {
  color: #0c4b47;
}
.status-square {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 0.5em;
  margin-left: 0.5em;
  vertical-align: middle;
  border: 1px solid #000000;
}
.status-square.green {
  background: #4caf50;
}
.status-square.red {
  background: #e53935;
}
.status-square.orange {
  background: #66b5ff;
}
.status-square.yellow {
  background: #afff02;
}
.status-square.black {
  background: #000000;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .profile {
    padding: 1rem;
    margin: 14rem auto 2rem auto;
    width: 95%;
  }
  .tabs {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .tabs button {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
  .order-box {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .profile {
    margin-top: 16rem;
    padding: 0.5rem;
  }
  .tabs button {
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
  }
}
</style>