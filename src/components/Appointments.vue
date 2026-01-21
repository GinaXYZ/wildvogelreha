<template>
  <div class="appointments-container">
    <div v-if="isDev" class="dev-banner">
      DEV: {{ appointments.length }} Termine geladen. 
      <button @click="seedMockData" class="dev-btn">Seed / Reset</button>
    </div>
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
        <div class="stat-card total">
          <span class="stat-number">{{ appointments.length }}</span>
          <span class="stat-label">Alle Termine</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="btn-add">+ Neuer Termin</button>
        <div class="right-actions">
          <div class="export-controls">
            <button @click="exportCSV" class="btn-export">📥 Export CSV</button>
          </div>
          <div class="import-controls">
            <input ref="csvInput" type="file" accept=".csv" style="display:none" @change="onFileChange" />
            <button @click="openFilePicker" class="btn-import">📤 Import CSV</button>
            <span v-if="csvFileName" class="import-filename">{{ csvFileName }}</span>
          </div>
        </div>
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
        <select v-model="filterCategory" class="status-select">
          <option value="">Alle Kategorien</option>
          <option v-for="opt in allCategories" :key="opt" :value="opt">{{ getCategoryLabel(opt) }}</option>
        </select>

        <select v-model="filterStatus" class="status-select">
          <option value="">Alle Status</option>
          <option v-for="opt in allStatuses" :key="opt" :value="opt">{{ opt.replace('_',' ') }}</option>
        </select>

        <select v-model="filterStaff" class="status-select">
          <option value="">Alle Mitarbeiter</option>
          <option v-for="staff in staffUsers" :key="staff.id" :value="String(staff.id)">{{ staff.firstname }} {{ staff.lastname }}</option>
        </select>
      </div>
      <div class="date-nav">
        <button @click="navigateDate(-1)">◀</button>
        <span class="current-date">{{ currentDateLabel }}</span>
        <button @click="navigateDate(1)">▶</button>
        <button @click="goToToday" class="btn-today">Heute</button>
      </div>
    </div>

    <!-- Legend removed -->

    <!-- Kalender Wochenansicht -->
    <div v-if="viewMode === 'week'" class="week-view">
      <table class="week-table">
        <thead>
          <tr class="week-header">
            <th class="time-col-header">Zeit</th>
            <th v-for="day in weekDays" :key="day.date" class="day-col" :class="{ today: isToday(day.date) }">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-date">{{ formatDayDate(day.date) }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="week-body">
          <tr v-for="hour in hours" :key="hour" class="time-row">
            <td class="time-col">{{ String(hour).padStart(2, '0') }}:00</td>
            <td v-for="day in weekDays" :key="day.date" class="day-cell" 
                 :class="{ today: isToday(day.date) }"
                 @click="openAddModalForSlot(day.date, hour)">
                 <div v-for="apt in getAppointmentsForSlot(day.date, hour).slice(0, maxVisibleSlot)" :key="apt.id"
                   class="appointment-block"
                   :class="[`priority-${apt.priority}`, `status-${apt.status}`]"
                   :title="apt.title + (apt.room ? ' — ' + apt.room : '')"
                   @click.stop="showAppointmentBubble($event, apt)">
                {{ formatTime(apt.appointment_time) }}<span v-if="apt.room"> | {{ apt.room }}</span>
              </div>
              <div v-if="getAppointmentsForSlot(day.date, hour).length > maxVisibleSlot" class="more-count" @click.stop="openSlotList(day.date, hour)">
                +{{ getAppointmentsForSlot(day.date, hour).length - maxVisibleSlot }} weitere
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend removed -->

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
                 :title="apt.title + (apt.room ? ' — ' + apt.room : '')"
                 @click.stop="openEditModal(apt)">
              {{ formatTime(apt.appointment_time) }}<span v-if="apt.room"> | {{ apt.room.substring(0, 12) }}</span>
            </div>
            <div v-if="getAppointmentsForDay(day.date).length > 3" class="more-appointments">
              +{{ getAppointmentsForDay(day.date).length - 3 }} weitere
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend removed -->

    <!-- Listenansicht -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div class="list-inner">
      <div v-if="loading" class="loading">Lade Termine...</div>
      <div v-else-if="filteredAppointments.length === 0" class="no-appointments">
        Keine Termine gefunden.
      </div>
      <table v-else class="appointments-table">
        <thead>
          <tr>
            <th class="sortable" @click="toggleSort('appointment_date')">
              <span class="sort-wrap">Datum <span class="sort-ind">{{ sortIndicator('appointment_date') }}</span></span>
            </th>
            <th class="sortable" @click="toggleSort('appointment_time')">
              <span class="sort-wrap">Zeit <span class="sort-ind">{{ sortIndicator('appointment_time') }}</span></span>
            </th>
            <th class="sortable" @click="toggleSort('title')">
              <span class="sort-wrap">Titel <span class="sort-ind">{{ sortIndicator('title') }}</span></span>
            </th>
            <th>Kategorie</th>
            <th>Priorität</th>
            <th>Project / Team</th>
            <th>Zugewiesen</th>
            <th>Status</th>
            <th class="actions-col">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apt in paginatedAppointments" :key="apt.id" :class="`priority-row-${apt.priority}`" @click="openEditModal(apt)">
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
              <select v-model="apt.status" @change="updateStatus(apt)" class="status-select" @click.stop>
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
      <div class="list-pagination" v-if="totalPages >= 1">
        <button class="page-btn prev" @click="page = Math.max(1, page - 1)" :disabled="page === 1">◀ Zurück</button>
        <span class="page-indicator">Seite {{ page }} / {{ totalPages }}</span>
        <button class="page-btn next" @click="page = Math.min(totalPages, page + 1)" :disabled="page >= totalPages">Weiter ▶</button>
      </div>
      </div>
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
                <option value="sprint-planung">Sprint Planning</option>
                <option value="team-meeting">Team Meeting</option>
                <option value="code-review">Code Review</option>
                <option value="deployment">Deployment</option>
                <option value="testing">Testing</option>
                <option value="dokumentation">Documentation</option>
                <option value="planning">Planning</option>
                <option value="sonstiges">Other</option>
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

    <!-- Appointment speech-bubble (week view) -->
    <div v-if="appointmentBubble.visible" class="speech-bubble-overlay" @click.self="closeAppointmentBubble">
      <div class="speech-bubble" ref="bubbleRef" :class="{ 'arrow-bottom': appointmentBubble.placement === 'above', 'arrow-top': appointmentBubble.placement === 'below' }" :style="{ top: appointmentBubble.y + 'px', left: appointmentBubble.x + 'px' }">
        <button class="bubble-close" @click="closeAppointmentBubble">✖</button>
        <div class="bubble-content">
          <div class="bubble-fields">
            <div><strong>Datum:</strong> {{ bubbleApt ? formatDate(bubbleApt.appointment_date) : '-' }}</div>
            <div><strong>Zeit:</strong> {{ bubbleApt ? (formatTime(bubbleApt.appointment_time) + (bubbleApt.end_time ? ' - ' + formatTime(bubbleApt.end_time) : '')) : '-' }}</div>
            <div><strong>Titel:</strong> {{ bubbleApt ? bubbleApt.title : '-' }}</div>
            <div><strong>Kategorie:</strong> {{ bubbleApt ? getCategoryLabel(bubbleApt.category) : '-' }}</div>
            <div><strong>Priorität:</strong> {{ bubbleApt ? getPriorityLabel(bubbleApt.priority) : '-' }}</div>
            <!-- Patient removed per UX request -->
            <div><strong>Zugewiesen:</strong> {{ bubbleApt ? (bubbleApt.assigned_firstname ? bubbleApt.assigned_firstname + ' ' + (bubbleApt.assigned_lastname||'') : '-') : '-' }}</div>
            <div><strong>Status:</strong> {{ bubbleApt ? bubbleApt.status : '-' }}</div>
          </div>
          <!-- Inline description box removed (not used) -->
          <div class="bubble-actions">
            <button @click="openEditFromBubble">Bearbeiten</button>
            <button @click="() => deleteAppointmentFromBubble(appointmentBubble.id)">Löschen</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Slot modal for overflowing events in a time slot -->
    <div v-if="slotModal.visible" class="modal-overlay" @click.self="closeSlotModal">
      <div class="modal">
        <h3>Termine: {{ slotModal.date }} {{ String(slotModal.hour).padStart(2,'0') }}:00</h3>
        <ul style="list-style:none;padding:0;margin:0;">
          <li v-for="apt in slotModal.appointments" :key="apt.id" style="padding:0.4rem 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600">{{ formatTime(apt.appointment_time) }} — {{ apt.title }}</div>
              <div style="font-size:0.9rem;color:#666">{{ apt.patient_name || '' }}</div>
            </div>
            <div style="display:flex;gap:0.4rem;align-items:center;">
              <button @click="openEditModal(apt)" class="btn-edit">✏️</button>
              <button @click="deleteAppointment(apt.id); closeSlotModal()" class="btn-delete">🗑️</button>
            </div>
          </li>
        </ul>
        <div class="modal-actions" style="margin-top:1rem;">
          <button @click="closeSlotModal" class="btn-cancel">Schließen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { useAuthStore } from './auth.js';

// Mock data for local dev testing

const authStore = useAuthStore();
const API_BASE = '/api';
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
const DEV_STORAGE_KEY = 'dev:appointments';

// State
const appointments = ref([]);
const patients = ref([]);
const staffUsers = ref([]);
const loading = ref(false);
const stats = ref({ today: 0, pending: 0, urgent: 0 });

// CSV import state
const csvInput = ref(null);
const csvFile = ref(null);
const csvFileName = ref('');
const isImporting = ref(false);

function openFilePicker() {
  if (csvInput.value && csvInput.value.click) {
    try { csvInput.value.click(); } catch (e) { /* ignore */ }
  }
}

function onFileChange(event) {
  const f = event && event.target && event.target.files ? event.target.files[0] : null;
  if (!f) { csvFile.value = null; csvFileName.value = ''; return; }
  csvFile.value = f;
  csvFileName.value = f.name;
  // Automatically import immediately after selection
  // allow UI to update filename before import starts
  setTimeout(() => { importCSV().catch(e => console.error(e)); }, 100);
}

async function importCSV() {
  if (!csvFile.value) { alert('Bitte zuerst eine CSV-Datei auswählen.'); return; }
  isImporting.value = true;
  try {
    if (isDev) {
      // Simple CSV -> JSON parser for dev mode (no external deps)
      const text = await csvFile.value.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length === 0) throw new Error('Leere Datei');
      const headers = lines.shift().split(',').map(h => h.trim());
      const rows = lines.map(line => {
        const parts = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = parts[i] ? parts[i].trim() : ''; });
        return obj;
      });
      // merge into dev storage
      const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
      const arr = JSON.parse(raw);
      let nextId = arr.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1;
      rows.forEach(r => { r.id = nextId++; arr.push(r); });
      localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(arr));
      alert('Import erfolgreich (dev).');
      await fetchAppointments();
      await fetchStats();
    } else {
      // Parse CSV client-side and send JSON to server (server expects { appointments: [...] })
      const token = authStore.token || localStorage.getItem('token');
      const text = await csvFile.value.text();
      const parseLine = (line) => {
        const res = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (ch === ',' && !inQuotes) {
            res.push(cur);
            cur = '';
          } else { cur += ch; }
        }
        res.push(cur);
        return res.map(s => s.trim());
      };
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length === 0) throw new Error('Leere Datei');
      const headers = parseLine(lines.shift()).map(h => h.replace(/^\uFEFF/, '').trim());
      const rows = lines.map(line => {
        const cols = parseLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = cols[i] !== undefined ? cols[i] : ''; });
        return obj;
      });

      const res = await fetch(`${API_BASE}/appointments/import-csv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: rows })
      });
      if (res.ok) {
        alert('Import erfolgreich!');
        await fetchAppointments();
        await fetchStats();
      } else {
        const txt = await res.text();
        alert('Import fehlgeschlagen: ' + txt);
      }
    }
  } catch (e) {
    alert('Fehler beim Import: ' + (e && e.message ? e.message : e));
  } finally {
    isImporting.value = false;
    csvFile.value = null;
    csvFileName.value = '';
    try { if (csvInput.value) csvInput.value.value = ''; } catch (e) {}
  }
}

// Speech-bubble for appointment details in week view
const appointmentBubble = ref({ visible: false, x: 0, y: 0, id: null });
const bubbleRef = ref(null);
const bubbleApt = computed(() => {
  if (!appointmentBubble.value || !appointmentBubble.value.id) return null;
  return appointments.value.find(a => String(a.id) === String(appointmentBubble.value.id)) || null;
});

// Slot modal (kept for compatibility with modal that lists overflowed slot appointments)
const slotModal = ref({ visible: false, date: '', hour: null, appointments: [] });

function openSlotModal(date, hour, appts = []) {
  slotModal.value = { visible: true, date, hour, appointments: appts };
}
function closeSlotModal() {
  slotModal.value.visible = false;
  slotModal.value.appointments = [];
}

// View & Filter
const viewMode = ref('week');
const currentDate = ref(new Date());
// single-select filters. empty = all
const filterCategory = ref('');
const filterStatus = ref('');
const filterStaff = ref('');
const selectedStaffId = computed(() => String(filterStaff.value || ''));
const filterDate = ref(''); // ISO date string or empty
const filterHour = ref(null);

const allCategories = ['sprint-planung','team-meeting','code-review','deployment','testing','dokumentation','planning','sonstiges'];
const allStatuses = ['geplant','in_bearbeitung','erledigt','abgesagt'];

// week body ref for scrollbar sync
const weekBodyRef = ref(null);
const weekHeaderRef = ref(null);
const todayOverlay = ref(null);
const resizeHandler = () => { updateWeekScrollbar(); updateTodayOverlay(); };
function updateWeekScrollbar() {
  nextTick(() => {
    const el = weekBodyRef.value;
    const wh = weekHeaderRef.value;
    if (!el || !wh) return;
    const scrollbar = el.offsetWidth - el.clientWidth;
    wh.style.setProperty('--week-scrollbar', `${scrollbar}px`);
    updateTodayOverlay();
  });
}

function updateTodayOverlay() {
  nextTick(() => {
    const header = weekHeaderRef.value;
    const overlay = todayOverlay.value || (header && header.querySelector('.today-overlay'));
    if (!header || !overlay) return;
    const todayHeader = header.querySelector('.day-col.today');
    if (!todayHeader) {
      overlay.style.display = 'none';
      return;
    }
    overlay.style.display = 'block';
    const headerRect = header.getBoundingClientRect();
    const thRect = todayHeader.getBoundingClientRect();
    const left = thRect.left - headerRect.left;
    const width = thRect.width;
    overlay.style.left = `${left}px`;
    overlay.style.width = `${width}px`;
    overlay.style.top = '0';
    overlay.style.bottom = '0';
    overlay.style.height = 'auto';
  });
}

// Modal State
const showAddModal = ref(false);
const showEditModal = ref(false);
const formData = ref(getEmptyFormData());

// Export range: 'all' | 'week' | 'month' | 'year'
const exportRange = ref('week');

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
    assigned_to: '',
    recurring: false,
    recurring_interval: 'woechentlich',
    notes: ''
  };
}

// Computed
// full day hours 0:00 - 23:00 so we can add entries at any hour
// show times 8:00 - 18:00 (reduced range)
const hours = computed(() => Array.from({ length: 11 }, (_, i) => i + 8)); // 8 - 18

const weekDays = computed(() => {
  const days = [];
  const startOfWeek = getStartOfWeek(currentDate.value);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push({
      date: `${year}-${month}-${day}`,
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
    // single category
    if (filterCategory.value && apt.category !== filterCategory.value) return false;
    if (filterStatus.value && apt.status !== filterStatus.value) return false;
    if (filterStaff.value) {
      const f = String(filterStaff.value);
      // match by assigned_to id when available
      if (String(apt.assigned_to || '') === f) {
        // ok
      } else {
        // fallback: match by assigned_firstname/assigned_lastname to support mock data
        const assignedName = ((apt.assigned_firstname || '').trim() + ' ' + (apt.assigned_lastname || '').trim()).trim();
        const staffObj = staffUsers.value.find(s => String(s.id) === f);
        const staffName = staffObj ? (staffObj.firstname + ' ' + (staffObj.lastname || '')).trim() : '';
        if (!staffName || assignedName !== staffName) return false;
      }
    }
    // date filter (exact match)
    if (filterDate.value && String(apt.appointment_date || '').split('T')[0] !== filterDate.value) return false;
    // hour filter (number)
    if (filterHour.value !== null && filterHour.value !== undefined && filterHour.value !== '') {
      const aptHour = parseInt((apt.appointment_time || '00:00').split(':')[0], 10);
      if (aptHour !== Number(filterHour.value)) return false;
    }
    return true;
  });
});

// Sorting & Pagination for list view
const sortField = ref('appointment_date');
const sortDir = ref('desc'); // 'asc' or 'desc' — default newest first

function toggleSort(field) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    // default direction: date desc, others asc
    sortDir.value = field === 'appointment_date' ? 'desc' : 'asc';
  }
}

function sortIndicator(field) {
  if (sortField.value !== field) return '↕';
  return sortDir.value === 'asc' ? '⬆' : '⬇';
}

const sortedAppointments = computed(() => {
  const arr = filteredAppointments.value.slice();
  const field = sortField.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;

  function parseDateValue(item) {
    const dateRaw = item.appointment_date || '';
    const timeRaw = item.appointment_time || '00:00';
    // ISO-like (YYYY-MM-DD)
    if (dateRaw.includes('-')) {
      const d = new Date(`${dateRaw}T${timeRaw}`);
      if (!isNaN(d)) return d.getTime();
    }
    // European format D.M.YYYY or DD.MM.YYYY
    if (dateRaw.includes('.')) {
      const parts = dateRaw.split('.').map(p => p.trim());
      if (parts.length >= 3) {
        const d = parseInt(parts[0], 10) || 1;
        const m = (parseInt(parts[1], 10) || 1) - 1;
        const y = parseInt(parts[2], 10) || 1970;
        const [h, min] = (timeRaw || '00:00').split(':').map(n => parseInt(n, 10) || 0);
        const dt = new Date(y, m, d, h, min);
        if (!isNaN(dt)) return dt.getTime();
      }
    }
    // fallback
    const fallback = new Date(dateRaw);
    return isNaN(fallback) ? 0 : fallback.getTime();
  }

  function parseTimeValue(item) {
    const t = (item.appointment_time || '00:00').split(':');
    const h = parseInt(t[0], 10) || 0;
    const m = parseInt(t[1], 10) || 0;
    return h * 60 + m;
  }

  arr.sort((a, b) => {
    let va, vb;
    if (field === 'appointment_date') {
      va = parseDateValue(a);
      vb = parseDateValue(b);
    } else if (field === 'appointment_time') {
      va = parseTimeValue(a);
      vb = parseTimeValue(b);
    } else if (field === 'title') {
      va = (a.title || '').toLowerCase();
      vb = (b.title || '').toLowerCase();
    } else {
      va = a[field]; vb = b[field];
    }
    if (va > vb) return dir;
    if (va < vb) return -dir;
    return 0;
  });
  return arr;
});

// Pagination for list view
const page = ref(1);
const perPage = 25;
const totalPages = computed(() => Math.max(1, Math.ceil(filteredAppointments.value.length / perPage)));
const paginatedAppointments = computed(() => {
  const start = (page.value - 1) * perPage;
  return sortedAppointments.value.slice(start, start + perPage);
});

// Quick slot overflow handling for week view
const maxVisibleSlot = 3; // show up to 3 pills per time-slot

function openSlotList(date, hour) {
  // switch to list view and apply filters for this slot
  viewMode.value = 'list';
  filterDate.value = date;
  filterHour.value = hour;
  page.value = 1;
}

// Reset to first page when filters change
watch(filteredAppointments, () => { page.value = 1; });

// Helper Functions
function getStartOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday is start of week
  d.setDate(d.getDate() + diff);
  return d;
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

// Normalize various date representations to `YYYY-MM-DD`
function normalizeToDate(val) {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') {
    // already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // ISO datetime -> take date part
    if (val.indexOf('T') !== -1) return val.split('T')[0];
    // try Date parse fallback
    const d = new Date(val);
    if (!isNaN(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return val;
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  // numbers or other
  try {
    const d = new Date(val);
    if (!isNaN(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  } catch (e) {}
  return String(val);
}

function getAppointmentsForSlot(date, hour) {
  return filteredAppointments.value.filter(apt => {
    // Normalize appointment_date to YYYY-MM-DD in local time
    let aptDate;
    if (typeof apt.appointment_date === 'string') {
      aptDate = apt.appointment_date.split('T')[0];
    } else if (apt.appointment_date instanceof Date) {
      const d = apt.appointment_date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      aptDate = `${year}-${month}-${day}`;
    } else {
      aptDate = String(apt.appointment_date);
    }
    if (aptDate !== date) return false;
    const aptHour = parseInt(apt.appointment_time.split(':')[0]);
    return aptHour === hour;
  });
}

function getAppointmentsForDay(date) {
  return filteredAppointments.value.filter(apt => {
    // Normalize appointment_date to YYYY-MM-DD in local time
    let aptDate;
    if (typeof apt.appointment_date === 'string') {
      aptDate = apt.appointment_date.split('T')[0];
    } else if (apt.appointment_date instanceof Date) {
      const d = apt.appointment_date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      aptDate = `${year}-${month}-${day}`;
    } else {
      aptDate = String(apt.appointment_date);
    }
    return aptDate === date;
  });
}

function getCategoryLabel(cat) {
  const labels = {
    'sprint-planung': 'Sprint Planung',
    'team-meeting': 'Team Meeting',
    'code-review': 'Code Review',
    'deployment': 'Deployment',
    'testing': 'Testing',
    'dokumentation': 'Dokumentation',
    'planning': 'Planning',
    'sonstiges': 'Sonstiges'
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
  viewMode.value = 'week';
  fetchAppointments();
}

function selectDayForDetails(date) {
  // Parse date string as local time to avoid timezone shifting
  const [year, month, day] = date.split('-').map(Number);
  currentDate.value = new Date(year, month - 1, day);
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
    appointment_date: normalizeToDate(apt.appointment_date),
    appointment_time: apt.appointment_time,
    end_time: apt.end_time || '',
    category: apt.category,
    priority: apt.priority,
    status: apt.status,
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

async function showAppointmentBubble(event, apt) {
  event.stopPropagation();
  const rect = event.currentTarget.getBoundingClientRect();
  appointmentBubble.value = { visible: true, x: rect.left + rect.width / 2, y: rect.bottom + 8, content: apt.description || apt.notes || '', id: apt.id };
  await nextTick();
  const b = bubbleRef.value;
  if (b && b.getBoundingClientRect) {
    const br = b.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - br.width / 2;
    let top = rect.bottom + 8;
    let placement = 'below';
    if (top + br.height + 8 > window.innerHeight) {
      top = rect.top - br.height - 8;
      placement = 'above';
    }
    left = Math.max(8, Math.min(left, window.innerWidth - br.width - 8));
    appointmentBubble.value.x = left;
    appointmentBubble.value.y = Math.max(8, top);
    appointmentBubble.value.placement = placement;
  }
  await nextTick();
}

function closeAppointmentBubble() {
  appointmentBubble.value.visible = false;
}

// Inline bubble editing removed: kept bubble read-only to avoid unreliable textarea behavior.

async function deleteAppointmentFromBubble(id) {
  if (!confirm('Termin wirklich löschen?')) return;
  try {
    const token = authStore.token || localStorage.getItem('token');
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        const newArr = arr.filter(a => String(a.id) !== String(id));
        localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(newArr));
        appointmentBubble.value.visible = false;
        await fetchAppointments();
        await fetchStats();
      } catch (e) { console.error('DEV delete error', e); }
    } else {
      const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        appointmentBubble.value.visible = false;
        await fetchAppointments();
        await fetchStats();
      }
    }
  } catch (err) { console.error(err); }
}

function openEditFromBubble() {
  const id = appointmentBubble.value && appointmentBubble.value.id;
  if (!id) return;
  const apt = appointments.value.find(a => String(a.id) === String(id));
  if (!apt) return;
  openEditModal(apt);
  appointmentBubble.value.visible = false;
}

// API Calls
async function fetchAppointments() {
  loading.value = true;
  try {
    if (isDev) {
      // Load from localStorage (seed from mockAppointments if necessary)
      try {
        let data = [];
        const raw = localStorage.getItem(DEV_STORAGE_KEY);
        if (raw) data = JSON.parse(raw);
        else {
          data = Array.isArray(appointments.value) && appointments.value.length ? appointments.value.slice() : (typeof mockAppointments !== 'undefined' ? mockAppointments.slice() : []);
          localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(data));
        }

        // filter by view
        let result = data;
        if (viewMode.value === 'week') {
          const start = new Date(weekDays.value[0].date);
          const end = new Date(weekDays.value[6].date);
          result = data.filter(a => {
            const d = new Date((a.appointment_date || '').split('T')[0] + 'T00:00');
            return d >= start && d <= end;
          });
        } else if (viewMode.value === 'month') {
          const y = currentDate.value.getFullYear();
          const m = currentDate.value.getMonth();
          result = data.filter(a => {
            const d = new Date((a.appointment_date || '').split('T')[0] + 'T00:00');
            return d.getFullYear() === y && d.getMonth() === m;
          });
        } else if (viewMode.value === 'list') {
          result = data.slice();
        }
        appointments.value = result;
        updateWeekScrollbar();
        loading.value = false;
        return;
      } catch (e) {
        console.error('DEV fetchAppointments error', e);
        appointments.value = [];
        loading.value = false;
        return;
      }
    }
    const token = authStore.token || localStorage.getItem('token');
    let url = `${API_BASE}/appointments`;
    
    if (viewMode.value === 'week') {
      url += `?week=${weekDays.value[0].date}`;
    } else if (viewMode.value === 'month') {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth() + 1;
      url += `?month=${month}&year=${year}`;
    } else if (viewMode.value === 'list') {
      // fetch all for client-side pagination (server default limit is 100)
      url += `?limit=10000`;
    }
    
    // Debug log the request URL and token presence
    console.debug('[Appointments] fetching', url, 'token?', !!token);
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.debug('[Appointments] response status', res.status);
    if (res.ok) {
      const data = await res.json();
      console.debug('[Appointments] fetched', (data && data.length) || 0, 'appointments');
      appointments.value = data || [];
      updateWeekScrollbar();
    } else {
      const text = await res.text();
      console.error('[Appointments] fetch failed:', res.status, text);
      // clear appointments so UI shows empty state explicitly
      appointments.value = [];
      updateWeekScrollbar();
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
    // Prefer the API when we have an auth token (real data).
    const token = authStore.token || localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/appointments/stats/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          stats.value = await res.json();
          return;
        } else {
          console.warn('[Appointments] stats endpoint returned', res.status);
        }
      } catch (e) {
        console.warn('[Appointments] stats API failed, falling back to dev storage', e);
      }
    }

    // Fallback: when running in dev without a token, use the local dev storage mock
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
        const data = JSON.parse(raw);
        const today = new Date().toISOString().split('T')[0];
        stats.value = {
          today: data.filter(a => (a.appointment_date||'').split('T')[0] === today).length,
          pending: data.filter(a => a.status === 'geplant' || a.status === '').length,
          urgent: data.filter(a => a.priority === 'dringend').length
        };
      } catch (e) { console.error('DEV fetchStats error', e); }
    }
  } catch (err) {
    console.error('Fehler beim Laden der Statistiken:', err);
  }
}

async function fetchPatients() {
  try {
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
        const data = JSON.parse(raw);
        const map = {};
        data.forEach(a => {
          if (a.patient_name) map[a.patient_name] = a.patient_name;
        });
        patients.value = Object.keys(map).map((name, idx) => ({ id: idx+1, name }));
      } catch (e) { console.error('DEV fetchPatients error', e); }
      return;
    }
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
    if (isDev) {
      // In dev mode, show only the fixed set of staff accounts to avoid long lists
      try {
        staffUsers.value = [
          { id: 1, firstname: 'Admin', lastname: 'User' },
          { id: 2, firstname: 'Marie', lastname: 'Schmidt' },
          { id: 3, firstname: 'Tobias', lastname: 'Müller' },
          { id: 4, firstname: 'Lisa', lastname: 'Wagner' }
        ];
      } catch (e) { console.error('DEV fetchStaffUsers error', e); }
      return;
    }
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
    const payload = Object.assign({}, formData.value);
    payload.appointment_date = normalizeToDate(payload.appointment_date);
    payload.title = payload.title ?? 'Unbenannter Termin';
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw);
        const id = Date.now();
        const toSave = Object.assign({ id }, payload);
        arr.push(toSave);
        localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(arr));
        closeModals();
        await fetchAppointments();
        await fetchStats();
      } catch (e) { console.error('DEV createAppointment error', e); }
    } else {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        closeModals();
        fetchAppointments();
        fetchStats();
      }
    }
  } catch (err) {
    console.error('Fehler beim Erstellen:', err);
  }
}

async function updateAppointment() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const payload = Object.assign({}, formData.value);
    payload.appointment_date = normalizeToDate(payload.appointment_date);
    payload.title = payload.title ?? (formData.value.title || 'Unbenannter Termin');
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw);
        const idx = arr.findIndex(a => String(a.id) === String(formData.value.id));
        if (idx !== -1) {
          arr[idx] = Object.assign({}, arr[idx], payload);
          localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(arr));
        }
        closeModals();
        await fetchAppointments();
        await fetchStats();
      } catch (e) { console.error('DEV updateAppointment error', e); }
    } else {
      const res = await fetch(`${API_BASE}/appointments/${formData.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        closeModals();
        fetchAppointments();
        fetchStats();
      }
    }
  } catch (err) {
    console.error('Fehler beim Aktualisieren:', err);
  }
}

async function updateStatus(apt) {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const payload = Object.assign({}, apt);
    payload.appointment_date = normalizeToDate(payload.appointment_date);
    payload.title = payload.title ?? (apt.title || 'Unbenannter Termin');
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw);
        const idx = arr.findIndex(a => String(a.id) === String(apt.id));
        if (idx !== -1) {
          arr[idx] = Object.assign({}, arr[idx], payload);
          localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(arr));
        }
      } catch (e) { console.error('DEV updateStatus error', e); }
      fetchStats();
    } else {
      await fetch(`${API_BASE}/appointments/${apt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      fetchStats();
    }
  } catch (err) {
    console.error('Fehler beim Status-Update:', err);
  }
}

async function deleteAppointment(id) {
  if (!confirm('Termin wirklich löschen?')) return;
  try {
    const token = authStore.token || localStorage.getItem('token');
    if (isDev) {
      try {
        const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw);
        const newArr = arr.filter(a => String(a.id) !== String(id));
        localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(newArr));
        await fetchAppointments();
        await fetchStats();
      } catch (e) { console.error('DEV deleteAppointment error', e); }
    } else {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAppointments();
        fetchStats();
      }
    }
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
  }
}

function exportCSV() {
  const token = authStore.token || localStorage.getItem('token');
  if (!token) { alert('Bitte anmelden um CSV-Export auszuführen.'); return; }
  const mode = viewMode.value || 'week';
  let url = `${API_BASE}/appointments/export/csv`;
  let filename = 'termine';

  if (mode === 'week') {
    const startDate = (weekDays.value && weekDays.value[0] && weekDays.value[0].date) ? weekDays.value[0].date : currentDate.value.toISOString().split('T')[0];
    const endDate = (weekDays.value && weekDays.value[6] && weekDays.value[6].date) ? weekDays.value[6].date : currentDate.value.toISOString().split('T')[0];
    url += `?start_date=${startDate}&end_date=${endDate}`;
    filename += `_${startDate}_to_${endDate}`;
  } else if (mode === 'month') {
    const y = currentDate.value.getFullYear();
    const m = currentDate.value.getMonth();
    const first = new Date(y, m, 1).toISOString().split('T')[0];
    const last = new Date(y, m + 1, 0).toISOString().split('T')[0];
    url += `?start_date=${first}&end_date=${last}`;
    filename += `_${first}_to_${last}`;
  } else if (mode === 'list') {
    filename += `_list`;
  } else {
    filename += `_all`;
  }

  fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(async res => {
    if (!res.ok) {
      const text = await res.text();
      alert('Export fehlgeschlagen: ' + text);
      return;
    }
    const blob = await res.blob();
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(urlObj);
  }).catch(err => { console.error('Export Fehler', err); alert('Export fehlgeschlagen'); });
}

// Watchers
watch(viewMode, () => fetchAppointments());

// Init
onMounted(() => {
  // Clear old dev cache to ensure fresh data from API
  if (!isDev) {
    try {
      localStorage.removeItem(DEV_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
  
  fetchAppointments();
  fetchStats();
  fetchPatients();
  fetchStaffUsers();
  // close filter dropdowns when clicking elsewhere
  document.addEventListener('click', handleDocClick);
  // update scrollbar sync and listen for resize
  updateWeekScrollbar();
  updateTodayOverlay();
  window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
  if (bubbleSaveTimer) clearTimeout(bubbleSaveTimer);
  document.removeEventListener('click', handleDocClick);
  window.removeEventListener('resize', resizeHandler);
});

function handleDocClick() {
  // Close any open modals when clicking outside
  closeAppointmentBubble();
}

function seedMockData() {
  try {
    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(typeof mockAppointments !== 'undefined' ? mockAppointments.slice() : []));
    fetchAppointments();
  } catch (e) { console.error('seedMockData error', e); }
}
</script>

<style scoped>
.appointments-container {
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: visible; /* ensure children can show above surrounding elements */
}

.import-controls .btn-import {
  margin-right: 0.5rem;
  background: #f5f5f5;
  color: #0c4b47;
  border: 1px solid #ddd;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.import-controls .btn-import[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
.import-controls .btn-choose {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  margin-left: 0.4rem;
  cursor: pointer;
}
.import-filename {
  margin-left: 0.6rem;
  font-size: 0.9rem;
  color: #333;
}

.dev-banner {
  background: #fff7e6;
  border: 1px dashed #f0a500;
  padding: 0.45rem 0.6rem;
  margin-bottom: 0.6rem;
  border-radius: 6px;
  color: #664400;
  font-weight: 600;
}
.dev-banner .dev-btn { margin-left: 0.6rem; padding: 0.25rem 0.5rem; border-radius:4px; border:1px solid #f0a500; background:white; cursor:pointer; }

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
  padding: 0.85rem 1.2rem;
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
  font-size: 1.55rem;
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

.header-actions .right-actions {
  margin-left: auto;
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.btn-add {
  background: #0c4b47;
  color: white;
  border: none;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn-add:hover {
  background: #0a3a36;
}

/* Export controls (dropdown + button) */
.export-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.export-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 0.45rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #0c4b47;
  min-width: 110px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(12,75,71,0.03);
}

.export-select:focus {
  outline: none;
  border-color: rgba(12,75,71,0.6);
  box-shadow: 0 4px 12px rgba(12,75,71,0.08);
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  background: #f5f5f5;
  color: #0c4b47;
  border: 1px solid #ddd;
  cursor: pointer;
}

.btn-export:hover {
  background: #eef6f4;
}

/* Import button should match export exactly */
.btn-import {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  background: #f5f5f5;
  color: #0c4b47;
  border: 1px solid #ddd;
  cursor: pointer;
}
.btn-import:hover { background: #eef6f4; }
.import-filename { margin-left: 0.5rem; font-size: 0.95rem; color: #333; }

/* small responsive tweaks */
@media (max-width: 768px) {
  .export-controls { width: 100%; }
  .export-select { flex: 1; }
  .btn-export { flex-shrink: 0; }
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.85rem;
  border-radius: 8px;
  margin-bottom: 0.9rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.view-toggle {
  display: flex;
  gap: 0.3rem;
}

.view-toggle button {
  padding: 0.42rem 0.8rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 3px;
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
  padding: 0.42rem 0.8rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.current-date {
  font-weight: bold;
  min-width: 150px;
  text-align: center;
}

.btn-today {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

/* Filter dropdowns — now using standard select elements */
.filters { display:flex; gap:0.75rem; align-items:center; flex-wrap: wrap; }
.filters .status-select { 
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 0.95rem;
}
.filters .status-select:hover {
  border-color: #0c4b47;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Legend */
.legend {
  background: #f9fffe;
  border: 1px solid #e0f0ed;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 6px rgba(12,75,71,0.04);
}

.legend-title {
  font-weight: 700;
  color: #0c4b47;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
}

.legend-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.legend-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.legend-label {
  font-weight: 600;
  color: #0c4b47;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #333;
}

.legend-box {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(12,75,71,0.15);
}

/* Week View */
.week-view {
  width: 100%;
  max-width: 100%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: 8px;
  overflow: hidden;
}

.week-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.week-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.week-header {
  background: #0c4b47;
  color: white;
}

.time-col-header {
  width: 88px;
  padding: 0.75rem;
  background: #0c4b47;
  color: white;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-right: 1px solid rgba(255,255,255,0.15);
}

.week-header .day-col {
  padding: 0.75rem;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.15);
  font-weight: 600;
}

.week-header .day-col:last-child {
  border-right: none;
}

.week-header .day-col.today {
  background: #0a3f3b;
}

.day-name {
  display: block;
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.day-date {
  display: block;
  font-size: 1.05rem;
  font-weight: 600;
}

.week-body {
  background: white;
}

.time-row {
  border-bottom: 1px solid #e0e0e0;
}

.time-row:last-child {
  border-bottom: none;
}

.time-col {
  width: 88px;
  padding: 0.6rem 0.45rem;
  font-size: 0.78rem;
  color: #666;
  background: #f9f9f9;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  font-weight: 600;
  vertical-align: top;
}

.day-cell {
  padding: 0.42rem;
  cursor: pointer;
  border-right: 1px solid #e0e0e0;
  background: white;
  transition: background 0.15s;
  vertical-align: top;
  min-height: 68px;
  height: 68px;
}

.day-cell:last-child {
  border-right: none;
}

.day-cell:hover {
  background: #f5f5f5;
}

.day-cell.today {
  background: #e6f7f2;
}

.appointment-block {
  background: #e3f2fd;
  border-radius: 6px;
  padding: 0.2rem 0.45rem;
  margin-bottom: 0.18rem;
  font-size: 0.82rem;
  display: block;
  width: 100%; /* make pill span full cell width so more text is visible */
  box-sizing: border-box;
  height: auto;
  min-height: 22px;
  line-height: 1.05;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
  .appointment-block .apt-patient { margin-left: 0; color: #2e7d74; font-size: 0.85rem; }

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
  background: transparent;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

/* Month header (week day labels) */
.month-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr));
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
  grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 6px;
  align-items: stretch;
}
.month-cell {
  height: 120px; /* slightly reduced */
  padding: 0.45rem;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.month-cell {
  height: 140px; /* fixed height so all days are equal */
  padding: 0.6rem;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* keep date header at top and make appointments list scrollable inside the fixed cell */
.cell-date {
  display: block;
  font-weight: bold;
  margin-bottom: 0.4rem;
}
.cell-appointments {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0; /* allow flex child to shrink for proper scrolling */
}
.cell-appointments .mini-appointment,
.cell-appointments .more-appointments {
  display: block;
  margin-bottom: 0.3rem;
}
.more-count {
  font-size: 0.85rem;
  color: #0c4b47;
  background: rgba(12,75,71,0.06);
  border-radius: 8px;
  padding: 0.18rem 0.5rem;
  display: inline-block;
  cursor: pointer;
  margin-top: 0.2rem;
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
  font-size: 0.62rem;
  padding: 0.16rem 0.32rem;
  margin-bottom: 0.16rem;
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
.list-view {
  width: 100%;
  /* allow the list to expand if needed but prefer fitting into parent width */
  overflow-x: visible;
  overflow-y: visible;
  padding-bottom: 1rem;
  position: relative;
}

.list-view .list-inner {
  /* keep ~100px margins on both sides and center the inner content */
  max-width: calc(100% - 200px);
  width: 100%;
  padding: 0; /* remove extra inner padding to avoid shifting */
  box-sizing: border-box;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center; /* center table and pagination */
  justify-content: flex-start;
}

@media (max-width: 1200px) {
  .list-view .list-inner {
    width: 100%;
    padding: 0 24px; /* smaller side gutters for narrower screens */
  }
}

.appointments-table {
  width: auto;
  table-layout: auto; /* let browser size columns so content remains visible */
  margin: 1rem 0;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-radius: 8px;
  overflow: visible;
  position: relative;
  z-index: 2;
}

/* Make header/body cells truncate content instead of forcing scroll */
.appointments-table th,
.appointments-table td {
  padding: 0.6rem 0.7rem;
  vertical-align: middle;
}

/* Headers: show full text, no ellipsis, allow visible overflow */
.appointments-table thead th {
  /* Allow header text to wrap so the table can shrink to viewport */
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

/* Data cells: keep truncation to avoid breaking layout */
.appointments-table tbody td {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Allow the title and category columns to wrap so the table can shrink to viewport
   instead of pushing overflow off-screen. Keep other columns nowrap for readability. */
.appointments-table tbody td:nth-child(3),
.appointments-table tbody td:nth-child(4) {
  white-space: normal;
}

/* Keep first columns (date/time) and actions compact */
.appointments-table tbody td:nth-child(1),
.appointments-table tbody td:nth-child(2),
.appointments-table td.actions {
  white-space: nowrap;
}

/* Force Aktionen column to a fixed width so buttons remain visible */
.appointments-table th.actions-col,
.appointments-table td.actions {
  width: 110px;
  min-width: 90px;
  max-width: 140px;
  text-align: center;
}

.appointments-table th.sortable { cursor: pointer; }

.appointments-table thead {
  display: table-header-group;
}

.appointments-table thead tr { display: table-row; }
.appointments-table th {
  background: #0c4b47;
  color: white;
  padding: 0.7rem 0.8rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap; /* keep header labels on one line */
  vertical-align: middle;
}

.appointments-table th.sortable {
  cursor: pointer;
  display: table-cell; /* keep native table layout */
  vertical-align: middle;
  padding-right: 1rem;
}
.sort-wrap { display: inline-flex; align-items: center; gap: 0.35rem; }
.sort-ind { color: rgba(255,255,255,0.95); font-size: 0.95rem; line-height: 1; margin-left: 0.25rem; }
.sort-wrap:hover .sort-ind { color: #e0f7f5; }

.appointments-table thead th:first-child { border-top-left-radius: 0; }
.appointments-table thead th:last-child { border-top-right-radius: 0; }

.appointments-table tbody {
  display: table-row-group;
}

.appointments-table tbody tr {
  display: table-row;
  background: white;
  transition: background 0.2s;
}

.appointments-table tbody tr:hover {
  background: #f8fffe;
  cursor: pointer;
}

.appointments-table td {
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  font-size: 0.85rem;
}

/* Ensure status select has enough room and its dropdown is not clipped */
.status-select {
  min-width: 140px;
  z-index: 5000;
  position: relative;
}

/* Reduce overall table font slightly to help fit */
.appointments-table, .appointments-table th, .appointments-table td {
  font-size: 0.92rem;
}

.appointments-table tbody tr:last-child td {
  border-bottom: none;
}

/* Priority row backgrounds */
.priority-row-niedrig { background: #e3f2fd; }
.priority-row-mittel { background: #e3f2fd; }
.priority-row-hoch { background: #fff8e1; }
.priority-row-dringend { background: #ffebee; }

/* Category badge */
.category-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Priority badge */
.priority-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.prio-niedrig { background: #e8f5e9; color: #388e3c; }
.prio-mittel { background: #fff3e0; color: #f57c00; }
.prio-hoch { background: #fff3e0; color: #e65100; }
.prio-dringend { background: #ffebee; color: #c62828; }

/* Recurring badge */
.recurring-badge {
  margin-left: 0.3rem;
  font-size: 0.85rem;
}

/* Actions column */
.actions {
  white-space: nowrap;
  display: flex;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: flex-start;
}

.btn-edit, .btn-delete {
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.btn-edit { 
  background: #e3f2fd; 
  color: #1976d2; 
}
.btn-edit:hover {
  background: #bbdefb;
  transform: scale(1.1);
}
.btn-delete { 
  background: #ffebee; 
  color: #c62828; 
}
.btn-delete:hover {
  background: #ffcdd2;
  transform: scale(1.1);
}

.day-cell.today {
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.03);
  border-left-color: rgba(0,0,0,0.06);
}

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
  overflow-y: auto;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  max-width: 560px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: 1.5rem auto;
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
    grid-template-columns: 35px repeat(7, 1fr);
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
  /* Pagination styles */
  .list-pagination {
    display: flex;
    gap: 0.6rem;
    justify-content: center;
    align-items: center;
    margin: 0.8rem 0 1.6rem 0;
    width: 100%;
  }
  .list-pagination button {
    padding: 0.5rem 0.9rem;
    border-radius: 8px;
    background: #0c4b47;
    color: #ffffff;
    cursor: pointer;
    font-weight: 600;
  }
  .list-pagination button:hover:not(:disabled) {
    background: #0c4b47;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(12,75,71,0.18);
  }
  .list-pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
    border-color: #ddd;
    color: #999;
    transform: none;
    box-shadow: none;
  }
  .list-pagination button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .list-pagination span {
    font-weight: 600;
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
    font-size: 0.75rem;
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
  }
  
  .day-col, .day-cell {
    font-size: 0.7rem;
  }
  
  .appointment-block {
    font-size: 0.68rem;
    padding: 0.18rem 0.4rem;
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
/* Pagination: centered and styled to match the table (desktop + mobile override)
   - centered horizontally
   - generous bottom spacing so it doesn't hug the browser bottom
   - inherits font-family, uses same font-size/color as table rows
*/
  .list-pagination {
    display: flex;
    gap: 1rem; /* larger gap so buttons aren't jammed to text */
    justify-content: center;
    align-items: center;
    margin: 1.25rem auto 3.5rem auto;
    font-family: inherit;
    font-size: 0.95rem;
    color: #0c4b47;
    width: auto; /* size to content so it sits exactly under the table */
    box-sizing: border-box;
    padding: 0; /* remove page-level gutters so pagination centers to table */
  }

  .list-pagination .page-btn {
    padding: 0.65rem 1.25rem; /* good spacing around text */
    border-radius: 9999px; /* fully pill-shaped */
    border: none;
    background: #0c6b64; /* primary green */
    color: #ffffff; /* white text */
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(12,75,71,0.12);
    font-weight: 700;
    letter-spacing: 0.2px;
    transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
    margin: 0 0.35rem; /* ensure they don't sit tight against other elements */
  }

  .list-pagination .page-btn:hover:not(:disabled) {
    background: #0e7f76; /* slightly lighter green */
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 26px rgba(12,75,71,0.16);
  }

  .list-pagination .page-btn:disabled {
    opacity: 0.48;
    cursor: not-allowed;
    background: #f5f5f5;
    border-color: #e6e6e6;
    color: #9e9e9e;
    transform: none;
    box-shadow: none;
  }

  .list-pagination .page-indicator {
    padding: 0.35rem 0.8rem;
    color: #0c4b47;
    font-weight: 700;
    background: rgba(12,75,71,0.04);
    border-radius: 8px;
  }

  .list-pagination .page-btn:focus {
    outline: 3px solid rgba(14,127,118,0.14);
    outline-offset: 3px;
  }

  /* slightly larger spacing between table and pagination */
  .list-inner > .list-pagination { margin-top: 0.9rem; margin-bottom: 2.2rem; }
}
</style>
<style scoped>
/* Appointment speech-bubble styles (overlay + bubble) */
.speech-bubble-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20000;
}
.speech-bubble {
  position: absolute;
  width: 320px;
  max-width: calc(100vw - 24px);
  background: white;
  border: 2px solid #0c4b47;
  border-radius: 6px;
  padding: 0.8rem;
  box-shadow: 0 8px 22px rgba(0,0,0,0.22);
  z-index: 20001;
}
.speech-bubble.arrow-top::before,
.speech-bubble.arrow-top::after {
  left: 50%;
  transform: translateX(-50%);
}
.speech-bubble.arrow-top::before {
  content: '';
  position: absolute;
  top: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #0c4b47;
}
.speech-bubble.arrow-top::after {
  content: '';
  position: absolute;
  top: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}
.speech-bubble.arrow-bottom::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #0c4b47;
}
.speech-bubble.arrow-bottom::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}
.speech-bubble .bubble-close {
  position: absolute;
  top: -12px;
  right: -12px;
  border: 2px solid #0c4b47;
  background: white;
  color: #0c4b47;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.95rem;
  z-index: 20003;
}
.speech-bubble .bubble-textarea {
  width: 100%;
  min-height: 100px;
  box-sizing: border-box;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 0.4rem;
  resize: vertical;
  font-size: 0.9rem;
}
.speech-bubble .bubble-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.8rem;
}
</style>

<style scoped>
/* High-specificity overrides for pagination buttons to ensure they render as intended */
.list-view .list-inner .list-pagination .page-btn,
.list-view .list-inner .list-pagination button.page-btn {
  padding: 0.85rem 1.4rem !important;
  border-radius: 9999px !important;
  border: none !important;
  background: #0c4b47 !important; /* primary green */
  color: #ffffff !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.4rem !important;
  font-weight: 700 !important;
  margin: 0 0.6rem !important;
  box-shadow: 0 8px 22px rgba(12,75,71,0.14) !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease !important;
}

.list-view .list-inner .list-pagination .page-btn:hover:not(:disabled) {
  background: #0e7f76 !important; /* slightly lighter */
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 30px rgba(12,75,71,0.18) !important;
}

.list-view .list-inner .list-pagination .page-btn:disabled {
  background: #f6f6f6 !important;
  color: #9e9e9e !important;
  box-shadow: none !important;
  opacity: 0.6 !important;
}

.list-view .list-inner .list-pagination .page-indicator {
  padding: 0.4rem 0.9rem !important;
  margin: 0 0.5rem !important;
  border-radius: 8px !important;
  background: rgba(12,75,71,0.04) !important;
  font-weight: 700 !important;
}

.list-view .list-inner .list-pagination .page-btn:focus {
  outline: 3px solid rgba(14,127,118,0.14) !important;
  outline-offset: 3px !important;
}
</style>
