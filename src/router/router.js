import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import AboutUs from '../components/AboutUs.vue'; 
import AppLayout from '../components/AppLayout.vue';
import Shop from '../components/Shop.vue';
import Cart from '../components/Cart.vue'; 
import Voegel from '../components/Voegel.vue';
import Blog from '../components/Blog.vue';
import Spenden from '../components/Spenden.vue';
import Login from '../components/Login.vue';
import Profile from '../components/Profile.vue';
import Register from '../components/Register.vue';
import Checkout from '../components/Checkout.vue';
import Contact from '../components/Contact.vue';

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '/', name: 'Home', component: Home },
      { path: '/about', name: 'AboutUs', component: AboutUs },
      { path: '/shop', name: 'Shop', component: Shop },
      { path: '/cart', name: 'Cart', component: Cart }, 
      { path: '/blog', name: 'Blog', component: Blog },
      { path: '/voegel', name: 'Vögel', component: Voegel },
      { path: '/spenden', name: 'Spenden', component: Spenden },
      { path: '/login', name: 'Login', component: Login },
      { path: '/profile', name: 'Profile', component: Profile },
      {path: '/register', name: 'Register', component: Register },
      { path: '/checkout', name: 'Checkout', component: Checkout },
      { path: '/contact' , name: 'Contact', component: Contact },
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

export default router;