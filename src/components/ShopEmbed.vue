<template>
  <div class="shop-embed">
    <button class="scroll-btn left" @click="scrollLeft">&#10094;</button>
    <div class="items-container" ref="container">
       <div
        v-for="item in items.slice(0, 5)"
        :key="item.id"
        class="item-card"
      >
        <img :src="item.image" alt="" class="item-image" />
        <h3 class="item-title">{{ item.title }}</h3>
        <p class="item-price">
          {{ item.price }} €
        </p>
        <button class="add-to-cart-button" @click="addToCartHandler(item)">In den Warenkorb</button>
      </div>
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </div>
    <button class="scroll-btn right" @click="scrollRight">&#10095;</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { addToCart } from './cartState.js';

const items = ref([]);
const toastMessage = ref('');
const showToast = ref(false);
const container = ref(null);
const fetchItems = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/products'); 
    if (!res.ok) throw new Error('Fehler beim Laden der Produkte');
    const data = await res.json();
    if (data && Array.isArray(data.results)) {
      items.value = data.results; 
    } else {
      console.error('ShopEmbed: Unerwartetes Datenformat von /api/products. Erwartet { results: [], ... }.', data);
      items.value = []; 
    }
  } catch (error) {
    console.error('API-Fehler in ShopEmbed:', error);
    items.value = []; 
  }
};

onMounted(() => {
  fetchItems();
});

const addToCartHandler = (product) => {
  addToCart(product);
  toastMessage.value = `${product.title} wurde zum Warenkorb hinzugefügt!`;
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const scrollLeft = () => {
  if (container.value) {
    container.value.scrollBy({ left: -200, behavior: 'smooth' });
  } else {
    console.error('Container reference is null');
  }
};

const scrollRight = () => {
  if (container.value) {
    container.value.scrollBy({ left: 200, behavior: 'smooth' });
  } else {
    console.error('Container reference is null');
  }
};
</script>

<style scoped>
.shop-embed {
  color: #0c4b47;
  position: relative;
  padding: 1rem;
  margin: 2rem auto; 
  margin-top: 2rem;
  background: #f9f9f9;
  font-family: 'Helvetica', sans-serif;
  border-radius: 8px;
  z-index: 2000;
  display: flex;
  align-items: center;
  max-width: 900px; 
  border: none;
}
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ffffff;
  color:#0c4b47;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Helvetica', sans-serif;
  font-size: 1rem;
  z-index: 2000;
  animation: fade-in-out 3s ease-in-out;
}
@keyframes fade-in-out {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
}
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ffffff;
  color:#0c4b47;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Helvetica', sans-serif;
  font-size: 1rem;
  z-index: 1000;
  animation: fade-in-out 3s ease-in-out;
}
@media (max-width: 800px) {
  .products-section {
    grid-template-columns: 1fr !important;
  }
  .product-card {
    min-width: 0;
    width: 100%;
  }
  .categories-container {
    flex-direction: column;
    align-items: stretch;
  }
}
.add-to-cart-button {
  background-color: #0c4b47;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  width: 70%;
}
.add-to-cart-button:hover {
background: linear-gradient(135deg, #097a6a 0%, #0a3a36 100%);
}
.items-container {
  position: relative;
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  padding: 0.5rem;
  width: 100%;
  max-width: 900px;
}

.item-card {
  min-width: calc(33.33% - 1rem); 
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  flex-shrink: 0;
  text-align: center;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}

.item-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.item-title {
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}

.item-price {
  color: #0c4b47;
  margin-top: 0.25rem;
  font-weight: bold;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  user-select: none;
  border-radius: 10%;
  z-index: 10;
}

.scroll-btn.left {
  left: -30px;
}

.scroll-btn.right {
  right: -30px;
}
</style>