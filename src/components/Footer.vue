<template>
  <footer class="footer">
    <div class="footer-container">
      <p class="copyright">&copy; {{ currentYear }} Wildvogel Rehastation Waabs e.V. Alle Rechte vorbehalten.</p>
      <div class="footer-links">
        <router-link to="/contact" class="footer-link">Kontakt</router-link>
        <span class="separator">|</span>
        <router-link to="/about" class="footer-link">Über uns</router-link>
        <span class="separator">|</span>
        <router-link to="/spenden" class="footer-link">Spenden</router-link>
      </div>
      <p class="social-text">
        Folge uns auf 
        <a href="https://facebook.com/wildvogelreha" class="social-link" target="_blank" rel="noopener noreferrer">Facebook</a> und
        <a href="https://instagram.com/wildvogelreha" class="social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background: #0c4b47;
  color: white;
  padding: 2rem 1rem;
  margin-top: 3rem;
  font-family: 'Helvetica', sans-serif;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.copyright {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.footer-links {
  margin-bottom: 1rem;
}

.footer-link {
  color: white;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #a0d2db;
}

.separator {
  margin: 0 0.8rem;
  opacity: 0.6;
}

.social-text {
  font-size: 0.9rem;
  opacity: 0.9;
}

.social-link {
  color: #a0d2db;
  text-decoration: none;
  transition: color 0.2s ease;
}

.social-link:hover {
  color: white;
  text-decoration: underline;
}

/* ===== Responsive Footer ===== */
@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 1rem;
  }
  
  .copyright {
    font-size: 0.85rem;
  }
  
  .footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .separator {
    display: none;
  }
  
  .footer-link {
    padding: 0.3rem 0.8rem;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 1rem;
  }
  
  .copyright {
    font-size: 0.8rem;
  }
  
  .social-text {
    font-size: 0.85rem;
  }
}
</style>