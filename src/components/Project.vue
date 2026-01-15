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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 4rem; /* give pagination space from browser bottom */
  background: var(--bg-color, #fff);
}

/* Reset some global layout spacing to avoid the shifted look */
:root {
  --app-padding-top: 0px;
}
  
/* Ensure Appointments uses full width and no extra top padding */
.project-wrapper .appointments-container {
  width: 100% !important;
  max-width: 1000px !important; /* match typical staff content width */
  padding-top: 0 !important;
  padding-bottom: 2.5rem !important; /* ensure inner bottom spacing so pagination doesn't sit flush */
  margin: 0 auto !important;
  box-sizing: border-box;
  align-items: stretch; /* allow content to use full inner width */
}

.project-wrapper .appointments-header {
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
}

</style>
