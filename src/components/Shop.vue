<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { addToCart } from './cartState.js';
import { useAuthStore } from './auth.js';

const selectedCategory = ref('Alle');
const toastMessage = ref('');
const addProductMessage = ref('');
const showToast = ref(false);
const authStore = useAuthStore();
const searchQuery = ref('');
const newProduct = ref({
  title: '',
  price: '',
  description: '',
  category: '',
  amountLeft: '',
  image: ''
});

const products = ref([]);
const productsPage = ref(1);
const productsLimit = ref(20);
const totalProducts = ref(0);
const errorMessage = ref('');
const isLoading = ref(true);
const categories = ref(['Alle']);
const editingProduct = ref(null);
const showEditForm = ref(false);
const fetchProducts = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    let apiUrl = `/api/products?page=${productsPage.value}&limit=${productsLimit.value}`;
    if (selectedCategory.value !== 'Alle') {
      apiUrl += `&category=${encodeURIComponent(selectedCategory.value)}`;
    }
    if (searchQuery.value) {
      apiUrl += `&search=${encodeURIComponent(searchQuery.value)}`;
    }
    const res = await fetch(apiUrl);
    if (!res.ok) {
      let errorText = `HTTP-Status ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorText = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        try {
            errorText = await res.text();
        } catch (e_text) { /* fallback */ }
      }
      throw new Error(`Serverantwort nicht OK. ${errorText}`);
    }

    const data = await res.json();

    if (data && Array.isArray(data.results) && typeof data.count === 'number') {
      products.value = data.results;
      totalProducts.value = data.count;
    } else {
      console.error('Unerwartetes Datenformat von der API:', data);
      throw new Error('Datenformat vom Server fehlerhaft.');
    }

  } catch (error) {
    console.error('Fehlerdetails beim Laden der Produkte:', error);
    errorMessage.value = `Fehler beim Laden der Produkte: ${error.message}`;
    products.value = [];
    totalProducts.value = 0;
  } finally {
    isLoading.value = false;
  }
};

watch(productsPage, () => {
    fetchProducts();
    window.scrollTo(0, 0);
});

watch([selectedCategory, searchQuery], () => {
  productsPage.value = 1;
  fetchProducts();
});
const toggleEditForm = (product) => {
  if (showEditForm.value && editingProduct.value?.id === product.id) {
    showEditForm.value = false;
    editingProduct.value = null;
  } else {
    editingProduct.value = { ...product };
    showEditForm.value = true;
  }
};
const updateProduct = async () => {
  try {
    const res = await fetch(`/api/products/${editingProduct.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(editingProduct.value)
    });
    if (!res.ok) throw new Error('Update fehlgeschlagen');
    
    showEditForm.value = false;
    await fetchProducts();
  } catch (error) {
    alert(`Fehler: ${error.message}`);
  }
};
onMounted(async () => {
  await fetchProducts();
  try {
    const resCategories = await fetch('/api/category');
    if (!resCategories.ok) {
      let errorText = `HTTP-Status ${resCategories.status}: ${resCategories.statusText}`;
        try {
            const errorBody = await resCategories.json();
            errorText = errorBody.message || JSON.stringify(errorBody);
        } catch (e) {
            try {
                errorText = await resCategories.text();
            } catch (e_text) { /* fallback */ }
        }
      throw new Error(errorText);
    }
    const dbCategories = await resCategories.json();
    categories.value = ['Alle', ...dbCategories];
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
    const categoryErrorMsg = `Fehler beim Laden der Kategorien: ${error.message}`;
    errorMessage.value = errorMessage.value ? `${errorMessage.value}\n${categoryErrorMsg}` : categoryErrorMsg;
  }
});

const addProduct = async () => {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(newProduct.value)
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || await res.text());
    }
    addProductMessage.value = 'Produkt erfolgreich hinzugefügt!';
    newProduct.value = { title: '', price: '', description: '', category: '', amountLeft: '', image: '' };
    await fetchProducts();
  } catch (error) {
    addProductMessage.value = `Fehler: ${error.message}`;
    console.error(error);
  }
};
const EditProduct = (product) => {
  if (authStore.user && authStore.user.role === 'admin') {
    editingProduct.value = { ...product };
    showEditForm.value = true;
  } else {
    alert('Nur Admins können Produkte bearbeiten!');
  }
};

const handleAddToCart = (product) => {
  addToCart(product);
  toastMessage.value = `${product.title} wurde zum Warenkorb hinzugefügt!`;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};
</script>

<template>
  <div class="shop-container">
    <div class="shop-header">
      <h1>🦜Wildvogel-Reha Shop🦆</h1>
      <p>Unterstützen Sie unsere Arbeit mit dem Kauf unserer Produkte</p>
    </div>
    
    <div class="shop-controls">
      <div class="search-container">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 Produkte durchsuchen..."
            class="search-input"
          />
        </div>
      </div>
      <div class="categories-container">
        <h3>Kategorien</h3>
        <div class="category-pills">
          <button
            v-for="category in categories" 
            :key="category"
            class="category-pill"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Lade Produkte...</p>
    </div>

    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else class="products-section">
      <div class="products-header">
        <h2>
          {{ selectedCategory === 'Alle' ? 'Alle Produkte' : selectedCategory }}
          <span class="product-count">({{ totalProducts }})</span>
        </h2>
      </div>

      <div v-if="products.length === 0" class="no-products">
        <div class="no-products-icon">📦</div>
        <h3>Keine Produkte gefunden</h3>
        <p>Versuchen Sie eine andere Kategorie oder Suchbegriff</p>
      </div>

      <div v-else class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image-container">
            <img :src="product.image" :alt="product.title" class="product-image" />
            <div class="product-badge" v-if="product.amountLeft < 5">
              Nur noch {{ product.amountLeft }} verfügbar
            </div>
          </div>
          
          <div class="product-content">
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            
            <div class="product-footer">
              <div class="product-price">
                {{ (Number(product.price) || 0).toFixed(2) }} €
              </div>
              <div class="footer-buttons">
                <button 
                  v-if="!authStore.user || (authStore.user && authStore.user.role === 'customer')"
                  @click="handleAddToCart(product)" 
                  class="add-to-cart-btn"
                  :disabled="product.amountLeft === 0"
                >
                  <span v-if="product.amountLeft === 0">Ausverkauft</span>
                  <span v-else>In den Warenkorb</span>
                </button>
                  <div class="edit-container" v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'staff')">
                    <button
                      @click="toggleEditForm(product)"
                      class="edit-btn"
                      title="Produkt bearbeiten"
                    >
                      ✏️
                    </button>
                  <div 
                    v-if="showEditForm && editingProduct?.id === product.id" 
                    class="edit-form"
                    @click.stop
                  >
                    <h4>Produkt bearbeiten</h4>
                    <form @submit.prevent="updateProduct">
                      <input v-model="editingProduct.title" placeholder="Titel" required />
                      <input v-model="editingProduct.price" type="number" step="0.01" placeholder="Preis" required />
                      <textarea v-model="editingProduct.description" placeholder="Beschreibung" required rows="3"></textarea>
                      <select v-model="editingProduct.category" required>
                        <option disabled value="">Kategorie wählen</option>
                        <option v-for="category in categories.filter(c => c !== 'Alle')" :key="category" :value="category">
                          {{ category }}
                        </option>
                      </select>
                      <input v-model="editingProduct.amountLeft" type="number" placeholder="Verfügbare Menge" required />
                      <input v-model="editingProduct.image" placeholder="Bild-URL" required />
                      <div class="form-buttons">
                        <button type="submit">💾 Speichern</button>
                        <button type="button" @click="showEditForm = false">❌ Abbrechen</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <button @click="productsPage--" :disabled="productsPage === 1" class="pagination-btn">Zurück</button>
        <span>Seite {{ productsPage }}</span>
        <button @click="productsPage++" :disabled="productsPage * productsLimit >= totalProducts" class="pagination-btn">Weiter</button>
      </div>
    </div>

    <div v-if="authStore.user && authStore.user.role === 'admin'" class="admin-section">
      <div class="admin-form">
        <h3>🔧 Neues Produkt hinzufügen</h3>
        <form @submit.prevent="addProduct" class="product-form">
          <div class="form-row">
            <input v-model="newProduct.title" placeholder="Produkttitel" required class="form-input" />
            <input v-model="newProduct.price" type="number" step="0.01" placeholder="Preis (€)" required class="form-input" />
          </div>
          <textarea v-model="newProduct.description" placeholder="Produktbeschreibung" required class="form-textarea"></textarea>
          <div class="form-row">
            <select v-model="newProduct.category" required class="form-select">
              <option disabled value="">Kategorie auswählen</option>
              <option v-for="category in categories.filter(c => c !== 'Alle')" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <input v-model="newProduct.amountLeft" type="number" placeholder="Verfügbare Menge" required class="form-input" />
          </div>
          <input v-model="newProduct.image" placeholder="Bild-URL" required class="form-input" />
          <button type="submit" class="submit-btn">✨ Produkt hinzufügen</button>
        </form>
        <p v-if="addProductMessage" class="form-message" :class="{ success: addProductMessage.includes('erfolgreich') }">
          {{ addProductMessage }}
        </p>
      </div>
    </div>
    <transition name="toast">
      <div v-if="showToast" class="toast">
        <div class="toast-content">
          <span class="toast-icon">✅</span>
          <span>{{ toastMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
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
.shop-container {
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  min-height: 100vh;
  padding-bottom: 2rem;
  background-attachment: fixed;
  width: 100%;
  box-sizing: border-box;
}

.edit-btn {
  background: transparent;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  width: auto;
  height: auto;
  position: static;
  top: unset;
  left: unset;
  align-self: center;
  margin: 0;
  font-size: 1rem;
  vertical-align: middle;
}
.shop-header {
  text-align: center;
  padding: 6rem 2rem 2rem 2rem;
  margin-bottom: 2rem;
}

.shop-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #0c4b47;
  font-weight: bold;
}

.shop-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}
.shop-controls {
  max-width: 1200px;
  margin: 0 auto 3rem auto;
  padding: 0 2rem;
}

.search-container {
  margin-bottom: 2rem;
}

.search-box {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #0c4b47;
  box-shadow: 0 0 0 3px rgba(12, 75, 71, 0.1);
}

.categories-container {
  text-align: center;
}

.categories-container h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.category-pills {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.category-pill {
  background: white;
  border: none;
  color: #0c4b47;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.category-pill:hover {
  border-color: #0c4b47;
  transform: translateY(-2px);
}

.category-pill.active {
  background: #0c4b47;
  color: white;
  border-color: #0c4b47;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e9ecef;
  border-left: 4px solid #0c4b47;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #dc3545;
  font-size: 1.2rem;
}

.products-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  min-height: 70vh;
}
.products-header {
  margin-bottom: 2rem;
  text-align: center;
}

.products-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.product-count {
  color: #666;
  font-weight: normal;
  font-size: 1.2rem;
}

.no-products {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.no-products-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-products h3 {
  margin-bottom: 0.5rem;
  color: #0c4b47;
}

.no-products p {
  color: #666;
}


.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 320px));
  gap: 1.5rem;
  margin-bottom: 4rem;
  justify-content: center;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.product-image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-content {
  padding: .5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.product-title {
  font-size: 1.3rem;
  margin-bottom: 0.1rem;
  color: #0c4b47;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.product-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  font-size: 0.9rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.product-price {
  font-size: 1rem;
  color: #0c4b47;
  font-weight: bold;
  margin-right: 10px;
  margin-bottom: 10px;
  font-family: 'Helvetica', sans-serif;
  white-space: nowrap;

}

.add-to-cart-btn {
  background: linear-gradient(135deg, #0c4b47 0%, #0a3a36 100%);
  color: white;
  border: none;
  border-radius: 8px;
  margin-right: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  min-width: 160px;
  white-space: nowrap;
  text-align: center;
  display: block;
  margin-bottom: 10px;
  align-items: center;
  justify-content: center;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #097a6a 0%, #0a3a36 100%);
}


.admin-section {
  max-width: 1200px;
  margin: 4rem auto 2rem auto;
  padding: 0 2rem;
}

.admin-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  width: 100%;
  box-sizing: border-box;
}

.admin-form h3 {
  margin-bottom: 1.5rem;
  color: #0c4b47;
  font-size: 1.5rem;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0c4b47;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.submit-btn {
  background: linear-gradient(135deg, #0c4b47 0%, #0a3a36 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(12, 75, 71, 0.3);
}

.form-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: bold;
}

.form-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  z-index: 1000;
  max-width: 350px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #0c4b47;
  font-weight: 500;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}


@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 0 0.5rem;
  }
  
  .shop-header {
    padding: 5rem 1rem 1.5rem 1rem;
  }
  
  .shop-header h1 {
    font-size: 1.6rem;
  }
  
  .shop-header p {
    font-size: 1rem;
  }
  
  .shop-controls {
    padding: 0 1rem;
  }
  
  .products-section {
    padding: 0 1rem;
  }
  
  .admin-section {
    padding: 0 1rem;
    margin: 2rem auto;
  }
  
  .admin-form {
    padding: 1.5rem;
  }
  
  .admin-form h3 {
    font-size: 1.3rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    font-size: 1rem;
    padding: 0.8rem;
  }
  
  .submit-btn {
    width: 100%;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .shop-header {
    padding: 4.5rem 0.5rem 1rem 0.5rem;
  }
  
  .shop-header h1 {
    font-size: 1.4rem;
  }
  
  .category-pills {
    gap: 0.5rem;
  }
  
  .category-pill {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  .product-image {
    height: 200px;
  }
  
  .product-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .add-to-cart-btn {
    width: 100%;
    min-width: unset;
  }
  
  .toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: unset;
  }
}
.pagination {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 50px;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}
.pagination-btn {
  background: white;
  color: #0c4b47;
  border: none;
  width: 40px;
  height: 40px; 
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
}
.pagination-btn:hover:not(.disabled) {
  scale: 1.2;
  transition: transform 0.3s ease;
}
.pagination-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
.edit-btn:hover {
transform: scale(1.38);
transition: transform 0.3s ease;
}
.edit-form {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  width: 300px;
  z-index: 1000;
  margin-top: 10px;
}
.edit-form {
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  width: 300px;
  z-index: 1000;
  margin-top: 10px;
}
.edit-form::before {
  content: '';
  position: absolute;
  top: -10px;
  right: 20px;
  border: 10px solid transparent;
  border-bottom-color: white;
}

/* Form-Styles kompakt */
.edit-form input,
.edit-form textarea,
.edit-form select {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.edit-form .form-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-form button {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-form button[type="submit"] {
  background: #0c4b47;
  color: white;
}

.edit-form button[type="button"] {
  background: #ccc;
  color: #333;
}
.edit-container {
  position: relative;
}
.footer-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
