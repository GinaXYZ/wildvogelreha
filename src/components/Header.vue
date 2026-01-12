<template>
  <div :class="['top-section', { compact: isCompact }]">
    <header :class="['header', { compact: isCompact }]" :style="headerStyle">
      <div class="logo-and-title">
        <img :src="Logo" alt="Logo" class="logo" />
        <router-link class="title" to="/">Wildvogel Rehastation Waabs e.V.</router-link>
      </div>
      <nav class="nav">
        <router-link class="nav-link" to="/">Home</router-link>
        <router-link class="nav-link" to="/about">Über uns</router-link>
        <router-link class="nav-link" to="/voegel">Karte</router-link>
        <router-link class="nav-link" to="/shop">Shop</router-link>
        <router-link class="nav-link" to="/blog">Blog</router-link>
        <router-link class="nav-link" to="/spenden">Spenden</router-link>
        <router-link class="nav-link" to="/contact">Kontakt</router-link>
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
let scrollTimeout = null;


function handleAuthClick() {
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
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.8rem 1rem;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  transition: all 0.2s ease-in-out;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}
.main-content, .home-main-row {
  margin-top: 64px; 
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem; 
}
.logo-and-title {
  display: flex;
  align-items: center; 
  gap: 0.5rem;
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
  font-size: 1.4rem;
  text-decoration: none;
  transition: all 0.3s ease;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
  flex-grow: 1;
  gap: 1rem;
  margin: 0;
}
.nav::-webkit-scrollbar {
  height: 6px; 
}
.nav-link {
  color: #0c4b47;
  text-decoration: none;
  cursor: pointer;
  font-family: 'Helvetica', sans-serif;
  font-size: 1.4rem;
  transition: font-size 0.2s ease;
}
.nav-link:hover {
  color: #ffffff;
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
</style>;