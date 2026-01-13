<template>
  <div :class="['app-layout', $route?.name || 'default-route']">
    <header class="header"></header>
    <div class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
      <ShopEmbed />
    </div>
  </div>
</template>

  
  <script setup>
  import ShopEmbed from './ShopEmbed.vue';

  </script>
  
  <style scoped>

  .app-layout {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  
  .nav ul {
    display: flex;
    justify-content: center;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav ul li {
    font-size: 1rem;
  }
  
  .nav ul li a {
    color: white;
    text-decoration: none;
    font-weight: bold;
  }
  
  .nav ul li a:hover {
    text-decoration: underline;
  }
  

  .main-content {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
  }
  
  .content-wrapper {
    position: relative;
    justify-content: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
  }

.center-content {
  margin: 0 auto;
  width: 600px; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
  
  .floating-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #0c4b47;
    color: white;
    padding: 0.5rem 1rem;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .floating-menu nav ul {
    display: flex;
    justify-content: center;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .floating-menu nav ul li {
    font-size: 1rem;
  }
  
  .floating-menu nav ul li a {
    color: white;
    text-decoration: none;
    font-weight: bold;
  }
  
  .floating-menu nav ul li a:hover {
    text-decoration: underline;
  }
  </style>
