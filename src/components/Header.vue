<template>
  <div :class="['top-section', { compact: isCompact }]">
    <header :class="['header', { compact: isCompact }]" :style="headerStyle">
      <div class="logo-and-title">
        <img :src="Logo" alt="Logo" class="logo" />
        <router-link class="title" to="/">Wildvogel Rehastation Waabs e.V.</router-link>
      </div>
      
      <!-- Hamburger Menu Button (Mobile) -->
      <button class="hamburger" @click="toggleMobileMenu" :class="{ active: mobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <nav class="nav" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link class="nav-link" to="/" @click="closeMobileMenu">Home</router-link>
        <router-link class="nav-link" to="/about" @click="closeMobileMenu">Über uns</router-link>
        <router-link class="nav-link" to="/voegel" @click="closeMobileMenu">Karte</router-link>
        <router-link class="nav-link" to="/shop" @click="closeMobileMenu">Shop</router-link>
        <router-link class="nav-link" to="/blog" @click="closeMobileMenu">Blog</router-link>
        <router-link class="nav-link" to="/spenden" @click="closeMobileMenu">Spenden</router-link>
        <router-link class="nav-link" to="/contact" @click="closeMobileMenu">Kontakt</router-link>
      </nav>
      <div class="user-actions">
        <div class="cart-icon-container">
          <router-link class="nav-link cart-icon" to="/cart">
            🛒
            <span class="cart-count" v-if="cart.length > 0">{{ cart.length }}</span>
          </router-link>
        </div>
                <router-link class="nav-link profile-icon" to="/profile">
          👤
        </router-link>
         <button class="login-button" @click="handleAuthClick">
         {{ authStore.isLoggedIn ? 'Logout' : 'Login' }}
        </button>
      </div>
    </header>
    
    <!-- Mobile Menu Overlay -->
    <div class="mobile-overlay" v-if="mobileMenuOpen" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup>
import Logo from '../assets/Logo_Website-removebg-preview.png'
import HeaderBg from '../assets/pexels-markusspiske-113338.jpg'
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { cart } from './cartState.js';
import { useAuthStore } from './auth.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isCompact = ref(false);
const mobileMenuOpen = ref(false);
let scrollTimeout = null;

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  // Prevent body scroll when menu is open
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

function handleAuthClick() {
  closeMobileMenu();
  if (authStore.isLoggedIn) {
    authStore.logout();
    router.push('/login');
  } else {
    router.push('/login');
  }
}
const handleScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout); 
  }
  scrollTimeout = setTimeout(() => {
    isCompact.value = window.scrollY > 50; 
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});

const headerStyle = computed(() => ({
  backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0)), url(${HeaderBg})`
}));
</script>

<style scoped>
.top-section {
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.3s ease;
}
.login-container {
  position: relative;
}
.login-button:active {
  background-color: #bfcfcf;
  color: #0c4b47;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.15) inset;
  transform: translateY(2px) scale(0.98);
}
.login-button:hover {
  background-color: #e0e0e0c6;
}
.header {
  font-family: 'Helvetica', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  transition: padding 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}
.main-content, .home-main-row {
  margin-top: 80px; 
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  margin-right: 1rem;
}
.logo-and-title {
  display: flex;
  align-items: center; 
  gap: 0.5rem;
  flex-shrink: 0;
}
.header.compact .nav-link {
  font-size: 1rem;
}
.logo {
  height: 35px;
  width: auto;
  transition: all 0.3s ease;
}
.title {
  color: #0c4b47;
  font-size: 1.3rem;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  flex: 1 1 auto;
  gap: 1.5rem;
  margin: 0 2rem;
}
.nav-link {
  color: #0c4b47;
  text-decoration: none;
  cursor: pointer;
  font-family: 'Helvetica', sans-serif;
  font-size: 1.2rem;
  transition: color 0.2s ease;
  white-space: nowrap;
}
.nav-link:hover {
  color: #2196f3;
}
.profile-icon {
  font-size: 1.5rem;
  color: #0c4b47;
  cursor: pointer;
  transition: color 0.2s ease;
}
.profile-icon:hover {
transform: scale(1.1);
}
.cart-icon-container {
  position: relative;
}
.cart-icon {
  display: flex;
  align-items: center;
  position: relative;
}
.cart-icon:hover {
transform: scale(1.1);
}
.cart-count {
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: red;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
}
.header.compact {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  gap: 1rem;
}
.header .login-button {
  display: inline-block;
  margin-left: auto;
}
.logo.compact {
  height: 25px;
}
.title.compact {
  font-size: 1.5rem;
}
.nav-link.compact {
  font-size: 1rem;
}
.login-button {
  background-color: #e3e3e3; 
  color: #0c4b47;
  padding: 0.5rem 1rem;
  margin-right: 3rem;
  border: 1px solid #a1a1a1; 
  font-style: bold;
  font-weight: bold;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Helvetica', sans-serif;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2), -1px -1px 3px rgba(255, 255, 255, 0.8); 
  transition: all 0.2s ease;
}
.header.compact .login-button {
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
}
.header.compact .logo {
  height: 25px; 
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .title {
    font-size: 1.1rem;
  }
  .nav-link {
    font-size: 1.1rem;
  }
  .nav {
    gap: 1rem;
  }
}

/* ===== Hamburger Menu Styles ===== */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  flex-shrink: 0;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #0c4b47;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-overlay {
  display: none;
}

/* ===== Tablet Responsive (1024px) ===== */
@media (max-width: 1024px) {
  .header {
    padding: 1rem 1.5rem;
  }
  .nav {
    gap: 0.8rem;
  }
  .nav-link {
    font-size: 1rem;
  }
  .title {
    font-size: 1rem;
  }
  .login-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }
}

/* ===== Mobile Responsive (900px) - Show Hamburger Menu ===== */
@media (max-width: 900px) {
  .header {
    padding: 0.8rem 1rem;
    min-height: 60px;
  }
  
  .hamburger {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    backdrop-filter: blur(3px);
  }
  
  .nav {
    position: fixed;
    top: 0;
    right: -280px;
    width: 260px;
    height: 100vh;
    background: white;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 5rem 1.5rem 2rem;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    transition: right 0.3s ease;
    z-index: 999;
    gap: 0;
    margin: 0;
    overflow-y: auto;
  }
  
  .nav.mobile-open {
    right: 0;
  }
  
  .nav-link {
    width: 100%;
    padding: 1rem 0;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
  }
  
  .nav-link:last-child {
    border-bottom: none;
  }
  
  .logo-and-title {
    flex: 0 0 auto;
  }
  
  .user-actions {
    margin-left: auto;
    margin-right: 0.8rem;
    gap: 0.8rem;
  }
  
  .login-button {
    display: none;
  }
  
  .title {
    font-size: 0.9rem;
  }
  
  .logo {
    height: 28px;
  }
  
  .cart-icon,
  .profile-icon {
    font-size: 1.4rem;
  }
}

/* ===== Small Mobile (600px) ===== */
@media (max-width: 600px) {
  .header {
    padding: 0.7rem 0.8rem;
    min-height: 55px;
  }
  
  .title {
    font-size: 0.85rem;
  }
  
  .logo {
    height: 26px;
  }
  
  .user-actions {
    gap: 0.6rem;
    margin-right: 0.6rem;
  }
  
  .cart-icon,
  .profile-icon {
    font-size: 1.3rem;
  }
  
  .hamburger {
    width: 28px;
    height: 20px;
  }
  
  .nav {
    width: 240px;
    right: -250px;
    padding: 4.5rem 1.2rem 2rem;
  }
  
  .nav-link {
    font-size: 1.1rem;
    padding: 0.9rem 0;
  }
}

/* ===== Very Small Mobile (400px) ===== */
@media (max-width: 400px) {
  .header {
    padding: 0.6rem;
    min-height: 50px;
  }
  
  .title {
    font-size: 0.75rem;
  }
  
  .logo {
    height: 22px;
  }
  
  .user-actions {
    gap: 0.4rem;
    margin-right: 0.4rem;
  }
  
  .cart-icon,
  .profile-icon {
    font-size: 1.2rem;
  }
  
  .hamburger {
    width: 26px;
    height: 18px;
  }
  
  .nav {
    width: 220px;
    right: -230px;
  }
  
  .nav-link {
    font-size: 1rem;
  }
}
</style>