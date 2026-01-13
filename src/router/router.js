import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import AboutUs from '../components/AboutUs.vue'; 
import AppLayout from '../components/AppLayout.vue';
import Shop from '../components/Shop.vue';
import Cart from '../components/cart.vue'; 
import Voegel from '../components/Voegel.vue';
import Blog from '../components/Blog.vue';
import Spenden from '../components/Spenden.vue';
import Login from '../components/Login.vue';
import Profile from '../components/Profile.vue';
import Register from '../components/Register.vue';
import Checkout from '../components/Checkout.vue';
import Contact from '../components/Contact.vue';
import Appointments from '../components/Appointments.vue';

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '/', name: 'Home', component: Home },
      { path: '/home', redirect: '/' },
      { path: '/about', name: 'AboutUs', component: AboutUs },
      { path: '/shop', name: 'Shop', component: Shop },
      { path: '/cart', name: 'Cart', component: Cart }, 
      { path: '/blog', name: 'Blog', component: Blog },
      { path: '/voegel', name: 'Vögel', component: Voegel },
      { path: '/spenden', name: 'Spenden', component: Spenden },
      { path: '/login', name: 'Login', component: Login },
      { path: '/profile', name: 'Profile', component: Profile },
      { path: '/register', name: 'Register', component: Register },
      { path: '/checkout', name: 'Checkout', component: Checkout },
      { path: '/contact', name: 'Contact', component: Contact },
      { path: '/termine', name: 'Appointments', component: Appointments, meta: { requiresAuth: true, requiresStaff: true } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  }
});

// Navigation Guard für Auth-Check
router.beforeEach(async (to, from, next) => {
  const authStore = await import('../components/auth.js').then(m => m.useAuthStore());
  
  // Token Expiry Check
  if (authStore.token) {
    try {
      const payload = JSON.parse(atob(authStore.token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      
      // Wenn Token in weniger als 30 Minuten abläuft, versuche zu refreshen
      if (expiresAt - now < 30 * 60 * 1000 && expiresAt > now) {
        try {
          const response = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            authStore.token = data.token;
            localStorage.setItem('token', data.token);
          }
        } catch (e) {
          console.warn('Token refresh failed:', e);
        }
      }
      
      // Wenn Token abgelaufen ist, logout
      if (expiresAt <= now) {
        authStore.logout();
        if (to.meta.requiresAuth) {
          return next({ name: 'Login', query: { redirect: to.fullPath, expired: 'true' } });
        }
      }
    } catch (e) {
      console.error('Token parsing error:', e);
    }
  }
  
  // Route erfordert Auth
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }
  
  // Route erfordert Staff/Admin
  if (to.meta.requiresStaff && authStore.user) {
    if (!['admin', 'staff'].includes(authStore.user.role)) {
      return next({ name: 'Home' });
    }
  }
  
  next();
});

export default router;
