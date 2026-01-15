<template>
  <div class="project-wrapper">
    <!-- Inlined Appointments component - standalone for IHK project -->
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
          <div class="dd" ref="catDd">
            <button type="button" class="dd-btn" @click.stop="toggleDropdown('category')">{{ filterCategory ? getCategoryLabel(filterCategory) : 'Alle Kategorien' }}</button>
            <div v-if="showCategoryDropdown" class="dd-menu" @click.stop>
              <div class="dd-item" :class="{selected: filterCategory === ''}" @click="selectCategory('')">Alle Kategorien</div>
              <div v-for="opt in allCategories" :key="opt" class="dd-item" :class="{selected: filterCategory === opt}" @click="selectCategory(opt)">{{ getCategoryLabel(opt) }}</div>
            </div>
          </div>

          <div class="dd" ref="statusDd">
            <button type="button" class="dd-btn" @click.stop="toggleDropdown('status')">{{ filterStatus ? filterStatus.replace('_',' ') : 'Alle Status' }}</button>
            <div v-if="showStatusDropdown" class="dd-menu" @click.stop>
              <div class="dd-item" :class="{selected: filterStatus === ''}" @click="selectStatus('')">Alle Status</div>
              <div v-for="opt in allStatuses" :key="opt" class="dd-item" :class="{selected: filterStatus === opt}" @click="selectStatus(opt)">{{ opt.replace('_',' ') }}</div>
            </div>
          </div>

          <div class="dd" ref="staffDd">
            <button type="button" class="dd-btn" @click.stop="toggleDropdown('staff')">{{ filterStaff ? (staffUsers.find(s=>String(s.id)===String(filterStaff)) ? staffUsers.find(s=>String(s.id)===String(filterStaff)).firstname + ' ' + staffUsers.find(s=>String(s.id)===String(filterStaff)).lastname : 'Ausgewählt') : 'Alle Mitarbeiter' }}</button>
            <div v-if="showStaffDropdown" class="dd-menu" @click.stop>
              <div class="dd-item" :class="{selected: filterStaff === ''}" @click="selectStaff('')">Alle Mitarbeiter</div>
              <div v-for="staff in staffUsers" :key="staff.id" class="dd-item" :class="{selected: String(filterStaff) === String(staff.id)}" @click="selectStaff(String(staff.id))">{{ staff.firstname }} {{ staff.lastname }}</div>
            </div>
          </div>
        </div>
        <div class="date-nav">
          <button @click="navigateDate(-1)">◀</button>
          <span class="current-date">{{ currentDateLabel }}</span>
          <button @click="navigateDate(1)">▶</button>
          <button @click="goToToday" class="btn-today">Heute</button>
        </div>
      </div>

      <!-- Week / Month / List views (identical to Appointments component content) -->
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
              <td v-for="day in weekDays" :key="day.date" class="day-cell" :class="{ today: isToday(day.date) }" @click="openAddModalForSlot(day.date, hour)">
                <div v-for="apt in getAppointmentsForSlot(day.date, hour).slice(0, maxVisibleSlot)" :key="apt.id" class="appointment-block" :class="[`priority-${apt.priority}`, `status-${apt.status}`]" @click.stop="showAppointmentBubble($event, apt)">
                  <span class="apt-time">{{ formatTime(apt.appointment_time) }}</span>
                  <span class="apt-title">{{ apt.title }}</span>
                  <span v-if="apt.patient_name" class="apt-patient">🐦 {{ apt.patient_name }}</span>
                </div>
                <div v-if="getAppointmentsForSlot(day.date, hour).length > maxVisibleSlot" class="more-count" @click.stop="openSlotList(day.date, hour)">+{{ getAppointmentsForSlot(day.date, hour).length - maxVisibleSlot }} weitere</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="viewMode === 'month'" class="month-view">
        <div class="month-header">
          <div v-for="dayName in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" :key="dayName" class="month-day-name">{{ dayName }}</div>
        </div>
        <div class="month-grid">
          <div v-for="(day, index) in monthDays" :key="index" class="month-cell" :class="{ 'other-month': !day.currentMonth, today: isToday(day.date), 'has-appointments': getAppointmentsForDay(day.date).length > 0 }" @click="selectDayForDetails(day.date)">
            <span class="cell-date">{{ day.day }}</span>
            <div class="cell-appointments">
              <div v-for="apt in getAppointmentsForDay(day.date).slice(0, 3)" :key="apt.id" class="mini-appointment" :class="`priority-${apt.priority}`" @click.stop="openEditModal(apt)">{{ formatTime(apt.appointment_time) }} {{ apt.title.substring(0, 15) }}...</div>
              <div v-if="getAppointmentsForDay(day.date).length > 3" class="more-appointments">+{{ getAppointmentsForDay(day.date).length - 3 }} weitere</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'list'" class="list-view">
        <div v-if="loading" class="loading">Lade Termine...</div>
        <div v-else-if="filteredAppointments.length === 0" class="no-appointments">Keine Termine gefunden.</div>
        <table v-else class="appointments-table">
          <thead>
            <tr>
              <th class="sortable" @click="toggleSort('appointment_date')"><span class="sort-wrap">Datum <span class="sort-ind">{{ sortIndicator('appointment_date') }}</span></span></th>
              <th class="sortable" @click="toggleSort('appointment_time')"><span class="sort-wrap">Zeit <span class="sort-ind">{{ sortIndicator('appointment_time') }}</span></span></th>
              <th class="sortable" @click="toggleSort('title')"><span class="sort-wrap">Titel <span class="sort-ind">{{ sortIndicator('title') }}</span></span></th>
              <th>Kategorie</th>
              <th>Priorität</th>
              <th>Patient</th>
              <th>Zugewiesen</th>
              <th>Status</th>
              <th class="actions-col">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apt in paginatedAppointments" :key="apt.id" :class="`priority-row-${apt.priority}`" @click="openEditModal(apt)">
              <td>{{ formatDate(apt.appointment_date) }}</td>
              <td>{{ formatTime(apt.appointment_time) }} - {{ apt.end_time ? formatTime(apt.end_time) : '' }}</td>
              <td><strong>{{ apt.title }}</strong><span v-if="apt.recurring" class="recurring-badge">🔄</span></td>
              <td><span class="category-badge" :class="`cat-${apt.category}`">{{ getCategoryLabel(apt.category) }}</span></td>
              <td><span class="priority-badge" :class="`prio-${apt.priority}`">{{ getPriorityLabel(apt.priority) }}</span></td>
              <td>{{ apt.patient_name || '-' }}</td>
              <td>{{ apt.assigned_firstname ? `${apt.assigned_firstname} ${apt.assigned_lastname}` : '-' }}</td>
              <td><select v-model="apt.status" @change="updateStatus(apt)" class="status-select" @click.stop>
                <option value="geplant">Geplant</option>
                <option value="in_bearbeitung">In Bearbeitung</option>
                <option value="erledigt">Erledigt</option>
                <option value="abgesagt">Abgesagt</option>
              </select></td>
              <td class="actions"><button @click="openEditModal(apt)" class="btn-edit" title="Bearbeiten">✏️</button><button @click="deleteAppointment(apt.id)" class="btn-delete" title="Löschen">🗑️</button></td>
            </tr>
          </tbody>
        </table>
        <div class="list-pagination" v-if="totalPages >= 1">
          <button @click="page = Math.max(1, page - 1)" :disabled="page === 1">Zurück</button>
          <span>Seite {{ page }} / {{ totalPages }}</span>
          <button @click="page = Math.min(totalPages, page + 1)" :disabled="page >= totalPages">Weiter</button>
        </div>
      </div>

      <!-- Modals and bubble kept as in Appointments -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
        <div class="modal">
          <h3>{{ showEditModal ? 'Termin bearbeiten' : 'Neuer Termin' }}</h3>
          <form @submit.prevent="showEditModal ? updateAppointment() : createAppointment()">
            <div class="form-row"><label>Titel *</label><input v-model="formData.title" type="text" required placeholder="Terminbezeichnung"></div>
            <div class="form-row"><label>Beschreibung</label><textarea v-model="formData.description" placeholder="Details zum Termin"></textarea></div>
            <div class="form-row-group">
              <div class="form-row"><label>Datum *</label><input v-model="formData.appointment_date" type="date" required></div>
              <div class="form-row"><label>Startzeit *</label><input v-model="formData.appointment_time" type="time" required></div>
              <div class="form-row"><label>Endzeit</label><input v-model="formData.end_time" type="time"></div>
            </div>
            <div class="form-row-group">
              <div class="form-row"><label>Kategorie</label><select v-model="formData.category"><option value="behandlung">Behandlung</option><option value="fuetterung">Fütterung</option><option value="medikation">Medikation</option><option value="reinigung">Reinigung</option><option value="auswilderung">Auswilderung</option><option value="kontrolle">Kontrolle</option><option value="sonstiges">Sonstiges</option></select></div>
              <div class="form-row"><label>Priorität</label><select v-model="formData.priority"><option value="niedrig">Niedrig</option><option value="mittel">Mittel</option><option value="hoch">Hoch</option><option value="dringend">Dringend</option></select></div>
            </div>
            <div class="form-row-group">
              <div class="form-row"><label>Patient (Vogel)</label><select v-model="formData.patient_id"><option value="">Kein Patient</option><option v-for="patient in patients" :key="patient.id" :value="patient.id">{{ patient.name }} ({{ patient.species }})</option></select></div>
              <div class="form-row"><label>Zugewiesen an</label><select v-model="formData.assigned_to"><option value="">Nicht zugewiesen</option><option v-for="staff in staffUsers" :key="staff.id" :value="staff.id">{{ staff.firstname }} {{ staff.lastname }}</option></select></div>
            </div>
            <div class="form-row recurring-row"><label class="checkbox-label"><input type="checkbox" v-model="formData.recurring">Wiederkehrender Termin</label><select v-if="formData.recurring" v-model="formData.recurring_interval"><option value="taeglich">Täglich</option><option value="woechentlich">Wöchentlich</option><option value="monatlich">Monatlich</option></select></div>
            <div class="form-row"><label>Notizen</label><textarea v-model="formData.notes" placeholder="Zusätzliche Notizen"></textarea></div>
            <div class="modal-actions"><button type="button" @click="closeModals" class="btn-cancel">Abbrechen</button><button type="submit" class="btn-save">{{ showEditModal ? 'Speichern' : 'Erstellen' }}</button></div>
          </form>
        </div>
      </div>

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
              <div><strong>Patient:</strong> {{ bubbleApt ? (bubbleApt.patient_name || '-') : '-' }}</div>
              <div><strong>Zugewiesen:</strong> {{ bubbleApt ? (bubbleApt.assigned_firstname ? bubbleApt.assigned_firstname + ' ' + (bubbleApt.assigned_lastname||'') : '-') : '-' }}</div>
              <div><strong>Status:</strong> {{ bubbleApt ? bubbleApt.status : '-' }}</div>
            </div>
            <label style="margin-top:0.6rem"><strong>Beschreibung / Notizen</strong></label>
            <textarea ref="bubbleTextarea" v-model="appointmentBubble.content" class="bubble-textarea" @input="scheduleSaveAppointmentBubble"></textarea>
            <div class="bubble-actions"><button @click="openEditFromBubble">Bearbeiten</button><button @click="() => deleteAppointmentFromBubble(appointmentBubble.id)">Löschen</button></div>
          </div>
        </div>
      </div>

      <div v-if="slotModal.visible" class="modal-overlay" @click.self="closeSlotModal">
        <div class="modal">
          <h3>Termine: {{ slotModal.date }} {{ String(slotModal.hour).padStart(2,'0') }}:00</h3>
          <ul style="list-style:none;padding:0;margin:0;">
            <li v-for="apt in slotModal.appointments" :key="apt.id" style="padding:0.4rem 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
              <div><div style="font-weight:600">{{ formatTime(apt.appointment_time) }} — {{ apt.title }}</div><div style="font-size:0.9rem;color:#666">{{ apt.patient_name || '' }}</div></div>
              <div style="display:flex;gap:0.4rem;align-items:center;"><button @click="openEditModal(apt)" class="btn-edit">✏️</button><button @click="deleteAppointment(apt.id); closeSlotModal()" class="btn-delete">🗑️</button></div>
            </li>
          </ul>
          <div class="modal-actions" style="margin-top:1rem;"><button @click="closeSlotModal" class="btn-cancel">Schließen</button></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';

// Standalone minimal auth-like object (reads token from localStorage)
const authStore = { token: localStorage.getItem('token') || null };
const API_BASE = '/api';

// State
const appointments = ref([]);
const patients = ref([]);
const staffUsers = ref([]);
const loading = ref(false);
const stats = ref({ today: 0, pending: 0, urgent: 0 });

// Speech-bubble for appointment details in week view
const appointmentBubble = ref({ visible: false, x: 0, y: 0, content: '', id: null });
const bubbleRef = ref(null);
const bubbleTextarea = ref(null);
let bubbleSaveTimer = null;
const bubbleApt = computed(() => {
  if (!appointmentBubble.value || !appointmentBubble.value.id) return null;
  return appointments.value.find(a => String(a.id) === String(appointmentBubble.value.id)) || null;
});

// Slot modal
const slotModal = ref({ visible: false, date: '', hour: null, appointments: [] });

function openSlotModal(date, hour, appts = []) { slotModal.value = { visible: true, date, hour, appointments: appts }; }
function closeSlotModal() { slotModal.value.visible = false; slotModal.value.appointments = []; }

// View & Filter
const viewMode = ref('week');
const currentDate = ref(new Date());
const filterCategory = ref('');
const filterStatus = ref('');
const filterStaff = ref('');
const filterDate = ref('');
const filterHour = ref(null);
const showCategoryDropdown = ref(false);
const showStatusDropdown = ref(false);
const showStaffDropdown = ref(false);

function closeAllDropdowns() { showCategoryDropdown.value = false; showStatusDropdown.value = false; showStaffDropdown.value = false; }
function toggleDropdown(which) {
  if (which === 'category') { showCategoryDropdown.value = !showCategoryDropdown.value; showStatusDropdown.value = false; showStaffDropdown.value = false; }
  else if (which === 'status') { showStatusDropdown.value = !showStatusDropdown.value; showCategoryDropdown.value = false; showStaffDropdown.value = false; }
  else if (which === 'staff') { showStaffDropdown.value = !showStaffDropdown.value; showCategoryDropdown.value = false; showStatusDropdown.value = false; }
}
function selectCategory(val) { filterCategory.value = val; closeAllDropdowns(); }
function selectStatus(val) { filterStatus.value = val; closeAllDropdowns(); }
function selectStaff(val) { filterStaff.value = val; closeAllDropdowns(); }

const allCategories = ['behandlung','fuetterung','medikation','reinigung','auswilderung','kontrolle','sonstiges'];
const allStatuses = ['geplant','in_bearbeitung','erledigt','abgesagt'];

// week helpers
const hours = computed(() => Array.from({ length: 15 }, (_, i) => i + 6));

function getStartOfWeek(date) { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setDate(d.getDate() + diff); return d; }

const weekDays = computed(() => { const days = []; const startOfWeek = getStartOfWeek(currentDate.value); for (let i=0;i<7;i++){ const d = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate()+i); const year=d.getFullYear(); const month=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); days.push({ date:`${year}-${month}-${day}`, name:['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()] }); } return days; });

const monthDays = computed(() => { const days=[]; const year=currentDate.value.getFullYear(); const month=currentDate.value.getMonth(); const firstDay=new Date(year,month,1); const lastDay=new Date(year,month+1,0); let startDay = firstDay.getDay() || 7; for (let i=startDay-1;i>0;i--){ const d=new Date(year,month,1-i); days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), currentMonth:false }); } for (let i=1;i<=lastDay.getDate();i++){ const d=new Date(year,month,i); days.push({ date:d.toISOString().split('T')[0], day:i, currentMonth:true }); } const remaining=42-days.length; for (let i=1;i<=remaining;i++){ const d=new Date(year,month+1,i); days.push({ date:d.toISOString().split('T')[0], day:i, currentMonth:false }); } return days; });

const currentDateLabel = computed(() => { if (viewMode.value === 'week'){ const start = weekDays.value[0]; const end=weekDays.value[6]; return `${formatDate(start.date)} - ${formatDate(end.date)}`; } else { return currentDate.value.toLocaleDateString('de-DE',{ month: 'long', year: 'numeric'}); } });

const filteredAppointments = computed(() => { return appointments.value.filter(apt => { if (filterCategory.value && apt.category !== filterCategory.value) return false; if (filterStatus.value && apt.status !== filterStatus.value) return false; if (filterStaff.value && String(apt.assigned_to || '') !== String(filterStaff.value)) return false; if (filterDate.value && String(apt.appointment_date || '').split('T')[0] !== filterDate.value) return false; if (filterHour.value !== null && filterHour.value !== undefined && filterHour.value !== ''){ const aptHour = parseInt((apt.appointment_time || '00:00').split(':')[0],10); if (aptHour !== Number(filterHour.value)) return false; } return true; }); });

// Sorting & pagination (same as Appointments)
const sortField = ref('appointment_date'); const sortDir = ref('desc'); function toggleSort(field){ if (sortField.value === field) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'; else { sortField.value = field; sortDir.value = field === 'appointment_date' ? 'desc' : 'asc'; } }
function sortIndicator(field){ if (sortField.value !== field) return '↕'; return sortDir.value === 'asc' ? '⬆' : '⬇'; }
const sortedAppointments = computed(() => { const arr = filteredAppointments.value.slice(); const field = sortField.value; const dir = sortDir.value === 'asc' ? 1 : -1; function parseDateValue(item){ const dateRaw = item.appointment_date || ''; const timeRaw = item.appointment_time || '00:00'; if (dateRaw.includes('-')){ const d = new Date(`${dateRaw}T${timeRaw}`); if (!isNaN(d)) return d.getTime(); } if (dateRaw.includes('.')){ const parts = dateRaw.split('.').map(p=>p.trim()); if (parts.length>=3){ const d=parseInt(parts[0],10)||1; const m=(parseInt(parts[1],10)||1)-1; const y=parseInt(parts[2],10)||1970; const [h,min] = (timeRaw||'00:00').split(':').map(n=>parseInt(n,10)||0); const dt = new Date(y,m,d,h,min); if (!isNaN(dt)) return dt.getTime(); } } const fallback = new Date(dateRaw); return isNaN(fallback) ? 0 : fallback.getTime(); }
function parseTimeValue(item){ const t = (item.appointment_time || '00:00').split(':'); const h = parseInt(t[0],10)||0; const m = parseInt(t[1],10)||0; return h*60 + m; }
arr.sort((a,b)=>{ let va,vb; if (field === 'appointment_date'){ va = parseDateValue(a); vb = parseDateValue(b); } else if (field === 'appointment_time'){ va = parseTimeValue(a); vb = parseTimeValue(b); } else if (field === 'title'){ va = (a.title||'').toLowerCase(); vb = (b.title||'').toLowerCase(); } else { va = a[field]; vb = b[field]; } if (va > vb) return dir; if (va < vb) return -dir; return 0; }); return arr; });

const page = ref(1); const perPage = 25; const totalPages = computed(()=> Math.max(1, Math.ceil(filteredAppointments.value.length / perPage))); const paginatedAppointments = computed(()=> { const start = (page.value-1)*perPage; return sortedAppointments.value.slice(start, start+perPage); });

const maxVisibleSlot = 2;
function openSlotList(date,hour){ viewMode.value='list'; filterDate.value = date; filterHour.value = hour; page.value =1; }
watch(filteredAppointments, ()=> { page.value = 1; });

function isToday(dateStr){ return dateStr === new Date().toISOString().split('T')[0]; }
function formatDate(dateStr){ if (!dateStr) return ''; return new Date(dateStr).toLocaleDateString('de-DE'); }
function formatDayDate(dateStr){ return new Date(dateStr).getDate(); }
function formatTime(timeStr){ if (!timeStr) return ''; return timeStr.substring(0,5); }

function getAppointmentsForSlot(date, hour){ return filteredAppointments.value.filter(apt=>{ let aptDate; if (typeof apt.appointment_date === 'string') aptDate = apt.appointment_date.split('T')[0]; else if (apt.appointment_date instanceof Date){ const d=apt.appointment_date; const year=d.getFullYear(); const month=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); aptDate = `${year}-${month}-${day}`; } else aptDate = String(apt.appointment_date); if (aptDate !== date) return false; const aptHour = parseInt(apt.appointment_time.split(':')[0]); return aptHour === hour; }); }
function getAppointmentsForDay(date){ return filteredAppointments.value.filter(apt=>{ let aptDate; if (typeof apt.appointment_date === 'string') aptDate = apt.appointment_date.split('T')[0]; else if (apt.appointment_date instanceof Date){ const d=apt.appointment_date; const year=d.getFullYear(); const month=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); aptDate = `${year}-${month}-${day}`; } else aptDate = String(apt.appointment_date); return aptDate === date; }); }

function getCategoryLabel(cat){ const labels = { behandlung: 'Behandlung', fuetterung: 'Fütterung', medikation: 'Medikation', reinigung: 'Reinigung', auswilderung: 'Auswilderung', kontrolle: 'Kontrolle', sonstiges: 'Sonstiges' }; return labels[cat] || cat; }
function getPriorityLabel(prio){ const labels = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch', dringend: 'Dringend' }; return labels[prio] || prio; }

function navigateDate(direction){ const d = new Date(currentDate.value); if (viewMode.value === 'week') d.setDate(d.getDate() + direction*7); else d.setMonth(d.getMonth() + direction); currentDate.value = d; fetchAppointments(); }
function goToToday(){ currentDate.value = new Date(); viewMode.value = 'week'; fetchAppointments(); }
function selectDayForDetails(date){ const [year,month,day] = date.split('-').map(Number); currentDate.value = new Date(year, month-1, day); viewMode.value = 'week'; }

function openAddModalForSlot(date,hour){ formData.value = getEmptyFormData(); formData.value.appointment_date = date; formData.value.appointment_time = `${hour.toString().padStart(2,'0')}:00`; showAddModal.value = true; }
function openEditModal(apt){ formData.value = { id: apt.id, title: apt.title, description: apt.description || '', appointment_date: apt.appointment_date, appointment_time: apt.appointment_time, end_time: apt.end_time || '', category: apt.category, priority: apt.priority, status: apt.status, patient_id: apt.patient_id || '', assigned_to: apt.assigned_to || '', recurring: apt.recurring, recurring_interval: apt.recurring_interval || 'woechentlich', notes: apt.notes || '' }; showEditModal.value = true; }
function closeModals(){ showAddModal.value = false; showEditModal.value = false; formData.value = getEmptyFormData(); }

async function showAppointmentBubble(event, apt){ event.stopPropagation(); const rect = event.currentTarget.getBoundingClientRect(); appointmentBubble.value = { visible: true, x: rect.left + rect.width/2, y: rect.bottom + 8, content: apt.description || apt.notes || '', id: apt.id }; await nextTick(); const b = bubbleRef.value; if (b && b.getBoundingClientRect){ const br = b.getBoundingClientRect(); let left = rect.left + rect.width/2 - br.width/2; let top = rect.bottom + 8; let placement = 'below'; if (top + br.height + 8 > window.innerHeight){ top = rect.top - br.height - 8; placement = 'above'; } left = Math.max(8, Math.min(left, window.innerWidth - br.width - 8)); appointmentBubble.value.x = left; appointmentBubble.value.y = Math.max(8, top); appointmentBubble.value.placement = placement; } await nextTick(); if (bubbleTextarea.value && bubbleTextarea.value.focus){ bubbleTextarea.value.focus(); try{ const len = bubbleTextarea.value.value.length; bubbleTextarea.value.setSelectionRange(len, len); }catch(e){} } }

function closeAppointmentBubble(){ if (bubbleSaveTimer){ clearTimeout(bubbleSaveTimer); bubbleSaveTimer = null; } saveAppointmentBubbleContent().catch(err => console.error(err)); appointmentBubble.value.visible = false; }

async function saveAppointmentBubbleContent(){ if (!appointmentBubble.value.id) return; try{ const apt = appointments.value.find(a => a.id === appointmentBubble.value.id); if (apt){ apt.description = appointmentBubble.value.content; const token = authStore.token || localStorage.getItem('token'); await fetch(`${API_BASE}/appointments/${apt.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ description: appointmentBubble.value.content }) }); } }catch(err){ console.error('Fehler beim Speichern der Termin-Details:', err); } }

function scheduleSaveAppointmentBubble(){ if (bubbleSaveTimer) clearTimeout(bubbleSaveTimer); bubbleSaveTimer = setTimeout(()=>{ saveAppointmentBubbleContent().catch(e=>console.error(e)); }, 700); }

async function deleteAppointmentFromBubble(id){ if (!confirm('Termin wirklich löschen?')) return; try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok){ appointmentBubble.value.visible = false; await fetchAppointments(); await fetchStats(); } }catch(err){ console.error(err); } }

function openEditFromBubble(){ const id = appointmentBubble.value && appointmentBubble.value.id; if (!id) return; const apt = appointments.value.find(a => String(a.id) === String(id)); if (!apt) return; openEditModal(apt); appointmentBubble.value.visible = false; }

async function fetchAppointments(){ loading.value = true; try{ const token = authStore.token || localStorage.getItem('token'); let url = `${API_BASE}/appointments`; if (viewMode.value === 'week') url += `?week=${weekDays.value[0].date}`; else if (viewMode.value === 'month'){ const year = currentDate.value.getFullYear(); const month = currentDate.value.getMonth() + 1; url += `?month=${month}&year=${year}`; } else if (viewMode.value === 'list') url += `?limit=10000`; console.debug('[Appointments] fetching', url, 'token?', !!token); const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }); console.debug('[Appointments] response status', res.status); if (res.ok){ const data = await res.json(); appointments.value = data || []; updateWeekScrollbar(); } else { const text = await res.text(); console.error('[Appointments] fetch failed:', res.status, text); appointments.value = []; updateWeekScrollbar(); } }catch(err){ console.error('Fehler beim Laden der Termine:', err); appointments.value = []; } finally { loading.value = false; } }

async function fetchStats(){ try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/appointments/stats/overview`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) stats.value = await res.json(); }catch(err){ console.error('Fehler beim Laden der Statistiken:', err); } }

async function fetchPatients(){ try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/patients?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok){ const data = await res.json(); patients.value = data.results || data; } }catch(err){ console.error('Fehler beim Laden der Patienten:', err); } }

async function fetchStaffUsers(){ try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/staff-users`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) staffUsers.value = await res.json(); }catch(err){ console.error('Fehler beim Laden der Mitarbeiter:', err); } }

async function createAppointment(){ try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/appointments`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData.value) }); if (res.ok){ closeModals(); fetchAppointments(); fetchStats(); } }catch(err){ console.error('Fehler beim Erstellen:', err); } }

async function updateAppointment(){ try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/appointments/${formData.value.id}`, { method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData.value) }); if (res.ok){ closeModals(); fetchAppointments(); fetchStats(); } }catch(err){ console.error('Fehler beim Aktualisieren:', err); } }

async function updateStatus(apt){ try{ const token = authStore.token || localStorage.getItem('token'); await fetch(`${API_BASE}/appointments/${apt.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(apt) }); fetchStats(); }catch(err){ console.error('Fehler beim Status-Update:', err); } }

async function deleteAppointment(id){ if (!confirm('Termin wirklich löschen?')) return; try{ const token = authStore.token || localStorage.getItem('token'); const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok){ fetchAppointments(); fetchStats(); } }catch(err){ console.error('Fehler beim Löschen:', err); } }

function exportCSV(){ const token = authStore.token || localStorage.getItem('token'); if (!token){ alert('Bitte anmelden um CSV-Export auszuführen.'); return; } const startDate = weekDays.value[0].date; const endDate = weekDays.value[6].date; fetch(`${API_BASE}/appointments/export/csv?start_date=${startDate}&end_date=${endDate}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(async res=>{ if (!res.ok){ const text = await res.text(); alert('Export fehlgeschlagen: ' + text); return; } const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `termine_${startDate}_to_${endDate}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }).catch(err=>{ console.error('Export Fehler', err); alert('Export fehlgeschlagen'); }); }

watch(viewMode, () => fetchAppointments());

onMounted(()=>{ fetchAppointments(); fetchStats(); fetchPatients(); fetchStaffUsers(); document.addEventListener('click', handleDocClick); updateWeekScrollbar(); window.addEventListener('resize', resizeHandler); });
onBeforeUnmount(()=>{ if (bubbleSaveTimer) clearTimeout(bubbleSaveTimer); document.removeEventListener('click', handleDocClick); window.removeEventListener('resize', resizeHandler); });

function handleDocClick(){ showCategoryDropdown.value = false; showStatusDropdown.value = false; showStaffDropdown.value = false; }

function getEmptyFormData(){ return { id: null, title: '', description: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '09:00', end_time: '', category: 'sonstiges', priority: 'mittel', status: 'geplant', patient_id: '', assigned_to: '', recurring: false, recurring_interval: 'woechentlich', notes: '' }; }

// Week header helpers (kept but today-overlay removed)
const weekBodyRef = ref(null); const weekHeaderRef = ref(null); const todayOverlay = ref(null); const resizeHandler = () => { updateWeekScrollbar(); };
function updateWeekScrollbar(){ nextTick(()=>{ const el = weekBodyRef.value; const wh = weekHeaderRef.value; if (!el || !wh) return; const scrollbar = el.offsetWidth - el.clientWidth; wh.style.setProperty('--week-scrollbar', `${scrollbar}px`); }); }

</script>

<style scoped>
/* keep Project wrapper styles from original Project.vue */
.project-wrapper {
  /* occupy full viewport without site chrome */
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding-bottom: 4rem; /* give pagination space from browser bottom */
  background: var(--bg-color, #fff);
}

/* Reset some global layout spacing to avoid the shifted look */
:root { --app-padding-top: 0px; }

/* Ensure inner appointments container uses full width */
.project-wrapper .appointments-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 1rem; box-sizing: border-box; }

/* --- Appointments styles (trimmed to essentials) --- */
.appointments-container { font-family: 'Helvetica', sans-serif; color: #0c4b47; display: flex; flex-direction: column; width: 100%; max-width: 100%; }
.appointments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.stats-cards { display:flex; gap:1rem; }
.stat-card { background:white; padding:1rem 1.5rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); text-align:center; min-width:80px; }
.header-actions { display:flex; gap:0.5rem; }
.btn-add { background:#0c4b47; color:white; border:none; padding:0.7rem 1.2rem; border-radius:8px; cursor:pointer; font-weight:bold; }
.btn-export { background:#f5f5f5; color:#0c4b47; border:1px solid #ddd; padding:0.7rem 1.2rem; border-radius:8px; cursor:pointer; }

/* Reuse list/week/month styles from Appointments component (kept minimal) */
.list-view { width:100%; overflow-x:hidden; padding-bottom:1rem; }
.appointments-table { width:100%; table-layout:fixed; margin:1rem 0; border-collapse:collapse; background:white; box-shadow:0 4px 16px rgba(0,0,0,0.08); border-radius:8px; }
.appointments-table th, .appointments-table td { padding:0.9rem 1rem; vertical-align:middle; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.appointments-table th.actions-col, .appointments-table td.actions { width:140px; min-width:140px; max-width:140px; text-align:center; }

.week-view { width:100%; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.08); border-radius:8px; overflow:hidden; }
.week-table { width:100%; border-collapse:collapse; table-layout:fixed; }
.time-col-header { width:100px; padding:1rem; background:#0c4b47; color:white; text-align:center; font-weight:700; }
.day-col { padding:1rem; text-align:center; font-weight:600; }
.day-col.today { background:#0a3f3b; }
.time-col { width:100px; padding:0.8rem 0.5rem; font-weight:600; background:#f9f9f9; text-align:center; }
.day-cell { padding:0.5rem; min-height:80px; height:80px; vertical-align:top; }

/* bubble/modal minimal */
.modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:10000; overflow-y:auto; }
.modal { background:white; padding:2rem; border-radius:12px; max-width:600px; width:90%; max-height:90vh; overflow-y:auto; position:relative; margin:2rem auto; }

</style>
