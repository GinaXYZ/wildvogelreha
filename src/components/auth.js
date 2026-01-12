import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isLoggedIn = computed(() => !!user.value && !!token.value);

  const initAuth = () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser);
      token.value = savedToken;
    }
  };

  const login = async (username, password) => {
    if (!username || !password) {
      throw new Error('Benutzername und Passwort sind erforderlich');
    }
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login fehlgeschlagen');
    }

    user.value = {
      id: data.id, 
      username: data.username,
      role: data.role,
    };
    token.value = data.token;

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user.value));
    
    import('./cartState.js').then(module => {
      module.mergeCarts();
    });
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return { user, token, isLoggedIn, initAuth, login, logout };
});