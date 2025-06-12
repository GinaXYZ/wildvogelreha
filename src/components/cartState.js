import { ref } from 'vue';
import { useAuthStore } from './auth.js';

export const cart = ref([]);

export const addToCart = (product) => {
  const existingProduct = cart.value.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
  saveCartToDB();
};

export const removeFromCart = (product) => {
  const existingProduct = cart.value.find((item) => item.id === product.id);
  if (!existingProduct) return;
  if (existingProduct.quantity > 1) {
    existingProduct.quantity--;
  } else {
    cart.value = cart.value.filter((item) => item.id !== product.id);
  }
  saveCartToDB();
};

export const getCartCount = () => {
  return cart.value.reduce((total, item) => total + item.quantity, 0);
};

export const cleanCart = () => {
  cart.value = cart.value.filter(item => item && item.id && item.quantity > 0);
};
const saveCartToDB = async () => {

  cart.value = cart.value.filter(item => item && item.id && item.quantity > 0);
  
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token');
if (!token) return;


  const uniqueCart = [];
  const seen = new Map();
  
  for (const item of cart.value) {
    if (seen.has(item.id)) {

      seen.get(item.id).quantity += item.quantity;
    } else {
      const cleanItem = {
        id: item.id,
        quantity: item.quantity
      };
      seen.set(item.id, cleanItem);
      uniqueCart.push(cleanItem);
    }
  }
  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cart: uniqueCart }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      console.error('Server-Fehler:', data.error);
      throw new Error(data.error || 'Fehler beim Aktualisieren des Warenkorbs');
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Warenkorbs:', error);
  }
};

export const loadCartFromDB = async () => {
  cart.value = cart.value.filter(item => item && item.id);
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token');
  if (!authStore.isLoggedIn) {
    const localCart = localStorage.getItem('cart');
    cart.value = localCart ? JSON.parse(localCart) : [];
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      headers: {
          'Authorization': `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error('Unerwartete Serverantwort:', data);
      return;
    }
    
    cart.value = data.map(item => ({
      id: item.idproducts,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: item.quantity
    }));
  } catch (error) {
    console.error('Fehler beim Laden des Warenkorbs:', error);
  }
};

export const mergeCarts = async () => {
  const authStore = useAuthStore();
  if (!authStore.isLoggedIn) return;

  const localCart = localStorage.getItem('cart');
  const localItems = localCart ? JSON.parse(localCart) : [];

  await loadCartFromDB();
  const dbItems = [...cart.value];

  localItems.forEach((localItem) => {
    const existingItem = dbItems.find((item) => item.id === localItem.id);
    if (existingItem) {
      existingItem.quantity += localItem.quantity;
    } else {
      dbItems.push(localItem);
    }
  });

  cart.value = dbItems.filter(item => item && item.id && item.quantity > 0);
  
  localStorage.removeItem('cart');
  
  await saveCartToDB();
};
 