<template>
  <div class="project-wrapper">
    <!-- Standalone project view: only Appointments, no header/footer -->
    <Appointments />
  </div>
</template>

<script setup>
import Appointments from './Appointments.vue';
</script>

<style scoped>
.project-wrapper {
  /* occupy full viewport without site chrome */
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background: var(--bg-color, #fff);
}

/* Reset some global layout spacing to avoid the shifted look */
:root {
  --app-padding-top: 0px;
}
  
/* Ensure Appointments uses full width and no extra top padding */
.project-wrapper .appointments-container {
  width: 100% !important;
  max-width: 100% !important;
  padding-top: 16px !important;
  margin: 0 auto !important;
  box-sizing: border-box;
}

.project-wrapper .appointments-header {
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
}

</style>
