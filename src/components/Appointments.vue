<template>
  <div class="appointments-container">
    <!-- Header mit Statistiken -->
    <div class="appointments-header">
      <div class="stats-cards">
        <div class="stat-card">
          <span class="stat-number">{{ stats.today }}</span>
          <span class="stat-label">Heute</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.pending }}</span>
          <span class="stat-label">Geplant</span>
        </div>
        <div class="stat-card urgent">
          <span class="stat-number">{{ stats.urgent }}</span>
          <span class="stat-label">Dringend</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="btn-add">+ Neuer Termin</button>
        <button @click="exportCSV" class="btn-export">📥 CSV Export</button>
      </div>
    </div>

    <!-- Filter & Ansichtswechsel -->
    <div class="filter-bar">
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">Woche</button>
        <button :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">Monat</button>
        <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">Liste</button>
      </div>
      <div class="filters">
        <select v-model="filterCategory">
          <option value="">Alle Kategorien</option>
          <option value="behandlung">Behandlung</option>
          <option value="fuetterung">Fütterung</option>
          <option value="medikation">Medikation</option>
          <option value="reinigung">Reinigung</option>
          <option value="auswilderung">Auswilderung</option>
          <option value="kontrolle">Kontrolle</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
        <select v-model="filterStatus">
          <option value="">Alle Status</option>
          <option value="geplant">Geplant</option>
          <option value="in_bearbeitung">In Bearbeitung</option>
          <option value="erledigt">Erledigt</option>
          <option value="abgesagt">Abgesagt</option>
        </select>
        <select v-model="filterStaff">
          <option value="">Alle Mitarbeiter</option>
          <option v-for="staff in staffUsers" :key="staff.id" :value="staff.id">
            {{ staff.firstname }} {{ staff.lastname }}
          </option>
        </select>
      </div>
      <div class="date-nav">
        <button @click="navigateDate(-1)">◀</button>
        <span class="current-date">{{ currentDateLabel }}</span>
        <button @click="navigateDate(1)">▶</button>
        <button @click="goToToday" class="btn-today">Heute</button>
      </div>
    </div>

    <!-- Kalender Wochenansicht -->
    <div v-if="viewMode === 'week'" class="week-view">
      <div class="week-header">
        <div class="time-col"></div>
        <div v-for="day in weekDays" :key="day.date" class="day-col" :class="{ today: isToday(day.date) }">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-date">{{ formatDayDate(day.date) }}</span>
        </div>
      </div>
      <div class="week-body">
        <div v-for="hour in hours" :key="hour" class="time-row">
          <div class="time-col">{{ hour }}:00</div>
          <div v-for="day in weekDays" :key="day.date" class="day-cell" 
               :class="{ today: isToday(day.date) }"
               @click="openAddModalForSlot(day.date, hour)">
            <div v-for="apt in getAppointmentsForSlot(day.date, hour)" :key="apt.id"
                 class="appointment-block"
                 :class="[`priority-${apt.priority}`, `status-${apt.status}`]"
                 @click.stop="openEditModal(apt)">
              <span class="apt-time">{{ formatTime(apt.appointment_time) }}</span>
              <span class="apt-title">{{ apt.title }}</span>
              <span v-if="apt.patient_name" class="apt-patient">🐦 {{ apt.patient_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kalender Monatsansicht -->
    <div v-if="viewMode === 'month'" class="month-view">
      <div class="month-header">
        <div v-for="dayName in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" :key="dayName" class="month-day-name">
          {{ dayName }}
        </div>
      </div>
      <div class="month-grid">
        <div v-for="(day, index) in monthDays" :key="index" 
             class="month-cell"
             :class="{ 
               'other-month': !day.currentMonth, 
               today: isToday(day.date),
               'has-appointments': getAppointmentsForDay(day.date).length > 0
             }"
             @click="selectDayForDetails(day.date)">
          <span class="cell-date">{{ day.day }}</span>
          <div class="cell-appointments">
            <div v-for="apt in getAppointmentsForDay(day.date).slice(0, 3)" :key="apt.id"
                 class="mini-appointment"
                 :class="`priority-${apt.priority}`"
                 @click.stop="openEditModal(apt)">
              {{ formatTime(apt.appointment_time) }} {{ apt.title.substring(0, 15) }}...
            </div>
            <div v-if="getAppointmentsForDay(day.date).length > 3" class="more-appointments">
              +{{ getAppointmentsForDay(day.date).length - 3 }} weitere
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Listenansicht -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div v-if="loading" class="loading">Lade Termine...</div>
      <div v-else-if="filteredAppointments.length === 0" class="no-appointments">
        Keine Termine gefunden.
      </div>
      <table v-else class="appointments-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Zeit</th>
            <th>Titel</th>
            <th>Kategorie</th>
            <th>Priorität</th>
            <th>Patient</th>
            <th>Zugewiesen</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apt in filteredAppointments" :key="apt.id" :class="`priority-row-${apt.priority}`">
            <td>{{ formatDate(apt.appointment_date) }}</td>
            <td>{{ formatTime(apt.appointment_time) }} - {{ apt.end_time ? formatTime(apt.end_time) : '' }}</td>
            <td>
              <strong>{{ apt.title }}</strong>
              <span v-if="apt.recurring" class="recurring-badge">🔄</span>
            </td>
            <td><span class="category-badge" :class="`cat-${apt.category}`">{{ getCategoryLabel(apt.category) }}</span></td>
            <td><span class="priority-badge" :class="`prio-${apt.priority}`">{{ getPriorityLabel(apt.priority) }}</span></td>
            <td>{{ apt.patient_name || '-' }}</td>
            <td>{{ apt.assigned_firstname ? `${apt.assigned_firstname} ${apt.assigned_lastname}` : '-' }}</td>
            <td>
              <select v-model="apt.status" @change="updateStatus(apt)" class="status-select">
                <option value="geplant">Geplant</option>
                <option value="in_bearbeitung">In Bearbeitung</option>
                <option value="erledigt">Erledigt</option>
                <option value="abgesagt">Abgesagt</option>
              </select>
            </td>
            <td class="actions">
              <button @click="openEditModal(apt)" class="btn-edit" title="Bearbeiten">✏️</button>
              <button @click="deleteAppointment(apt.id)" class="btn-delete" title="Löschen">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Termin hinzufügen/bearbeiten -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <h3>{{ showEditModal ? 'Termin bearbeiten' : 'Neuer Termin' }}</h3>
        <form @submit.prevent="showEditModal ? updateAppointment() : createAppointment()">
          <div class="form-row">
            <label>Titel *</label>
            <input v-model="formData.title" type="text" required placeholder="Terminbezeichnung">
          </div>
          <div class="form-row">
            <label>Beschreibung</label>
            <textarea v-model="formData.description" placeholder="Details zum Termin"></textarea>
          </div>
          <div class="form-row-group">
            <div class="form-row">
              <label>Datum *</label>
              <input v-model="formData.appointment_date" type="date" required>
            </div>
            <div class="form-row">
              <label>Startzeit *</label>
              <input v-model="formData.appointment_time" type="time" required>
            </div>
            <div class="form-row">
              <label>Endzeit</label>
              <input v-model="formData.end_time" type="time">
            </div>
          </div>
          <div class="form-row-group">
            <div class="form-row">
              <label>Kategorie</label>
              <select v-model="formData.category">
                <option value="behandlung">Behandlung</option>
                <option value="fuetterung">Fütterung</option>
                <option value="medikation">Medikation</option>
                <option value="reinigung">Reinigung</option>
                <option value="auswilderung">Auswilderung</option>
                <option value="kontrolle">Kontrolle</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
            <div class="form-row">
              <label>Priorität</label>
              <select v-model="formData.priority">
                <option value="niedrig">Niedrig</option>
                <option value="mittel">Mittel</option>
                <option value="hoch">Hoch</option>
                <option value="dringend">Dringend</option>
              </select>
            </div>
          </div>
          <div class="form-row-group">
            <div class="form-row">
              <label>Patient (Vogel)</label>
              <select v-model="formData.patient_id">
                <option value="">Kein Patient</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.name }} ({{ patient.species }})
                </option>
              </select>
            </div>
            <div class="form-row">
              <label>Zugewiesen an</label>
              <select v-model="formData.assigned_to">
                <option value="">Nicht zugewiesen</option>
                <option v-for="staff in staffUsers" :key="staff.id" :value="staff.id">
                  {{ staff.firstname }} {{ staff.lastname }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row recurring-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.recurring">
              Wiederkehrender Termin
            </label>
            <select v-if="formData.recurring" v-model="formData.recurring_interval">
              <option value="taeglich">Täglich</option>
              <option value="woechentlich">Wöchentlich</option>
              <option value="monatlich">Monatlich</option>
            </select>
          </div>
          <div class="form-row">
            <label>Notizen</label>
            <textarea v-model="formData.notes" placeholder="Zusätzliche Notizen"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-cancel">Abbrechen</button>
            <button type="submit" class="btn-save">{{ showEditModal ? 'Speichern' : 'Erstellen' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from './auth.js';

const authStore = useAuthStore();
const API_BASE = '/api';

// State
const appointments = ref([]);
const patients = ref([]);
const staffUsers = ref([]);
const loading = ref(false);
const stats = ref({ today: 0, pending: 0, urgent: 0 });

// View & Filter
const viewMode = ref('week');
const currentDate = ref(new Date());
const filterCategory = ref('');
const filterStatus = ref('');
const filterStaff = ref('');

// Modal State
const showAddModal = ref(false);
const showEditModal = ref(false);
const formData = ref(getEmptyFormData());

function getEmptyFormData() {
  return {
    id: null,
    title: '',
    description: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    end_time: '',
    category: 'sonstiges',
    priority: 'mittel',
    status: 'geplant',
    patient_id: '',
    assigned_to: '',
    recurring: false,
    recurring_interval: 'woechentlich',
    notes: ''
  };
}

// Computed
const hours = computed(() => Array.from({ length: 14 }, (_, i) => i + 6)); // 6:00 - 19:00

const weekDays = computed(() => {
  const days = [];
  const startOfWeek = getStartOfWeek(currentDate.value);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      name: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]
    });
  }
  return days;
});

const monthDays = computed(() => {
  const days = [];
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Tage vom Vormonat
  let startDay = firstDay.getDay() || 7;
  for (let i = startDay - 1; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), currentMonth: false });
  }
  
  // Tage des aktuellen Monats
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d.toISOString().split('T')[0], day: i, currentMonth: true });
  }
  
  // Tage vom nächsten Monat
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d.toISOString().split('T')[0], day: i, currentMonth: false });
  }
  
  return days;
});

const currentDateLabel = computed(() => {
  if (viewMode.value === 'week') {
    const start = weekDays.value[0];
    const end = weekDays.value[6];
    return `${formatDate(start.date)} - ${formatDate(end.date)}`;
  } else {
    return currentDate.value.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }
});

const filteredAppointments = computed(() => {
  return appointments.value.filter(apt => {
    if (filterCategory.value && apt.category !== filterCategory.value) return false;
    if (filterStatus.value && apt.status !== filterStatus.value) return false;
    if (filterStaff.value && apt.assigned_to !== filterStaff.value) return false;
    return true;
  });
});

// Helper Functions
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('de-DE');
}

function formatDayDate(dateStr) {
  return new Date(dateStr).getDate();
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

function getAppointmentsForSlot(date, hour) {
  return filteredAppointments.value.filter(apt => {
    if (apt.appointment_date !== date) return false;
    const aptHour = parseInt(apt.appointment_time.split(':')[0]);
    return aptHour === hour;
  });
}

function getAppointmentsForDay(date) {
  return filteredAppointments.value.filter(apt => apt.appointment_date === date);
}

function getCategoryLabel(cat) {
  const labels = {
    behandlung: 'Behandlung',
    fuetterung: 'Fütterung',
    medikation: 'Medikation',
    reinigung: 'Reinigung',
    auswilderung: 'Auswilderung',
    kontrolle: 'Kontrolle',
    sonstiges: 'Sonstiges'
  };
  return labels[cat] || cat;
}

function getPriorityLabel(prio) {
  const labels = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch', dringend: 'Dringend' };
  return labels[prio] || prio;
}

// Navigation
function navigateDate(direction) {
  const d = new Date(currentDate.value);
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() + direction * 7);
  } else {
    d.setMonth(d.getMonth() + direction);
  }
  currentDate.value = d;
  fetchAppointments();
}

function goToToday() {
  currentDate.value = new Date();
  fetchAppointments();
}

function selectDayForDetails(date) {
  currentDate.value = new Date(date);
  viewMode.value = 'week';
}

// Modal Functions
function openAddModalForSlot(date, hour) {
  formData.value = getEmptyFormData();
  formData.value.appointment_date = date;
  formData.value.appointment_time = `${hour.toString().padStart(2, '0')}:00`;
  showAddModal.value = true;
}

function openEditModal(apt) {
  formData.value = {
    id: apt.id,
    title: apt.title,
    description: apt.description || '',
    appointment_date: apt.appointment_date,
    appointment_time: apt.appointment_time,
    end_time: apt.end_time || '',
    category: apt.category,
    priority: apt.priority,
    status: apt.status,
    patient_id: apt.patient_id || '',
    assigned_to: apt.assigned_to || '',
    recurring: apt.recurring,
    recurring_interval: apt.recurring_interval || 'woechentlich',
    notes: apt.notes || ''
  };
  showEditModal.value = true;
}

function closeModals() {
  showAddModal.value = false;
  showEditModal.value = false;
  formData.value = getEmptyFormData();
}

// API Calls
async function fetchAppointments() {
  loading.value = true;
  try {
    const token = authStore.token || localStorage.getItem('token');
    let url = `${API_BASE}/appointments`;
    
    if (viewMode.value === 'week') {
      url += `?week=${weekDays.value[0].date}`;
    } else if (viewMode.value === 'month') {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth() + 1;
      url += `?month=${month}&year=${year}`;
    }
    
    // Debug log the request URL and token presence
    console.debug('[Appointments] fetching', url, 'token?', !!token);
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.debug('[Appointments] response status', res.status);
    if (res.ok) {
      const data = await res.json();
      console.debug('[Appointments] fetched', data.length || 0, 'appointments');
      appointments.value = data;
    } else {
      const text = await res.text();
      console.error('[Appointments] fetch failed:', res.status, text);
      // clear appointments so UI shows empty state explicitly
      appointments.value = [];
    }
  } catch (err) {
    console.error('Fehler beim Laden der Termine:', err);
    appointments.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchStats() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/appointments/stats/overview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      stats.value = await res.json();
    }
  } catch (err) {
    console.error('Fehler beim Laden der Statistiken:', err);
  }
}

async function fetchPatients() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/patients?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      patients.value = data.results || data;
    }
  } catch (err) {
    console.error('Fehler beim Laden der Patienten:', err);
  }
}

async function fetchStaffUsers() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/staff-users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      staffUsers.value = await res.json();
    }
  } catch (err) {
    console.error('Fehler beim Laden der Mitarbeiter:', err);
  }
}

async function createAppointment() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData.value)
    });
    if (res.ok) {
      closeModals();
      fetchAppointments();
      fetchStats();
    }
  } catch (err) {
    console.error('Fehler beim Erstellen:', err);
  }
}

async function updateAppointment() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/appointments/${formData.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData.value)
    });
    if (res.ok) {
      closeModals();
      fetchAppointments();
      fetchStats();
    }
  } catch (err) {
    console.error('Fehler beim Aktualisieren:', err);
  }
}

async function updateStatus(apt) {
  try {
    const token = authStore.token || localStorage.getItem('token');
    await fetch(`${API_BASE}/appointments/${apt.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apt)
    });
    fetchStats();
  } catch (err) {
    console.error('Fehler beim Status-Update:', err);
  }
}

async function deleteAppointment(id) {
  if (!confirm('Termin wirklich löschen?')) return;
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchAppointments();
      fetchStats();
    }
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
  }
}

function exportCSV() {
  const token = authStore.token || localStorage.getItem('token');
  const startDate = weekDays.value[0].date;
  const endDate = weekDays.value[6].date;
  window.open(`${API_BASE}/appointments/export/csv?start_date=${startDate}&end_date=${endDate}&token=${token}`, '_blank');
}

// Watchers
watch(viewMode, () => fetchAppointments());

// Init
onMounted(() => {
  fetchAppointments();
  fetchStats();
  fetchPatients();
  fetchStaffUsers();
});
</script>

<style scoped>
.appointments-container {
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
}

/* Header & Stats */
.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.stats-cards {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  min-width: 80px;
}

.stat-card.urgent {
  background: #ffebee;
  border-left: 4px solid #e53935;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #0c4b47;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-add {
  background: #0c4b47;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn-add:hover {
  background: #0a3a36;
}

.btn-export {
  background: #f5f5f5;
  color: #0c4b47;
  border: 1px solid #ddd;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.3rem;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.view-toggle button.active {
  background: #0c4b47;
  color: white;
  border-color: #0c4b47;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 140px;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-nav button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.current-date {
  font-weight: bold;
  min-width: 180px;
  text-align: center;
}

.btn-today {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

/* Week View */
.week-view {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.week-header {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  background: #0c4b47;
  color: white;
}

.week-header .time-col {
  padding: 0.8rem;
}

.week-header .day-col {
  padding: 0.8rem;
  text-align: center;
  border-left: 1px solid rgba(255,255,255,0.2);
}

.week-header .day-col.today {
  background: rgba(255,255,255,0.2);
}

.day-name {
  display: block;
  font-weight: bold;
}

.day-date {
  font-size: 1.2rem;
}

.week-body {
  max-height: 600px;
  overflow-y: auto;
}

.time-row {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  min-height: 60px;
  border-bottom: 1px solid #eee;
}

.time-col {
  padding: 0.5rem;
  font-size: 0.8rem;
  color: #666;
  background: #f9f9f9;
  text-align: center;
}

.day-cell {
  border-left: 1px solid #eee;
  padding: 0.3rem;
  cursor: pointer;
  min-height: 60px;
}

.day-cell:hover {
  background: #f5f5f5;
}

.day-cell.today {
  background: #e3f2fd;
}

.appointment-block {
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
  padding: 0.3rem 0.5rem;
  margin-bottom: 0.2rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  overflow: hidden;
}

.appointment-block:hover {
  transform: scale(1.02);
}

.appointment-block.priority-hoch {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.appointment-block.priority-dringend {
  background: #ffebee;
  border-left-color: #e53935;
}

.appointment-block.status-erledigt {
  opacity: 0.6;
  text-decoration: line-through;
}

.apt-time {
  font-weight: bold;
  display: block;
}

.apt-title {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.apt-patient {
  display: block;
  font-size: 0.7rem;
  color: #666;
}

/* Month View */
.month-view {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #0c4b47;
  color: white;
}

.month-day-name {
  padding: 0.8rem;
  text-align: center;
  font-weight: bold;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.month-cell {
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid #eee;
  cursor: pointer;
}

.month-cell:hover {
  background: #f5f5f5;
}

.month-cell.other-month {
  background: #fafafa;
  color: #bbb;
}

.month-cell.today {
  background: #e3f2fd;
}

.cell-date {
  font-weight: bold;
  display: block;
  margin-bottom: 0.3rem;
}

.mini-appointment {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  margin-bottom: 0.2rem;
  border-radius: 3px;
  background: #e8f5e9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-appointment.priority-hoch {
  background: #fff3e0;
}

.mini-appointment.priority-dringend {
  background: #ffebee;
}

.more-appointments {
  font-size: 0.7rem;
  color: #666;
}

/* List View */
.appointments-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.appointments-table th {
  background: #0c4b47;
  color: white;
  padding: 1rem 0.5rem;
  text-align: left;
}

.appointments-table td {
  padding: 0.8rem 0.5rem;
  border-bottom: 1px solid #eee;
}

.appointments-table tr:hover {
  background: #f5f5f5;
}

.priority-row-dringend {
  background: #ffebee !important;
}

.priority-row-hoch {
  background: #fff8e1 !important;
}

.category-badge, .priority-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.cat-behandlung { background: #e3f2fd; color: #1976d2; }
.cat-fuetterung { background: #e8f5e9; color: #388e3c; }
.cat-medikation { background: #fce4ec; color: #c2185b; }
.cat-reinigung { background: #f3e5f5; color: #7b1fa2; }
.cat-auswilderung { background: #e0f7fa; color: #00838f; }
.cat-kontrolle { background: #fff3e0; color: #e65100; }
.cat-sonstiges { background: #eceff1; color: #546e7a; }

.prio-niedrig { background: #e8f5e9; color: #2e7d32; }
.prio-mittel { background: #e3f2fd; color: #1976d2; }
.prio-hoch { background: #fff3e0; color: #e65100; }
.prio-dringend { background: #ffebee; color: #c62828; }

.status-select {
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
}

.recurring-badge {
  margin-left: 0.3rem;
}

.actions {
  white-space: nowrap;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.3rem;
}

.btn-delete:hover {
  color: #e53935;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  color: #0c4b47;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: bold;
  color: #333;
}

.form-row input, .form-row select, .form-row textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-row textarea {
  min-height: 80px;
  resize: vertical;
}

.form-row-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.recurring-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.7rem 1.5rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  padding: 0.7rem 1.5rem;
  background: #0c4b47;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-save:hover {
  background: #0a3a36;
}

.loading, .no-appointments {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .btn-add, .btn-export {
    flex: 1 1 auto;
  }
}

@media (max-width: 768px) {
  .appointments-container {
    padding: 0.5rem;
  }
  
  .appointments-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }
  
  .header-actions button {
    flex: 1;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }
  
  .view-toggle {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .view-toggle button {
    flex: 1;
    padding: 0.5rem;
  }
  
  .filters {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .filters select {
    flex: 1 1 45%;
    min-width: 120px;
  }
  
  .date-nav {
    justify-content: center;
    gap: 0.5rem;
  }
  
  .week-header, .time-row {
    grid-template-columns: 40px repeat(7, 1fr);
  }
  
  .appointments-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    font-size: 0.85rem;
  }
  
  .appointments-table th,
  .appointments-table td {
    padding: 0.5rem 0.3rem;
    white-space: nowrap;
  }
  
  .stats-cards {
    width: 100%;
    justify-content: space-around;
  }
  
  .stat-card {
    padding: 0.8rem;
    min-width: 80px;
  }
  
  /* Modal responsive */
  .modal {
    width: 95%;
    max-width: 95%;
    padding: 1rem;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form-row-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-row-group .form-row {
    width: 100%;
  }
  
  /* Month view responsive */
  .month-cell {
    min-height: 60px;
    padding: 0.3rem;
  }
  
  .mini-appointment {
    font-size: 0.6rem;
    padding: 0.1rem 0.2rem;
  }
  
  .cell-date {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 0.5rem;
    min-width: 60px;
  }
  
  .stat-number {
    font-size: 1.2rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .view-toggle button {
    font-size: 0.8rem;
    padding: 0.4rem;
  }
  
  .filters select {
    flex: 1 1 100%;
    font-size: 0.9rem;
  }
  
  .week-view {
    font-size: 0.75rem;
  }
  
  .time-col {
    font-size: 0.65rem;
    width: 35px !important;
  }
  
  .day-col, .day-cell {
    font-size: 0.7rem;
  }
  
  .appointment-block {
    font-size: 0.6rem;
    padding: 0.2rem;
  }
  
  .month-day-name {
    padding: 0.4rem;
    font-size: 0.75rem;
  }
  
  .month-cell {
    min-height: 50px;
    padding: 0.2rem;
  }
  
  .cell-date {
    font-size: 0.75rem;
  }
  
  .appointments-table th,
  .appointments-table td {
    font-size: 0.75rem;
    padding: 0.3rem 0.2rem;
  }
  
  .btn-edit, .btn-delete {
    padding: 0.2rem;
    font-size: 0.8rem;
  }
}
</style>
