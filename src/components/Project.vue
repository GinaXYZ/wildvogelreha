<template>
  <div class="project-wrapper">
    <!-- Einzelansicht des Projekts: nur `Appointments`, kein Header/Footer -->
    <Appointments />
  </div>
</template>

<script setup>
// Importiere die `Appointments`-Komponente (Einzelansicht des Projekts)
import Appointments from './Appointments.vue';
</script>

<style scoped>
  .project-wrapper {
  /* Belegt das gesamte Viewport ohne Seiten-Chrome */
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 3rem; /* give pagination space from browser bottom */
  background: var(--bg-color, #fff);
  overflow: visible; /* allow children to render outside wrapper */
}

/* Reset einiger globaler Layout-Abstände, um das verschobene Erscheinungsbild zu vermeiden */
:root {
  --app-padding-top: 0px;
}
  
/* Stellt sicher, dass `Appointments` volle Breite nutzt und kein zusätzliches Top-Padding hat */
.project-wrapper .appointments-container {
  width: 100% !important;
  max-width: 1000px !important; /* center content for most views */
  padding: 0 1rem !important; /* small side padding */
  padding-top: 0 !important;
  padding-bottom: 2.5rem !important; /* ensure inner bottom spacing so pagination doesn't sit flush */
  margin: 0 auto !important;
  box-sizing: border-box;
  align-items: stretch; /* allow content to use full inner width */
  position: relative;
  z-index: 1100;
 }

/* Leichte Skalierung innerhalb des Wrappers, um die Termin-UI etwas zu verkleinern (~8%) */
.project-wrapper { font-size: 0.92em; }

.project-wrapper .appointments-header {
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
}


/* Zusätzliche Style-Anpassungen können hier bei Bedarf ergänzt werden */
</style>
