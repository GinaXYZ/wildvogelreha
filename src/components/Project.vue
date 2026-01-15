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

</style>
