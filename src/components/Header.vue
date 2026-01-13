<template>
  <div class="header-wrapper">
    <header :class="['header', { compact: isCompact }]" :style="headerStyle">
      <div class="header-inner">
        <div class="logo-and-title">
          <img :src="Logo" alt="Logo" class="logo" />
          <router-link class="title" to="/">Wildvogel Rehastation Waabs e.V.</router-link>
        </div>
        
        <!-- Hamburger Menu Button (Mobile) -->
        <button class="hamburger" @click="toggleMobileMenu" :class="{ active: mobileMenuOpen }" aria-label="Menü">
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
          <!-- Mobile: Login in Nav -->
          <button class="login-button mobile-login" @click="handleAuthClick">
            {{ authStore.isLoggedIn ? 'Logout' : 'Login' }}
          </button>
        </nav>
        
        <div class="user-actions">
          <router-link class="nav-link cart-icon" to="/cart">
            🛒
            <span class="cart-count" v-if="cart.length > 0">{{ cart.length }}</span>
          </router-link>
          <router-link class="nav-link profile-icon" to="/profile">
            👤
          </router-link>
          <button class="login-button desktop-login" @click="handleAuthClick">
            {{ authStore.isLoggedIn ? 'Logout' : 'Login' }}
          </button>
        </div>
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
/* ===== HEADER WRAPPER - Controls spacing for page content ===== */
.header-wrapper {
  position: relative;
  width: 100%;
}

/* ===== HEADER - Fixed position, not affected by content ===== */
.header {
  font-family: 'Helvetica', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 1000;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.header.compact .header-inner {
  padding: 0.5rem 1.5rem;
}

/* ===== LOGO AND TITLE ===== */
.logo-and-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.logo {
  height: 40px;
  width: auto;
  transition: all 0.3s ease;
}

.header.compact .logo {
  height: 30px;
}

.title {
  color: #0c4b47;
  font-size: 1.25rem; /* slightly smaller default for better mobile fit */
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: bold;
}

.header.compact .title {
  font-size: 1.0rem; /* compact header -> smaller title */
}

/* ===== NAVIGATION - Centered ===== */
.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex: 1;
  margin: 0 2rem;
}

.nav-link {
  color: #0c4b47;
  text-decoration: none;
  cursor: pointer;
  font-family: 'Helvetica', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;
  padding: 0.3rem 0.5rem;
}

.nav-link:hover {
  color: #2196f3;
}

.header.compact .nav-link {
  font-size: 1rem;
}

/* ===== USER ACTIONS ===== */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.cart-icon,
.profile-icon {
  font-size: 1.5rem;
  color: #0c4b47;
  cursor: pointer;
  transition: transform 0.2s ease;
  text-decoration: none;
  position: relative;
}

.cart-icon:hover,
.profile-icon:hover {
  transform: scale(1.1);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: red;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 0.15rem 0.4rem;
  min-width: 18px;
  text-align: center;
}

/* ===== LOGIN BUTTON ===== */
.login-button {
  background-color: #e3e3e3;
  color: #0c4b47;
  padding: 0.5rem 1rem;
  border: 1px solid #a1a1a1;
  font-weight: bold;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Helvetica', sans-serif;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2), -1px -1px 3px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.login-button:hover {
  background-color: #d0d0d0;
}

.login-button:active {
  background-color: #bfcfcf;
  transform: translateY(1px);
}

.header.compact .login-button {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.mobile-login {
  display: none;
}

.desktop-login {
  display: inline-block;
}

/* ===== HAMBURGER MENU ===== */
.hamburger {
  display: none;
  flex-direction: column;    /* stack bars vertically */
  align-items: center;
  justify-content: center;
  gap: 4px;                  /* spacing between bars */
  width: 40px;               /* visible container width */
  height: 40px;              /* touch target area */
  padding: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  z-index: 1200;             /* above overlay */
  flex-shrink: 0;
  overflow: visible;         /* allow transforms to be seen */
}

/* drei klare, feste Balken */
.hamburger span {
  display: block;
  width: 20px;               /* slightly smaller so not clipped */
  height: 2px;               /* thin bars */
  margin: 0;                 /* use gap on container */
  background-color: #0c4b47 !important;
  border-radius: 2px;
  transform-origin: center;
  transition: transform 0.22s ease, opacity 0.18s ease;
  will-change: transform, opacity;
}

/* Active -> X */
.hamburger.active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.hamburger.active span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger.active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* ensure the button does not get clipped by parent */
.header-inner, .header {
  overflow: visible;
}

/* ===== MOBILE OVERLAY ===== */
.mobile-overlay {
  display: none;
}

/* ===== TABLET (1024px) ===== */
@media (max-width: 1024px) {
  .header-inner {
    padding: 0.8rem 1.5rem;
  }
  
  .nav {
    gap: 1rem;
    margin: 0 1rem;
  }
  
  .nav-link {
    font-size: 1rem;
  }
  
  .title {
    font-size: 1.1rem;
  }
  
  .logo {
    height: 35px;
  }
}

/* ===== MOBILE - Hamburger Menu (900px) ===== */
@media (max-width: 900px) {
  .header-inner {
    padding: 0.8rem 1rem;
  }
  
  .hamburger {
    display: flex;
    order: 3;
    /* keep compact visual size but good touch target */
    width: 36px;
    height: 22px;
    padding: 6px;
    min-width: 36px;
    min-height: 22px;
    align-items: center;
    justify-content: center;
  }

  /* hide the left logo on mobile so the hamburger is clearly visible */
  .logo {
    display: none;
  }

  /* ensure compact title stays smaller on mobile when header is compact */
  .header.compact .title {
    font-size: 0.9rem;
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
  
  .nav .nav-link {
    width: 100%;
    padding: 1rem 0;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
  }
  
  .nav .nav-link:last-of-type {
    border-bottom: none;
  }
  
  .mobile-login {
    display: block;
    width: 100%;
    margin-top: 1.5rem;
    padding: 1rem;
    font-size: 1.1rem;
    text-align: center;
  }
  
  .desktop-login {
    display: none;
  }
  
  .user-actions {
    margin-left: auto;
    margin-right: 1rem;
    gap: 0.8rem;
  }
  
  .title {
    font-size: 0.95rem;
  }
  
  .logo {
    height: 32px;
  }
  
  .cart-icon,
  .profile-icon {
    font-size: 1.4rem;
  }
}

/* ===== SMALL MOBILE (600px) ===== */
@media (max-width: 600px) {
  .header-inner {
    padding: 0.7rem 0.8rem;
  }
  
  .title {
    font-size: 0.95rem;
  }

  .header.compact .title {
    font-size: 0.85rem;
  }

  /* hide logo on smaller screens as well */
  .logo {
    display: none;
  }

  .hamburger {
    width: 34px;
    height: 20px;
    padding: 6px;
  }

  .nav {
    width: 240px;
    right: -250px;
    padding: 4.5rem 1.2rem 2rem;
  }
  
  .nav .nav-link {
    font-size: 1.1rem;
    padding: 0.9rem 0;
  }
}

/* ===== VERY SMALL MOBILE (400px) ===== */
@media (max-width: 400px) {
  .header-inner {
    padding: 0.6rem 0.5rem;
  }
  
  .title {
    font-size: 0.85rem;
  }

  .header.compact .title {
    font-size: 0.75rem;
  }

  /* hide logo on very small screens too */
  .logo {
    display: none;
  }

  .hamburger {
    width: 32px;
    height: 18px;
    padding: 6px;
  }

  .nav {
    width: 200px;
    right: -210px;
  }
  
  .nav .nav-link {
    font-size: 1rem;
  }
}
</style>