<script setup>
import { onMounted } from 'vue';
import { cart, removeFromCart, loadCartFromDB, mergeCarts } from './cartState.js';
import { useAuthStore } from './auth.js'; 

const authStore = useAuthStore(); 
const isLoggedIn = authStore.isLoggedIn; 
const user = authStore.user; 

const increaseQuantity = (item) => {
  item.quantity += 1;
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    removeFromCart(item);
  }
};

onMounted(() => {
  loadCartFromDB();
});
</script>

<template>
  <div class="cart-layout">
    <h2>Warenkorb</h2>
    <div class="cart-container" v-if="cart.length > 0">
      <div class="cart-item" v-for="(item, index) in cart" :key="item.id">
        <img :src="item.image" alt="Produktbild" class="cart-image" />
        <div class="cart-details">
          <h3 class="cart-title">{{ item.title }}</h3>
          <p class="cart-price">{{ item.price }} €</p>
          <div class="cart-quantity">
            <button class="quantity-button" @click="decreaseQuantity(item)">-</button>
            <span>{{ item.quantity }}</span>
            <button class="quantity-button" @click="increaseQuantity(item)">+</button>
          </div>
        </div>
        <button class="remove-button" @click="removeFromCart(item)">Entfernen</button>
      </div>
    </div>
    <p v-else>Der Warenkorb ist leer.</p>
    <div v-if="!isLoggedIn" class="login-prompt">
      <p>Sie müssen sich anmelden, um Ihren Einkauf fortzufahren.</p>
      <router-link to="/login" class="login-link">Anmelden</router-link>
    </div>
    <router-link
      v-if="isLoggedIn && ['customer', 'admin', 'staff'].includes(user?.role) && cart.length > 0"
      to="/checkout"
      class="bezahlen-link"
    >
      Checkout
    </router-link>
  </div>
</template>

<style scoped>
p {
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
}

.bezahlen-link {
  background-color: #0c4b47; 
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  position: center;
  text-align: center;
  max-width: 150px;
  margin: 0 auto;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'Helvetica', sans-serif;
  text-decoration: none; 
  display: block;
  margin-top: 2rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.bezahlen-link:hover {
  background-color: #097a6a;
  transform: scale(1.05); 
}
.bezahlen-link:active {
  background-color: #0c4b47; 
  transform: scale(0.95); 
}
.cart-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr; 
  gap: 2rem;
  margin: 0 auto;
  max-width: 1200px;
  padding: 2rem 1rem;
  text-align: center;
}
.bezahlen {
  background-color: #0c4b47; 
  color: white;
  border: none;
  padding: 0.75rem 1.5rem; 
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1.5rem;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 250px; 
  margin: 0 auto;
  font-family: 'Helvetica', sans-serif;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.cart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  min-height: 350px;
}

.cart-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.cart-details {
  text-align: center;
}

.cart-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
    color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}

.cart-price {
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-quantity {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quantity-button {
  background-color: #0c4b47;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.quantity-button:hover {
  background-color: #097a6a;
}

.remove-button {
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.remove-button:hover {
  background-color: #e74c3c;
}

h2 {
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  text-align: center;
  margin-top: 6rem;
  font-size: 2rem;
}
.login-prompt {
  margin-top: 2rem;
  text-align: center;
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
}

.login-link {
  display: inline-block;
  margin-top: 1rem;
  background-color: #0c4b47;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.login-link:hover {
  background-color: #097a6a;
  transform: scale(1.05);
}

.login-link:active {
  background-color: #0c4b47;
  transform: scale(0.95);
}

/* ===== Responsive Cart ===== */
@media (max-width: 768px) {
  h2 {
    margin-top: 5rem;
    font-size: 1.6rem;
  }
  
  .cart-layout {
    padding: 1.5rem 0.8rem;
    gap: 1.5rem;
  }
  
  .cart-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .cart-item {
    min-height: 300px;
    padding: 0.8rem;
  }
  
  .cart-image {
    width: 120px;
    height: 120px;
  }
  
  .bezahlen-link {
    font-size: 1.2rem;
    padding: 0.6rem 1.2rem;
  }
}

@media (max-width: 480px) {
  h2 {
    margin-top: 4.5rem;
    font-size: 1.4rem;
  }
  
  .cart-container {
    grid-template-columns: 1fr;
  }
  
  .cart-image {
    width: 100px;
    height: 100px;
  }
  
  .cart-title {
    font-size: 1rem;
  }
  
  .quantity-button,
  .remove-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>