<template>
  <div class="staff-menu">
    <button :class="{active: activeStaffTab === 'donations'}" @click="activeStaffTab = 'donations'">Spendenverwaltung</button>
    <button :class="{active: activeStaffTab === 'contacts'}" @click="activeStaffTab = 'contacts'" class="contacts-tab-btn">
      Kundenkontakte
      <span v-if="newContactsCount > 0" class="notification-badge">{{ newContactsCount }}</span>
    </button>
    <button :class="{active: activeStaffTab === 'patients'}" @click="activeStaffTab = 'patients'">Tier-/Patientenverwaltung</button>
    <button :class="{active: activeStaffTab === 'tasks'}" @click="activeStaffTab = 'tasks'">Aufgaben & Schichtplanung</button>
  </div>
  <div class="staff-content">
    <div v-if="activeStaffTab === 'donations'">
      <h2>Spendenverwaltung</h2>
      <div v-if="donationsLoading">Lade Spenden...</div>
      <div v-else-if="donationsError" class="error">{{ donationsError }}</div>
      <div v-else>
          <table class="donations-table">
          <thead>
            <tr>
              <th @click="sortBy('created_at')" class="sortable-header">
                Datum 
                <span class="sort-arrow">
                  {{ sortDirection === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
                <th @click="sortBy('donor_name')" class="sortable-header" style="position: relative;">
                  Name
                  <span class="sort-arrow">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                  <button
                    class="search-btn"
                    @click.stop="showSearchPopup($event)"
                    style="margin-left: 0.2rem;"
                    title="Nach Namen suchen"
                  >
                    🔍
                  </button>
                </th>
                <th @click="sortBy('amount')" class="sortable-header">
                  Betrag 
                  <span class="sort-arrow">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="donation in paginatedDonations" :key="donation.id">
              <td>{{ formatDate(donation.created_at) }}</td>
              <td>{{ donation.donor_name || 'Anonym' }}</td>
              <td>{{ (+donation.amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div 
            v-if="searchPopupVisible"
            class="search-popup"
            :style="{ top: popupY + 'px', left: popupX + 'px' }"
          >
            <input
              v-model="donationSearch"
              type="text"
              placeholder="Suchen"
              class="donation-search-input"
              autofocus
            />
            <button @click="closeSearchPopup" style="margin-left:0.5em;">✖</button>
          </div>
          <div class="pagination">
            <button @click="page--" :disabled="page === 1">Zurück</button>
            <span>Seite {{ page }}</span>
            <button @click="page++" :disabled="page * limit >= totalDonations">Weiter</button>
          </div>
        <div class="donation-sums">
          <p><strong>Gesamt:</strong> {{ totalSum.toFixed(2) }} € ({{ allDonations.length }} Spenden)</p>
          <p><em>Seite {{ page }} von {{ Math.ceil(totalDonations / limit) }}</em></p>
        </div>
      </div>
    </div>
    <div v-else-if="activeStaffTab === 'contacts'">
      <h2>Kundenkontakte Verwaltung</h2>
      <div v-if="contactsLoading" class="loading">Lade Kontakte...</div>
      <div v-else-if="contactsError" class="error">{{ contactsError }}</div>
      <div v-else>
        <table class="contacts-table">
          <thead>
            <tr>
              <th>Priorität</th>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Datum</th>
              <th>Aktionen</th>
              <th>Nachricht</th>
            </tr>
          </thead>
                    <tbody>
            <tr v-for="contact in contacts" :key="contact.id">
              <td class="priority-column-cell"> 
                <div class="status-content-wrapper"> 
                  <span :class="getStatusSquareClass(contact.status)" class="status-square"></span>
                  <select
                    v-model="contact.status"
                    @change="updateContactStatus(contact)"
                    class="status-select"
                    :class="{ 'notfall-status': contact.status === 'notfall' }"
                  >
                    <option value="neu">Neu</option>
                    <option value="notfall">Notfall</option>
                    <option value="niedrig">Niedrig</option>
                    <option value="Wichtig">Wichtig</option>
                    <option value="Mittel">Mittel</option>
                    <option value="fertig">Fertig</option>
                  </select>
                </div>
              </td>
              <td>{{ contact.firstname }} {{ contact.lastname }}</td>
              <td>{{ contact.email }}</td>
              <td>{{ contact.telefon }}</td>
              <td>{{ formatDate(contact.created_at) }}</td>
              <td>
                <button @click="deleteContact(contact.id)" class="delete-btn" title="Kontakt löschen">
                  🗑️
                </button>
              </td>
              <td>{{ contact.msg }}</td>
            </tr>
            <tr v-if="contacts.length === 0">
              <td colspan="7">Keine Kontakte gefunden.</td>
            </tr>
          </tbody>
        </table> 
        <div class="pagination">
          <button @click="contactsPage--" :disabled="contactsPage === 1">Zurück</button>
          <span>Seite {{ contactsPage }}</span>
          <button @click="contactsPage++" :disabled="contactsPage * contactsLimit >= totalContacts">Weiter</button>
        </div>
        <p><em>Seite {{ contactsPage }} von {{ Math.ceil(totalContacts / contactsLimit) }}</em></p>
      </div>
      </div>
    <div v-else-if="activeStaffTab === 'patients'">
      <h2>Tier-/Patientenverwaltung</h2>
      <div v-if="patientsLoading">Lade Patienten...</div>
      <div v-else-if="patientsError" class="error">{{ patientsError }}</div>
      <div v-else>
        <table class="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Tierart</th>
              <th>Status</th>
              <th>Aufnahmedatum</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.id">
              <td>{{ patient.id }}</td>
              <td>{{ patient.name }}</td>
              <td>{{ patient.species }}</td>
              <td>
                <select
                  v-model="patient.status"
                  class="status-select"
                  @change="updatePatient(patient)"
                >
                  <option value="in Behandlung">In Behandlung</option>
                  <option value="ausgewildert">Ausgewildert</option>
                  <option value="kritisch">Kritisch</option>
                  <option value="gesund">Gesund</option>
                  <option value="permanent">Permanent</option>
                  <option value="Adoption">Adoption</option>
                </select>
              </td>
              <td>{{ formatDate(patient.admission_date) }}</td>
              <td>
                <input
                  v-model="patient.details"
                  class="details-input"
                  style="width: 180px;"
                  @blur="updatePatient(patient)"
                />
              </td>
            </tr>
            <tr v-if="patients.length === 0">
              <td colspan="7">Keine Patienten gefunden.</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button @click="patientsPage--" :disabled="patientsPage === 1">Zurück</button>
          <span>Seite {{ patientsPage }}</span>
          <button @click="patientsPage++" :disabled="patientsPage * patientsLimit >= totalPatients">Weiter</button>
        </div>
        <p><em>Seite {{ patientsPage }} von {{ Math.ceil(totalPatients / patientsLimit) }}</em></p>
      </div>
    </div>
        <div v-else-if="activeStaffTab === 'tasks'">
          <div class="subtab-container">
            <button
              :class="{ active: activeTaskTab === 'aufgaben' }"
              @click="activeTaskTab = 'aufgaben'"
            >Aufgaben</button>
            <button
              :class="{ active: activeTaskTab === 'schicht' }"
              @click="activeTaskTab = 'schicht'"
            >Schichtplanung</button>
          </div>
          <div v-if="activeTaskTab === 'aufgaben'">
            <h3>Aufgaben</h3>
          <div class="task-form">
            <input v-model="newTask" placeholder="Neue Aufgabe..." />
            <button @click="addTask">Hinzufügen</button>
          </div>
          <table class="task-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Aufgabe</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, index) in tasks" :key="index">
                <td>
                  <input type="checkbox" v-model="task.done" />
                </td>
                <td>
                  <span :class="{ 'task-done': task.done }">{{ task.text }}</span>
                </td>
                <td>
                  <button @click="removeTask(index)">❌</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div v-else-if="activeTaskTab === 'schicht'" class="schedule-section">
        <h3>Schichtplanung</h3>
        <div class="staff-management">
          <h4>Mitarbeiter verwalten</h4>
          <button @click="showStaffForm = true" class="btn-add-staff">+ Neuer Mitarbeiter</button>
          <div v-if="showStaffForm" class="staff-form">
          <input v-model="newStaffMember.name" placeholder="Name" />
          <input v-model="newStaffMember.role" placeholder="Rolle" />
          <button @click="addStaffMember">Speichern</button>
          <button @click="showStaffForm = false">Abbrechen</button>
        </div>
        <div class="staff-pool">
          <div v-for="staff in staffMembers" :key="staff.id" 
              class="staff-item draggable"
              @mousedown="onDragStart($event, staff)"
              :style="{ cursor: isAdmin ? 'grab' : 'default' }">
            <span>{{ shortName(staff.name) }}</span>
            <button class="remove-assignment-btn"
                @click.stop="removeStaffMember(staff.id)"
                title="Mitarbeiter löschen">✕</button>
        </div>
        </div>
        </div>
 <div class="week-calendar">
  <table class="schedule-table">
    <thead>
      <tr>
        <th class="time-header">Zeit</th>
        <th v-for="day in weekDays" :key="day" class="day-header">
          {{ day }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="timeSlot in timeSlots" :key="timeSlot" class="time-row">
        <td class="time-cell">{{ timeSlot }}</td>
        <td v-for="day in weekDays" :key="day"
            class="schedule-cell"
            :data-day="day"
            :data-time="timeSlot">
          <div v-for="assignment in getScheduleForCell(day, timeSlot)"
               :key="assignment.id"
               class="staff-assignment"
               @mousedown="onDragStart($event, assignment.staff)">
            <span class="staff-name">{{ shortName(assignment.staff.name) }}</span>
            <button v-if="isAdmin"
                    @click="removeAssignment(assignment.id)"
                    @mousedown.stop
                    class="remove-staff-btn"
                    title="x">
              ✕
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</div>
</div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from './auth.js';
const API_BASE = '/api';
const authStore = useAuthStore();
const staffMembers = ref([]);
const showStaffForm = ref(false);
const newStaffMember = ref({
  name: '',
  role: 'staff',
})
let dragItem = null;
let offset = { x: 0, y: 0};
const isAdmin = computed(() => {
  return authStore.user?.role === 'admin';
});
const activeStaffTab = ref('donations');
const activeTaskTab = ref('aufgaben');
const weekDays = ref(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
const timeSlots = ref(['06:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00', '00:00 - 06:00']);
const weekSchedule = ref([]);
const donations = ref([]);
const donationsLoading = ref(false);
const donationsError = ref(null);
const contacts = ref([]);
const contactsLoading = ref(false);
const contactsError = ref(null);
const tasks = ref([]);
const newTask = ref('');
function addTask() {
  if (newTask.value.trim() === '') return;
  tasks.value.push({ text: newTask.value, done: false });
  newTask.value = '';
}
const shifts = ref([]);
const newShift = ref({ date: '', time: '', staff: '' });
function addShift() {
  if (!newShift.value.date || !newShift.value.time || !newShift.value.staff) return;
  shifts.value.push({ ...newShift.value });
  newShift.value = { date: '', time: '', staff: '' };
}
function removeShift(index) {
  shifts.value.splice(index, 1);
}
const patients = ref([]);
const patientsLoading = ref(false);
const patientsError = ref(null);
const totalDonations = ref(0);
const newContactsCount = computed(() => {
  if (contacts.value && contacts.value.length > 0) {
    const filtered = contacts.value.filter(contact => contact.status === 'neu');
    return filtered.length;
  }
  return 0;
});
function removeTask(index) {
  tasks.value.splice(index, 1);
}
const patientsPage = ref(1);
const patientsLimit = 20;
const totalPatients = ref(0);
const sortField = ref('created_at');
const sortDirection = ref('desc');
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

function onDrag(e) {
  if (!dragItem || !isAdmin.value) return;
  e.preventDefault();
  
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const cell = elements.find(el => el.classList.contains('schedule-cell'));
  
  document.querySelectorAll('.schedule-cell').forEach(c => {
    c.classList.remove('drag-hover');
  });

  if (cell) {
    cell.classList.add('drag-hover');
  }
}
  
function onDragStart(e, staff) {
  if (!isAdmin.value) return;
  e.preventDefault();
  e.stopPropagation();

  dragItem = staff;
  const rect = e.target.getBoundingClientRect();
  offset.x = e.clientX - rect.left;
  offset.y = e.clientY - rect.top;
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'grabbing';
}

function onDragEnd(e) {
  if (!dragItem || !isAdmin.value) {
    dragItem = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    return;
  }

  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const cell = elements.find(el => el.classList.contains('schedule-cell'));

  if (cell) {
    const day = cell.dataset.day;
    const timeSlot = cell.dataset.time;

    if (day && timeSlot) {
      const alreadyAssigned = weekSchedule.value.some(
        a => a.staff.id === dragItem.id && a.day === day && a.timeSlot === timeSlot
    );
       if (!alreadyAssigned) {
        const assignment = {
          id: `${dragItem.id}-${day}-${timeSlot}-${Date.now()}`,
          staff: dragItem,
          day: day,
          timeSlot: timeSlot,
          x: 50,
          y: 50
        };
      weekSchedule.value.push(assignment);
      localStorage.setItem('weekSchedule', JSON.stringify(weekSchedule.value));
      }
    }
  }
  document.querySelectorAll('.schedule-cell').forEach(c => {
    c.classList.remove('drag-hover');
  });

  dragItem = null;
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
}

const donationSearch = ref('');
const searchPopupVisible = ref(false);
const popupX = ref(0);
const popupY = ref(0);

function showSearchPopup(event) {
  searchPopupVisible.value = true;
  popupX.value = event.clientX;
  popupY.value = event.clientY;
}
function closeSearchPopup() {
  searchPopupVisible.value = false;
  donationSearch.value = '';
}
const paginatedDonations = computed(() => {
  const start = (page.value - 1) * limit;
  return sortedDonations.value.slice(start, start + limit);
});
const sortedDonations = computed(() => {
  let filtered = [...allDonations.value];
  if (donationSearch.value.trim()) {
    filtered = filtered.filter(d =>
      (d.donor_name || '').toLowerCase().includes(donationSearch.value.trim().toLowerCase())
    );
  }
  return filtered.sort((a, b) => {
    let aVal = a[sortField.value];
    let bVal = b[sortField.value];

    if (sortField.value === 'amount') {
      aVal = Number(String(aVal).replace(',', '.'));
      bVal = Number(String(bVal).replace(',', '.'));
    } else if (sortField.value === 'created_at') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
      if (isNaN(aVal)) aVal = new Date(0);
      if (isNaN(bVal)) bVal = new Date(0);
    } else if (sortField.value === 'donor_name') {
      aVal = (aVal || '').toLowerCase();
      bVal = (bVal || '').toLowerCase();
    } else {
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
    }

    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});
const fetchPatients = async () => {
  patientsLoading.value = true;
  patientsError.value = null;
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    const res = await fetch(`/api/patients?page=${patientsPage.value}&limit=${patientsLimit}`, {
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });
    if (!res.ok) throw new Error('Fehler beim Laden der Patienten');
    const data = await res.json();
    patients.value = data.results || [];
    totalPatients.value = data.count || 0;
  } catch (err) {
    patientsError.value = err.message;
  } finally {
    patientsLoading.value = false;
  }
};
watch(patientsPage, fetchPatients);
function getScheduleForCell(day, timeSlot) {
  return weekSchedule.value.filter(
    assignment => assignment.day === day && assignment.timeSlot === timeSlot
  );
}

const updatePatient = async (patient) => {
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    await fetch(`/api/patients/${patient.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        status: patient.status,
        details: patient.details
      }),
    });
  } catch (err) {
    alert('Fehler beim Speichern der Patientendaten');
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

const totalSum = computed(() =>
  allDonations.value.reduce((sum, d) => sum + Number(d.amount), 0)
);

const monthSum = computed(() => {
  const now = new Date();
  return donations.value
    .filter(d => {
      const date = new Date(d.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + Number(d.amount), 0);
});

const page = ref(1);
const limit = 20;

const fetchDonations = async () => {
  donationsLoading.value = true;
  donationsError.value = null;
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`/api/donations?page=${page.value}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });
    if (!res.ok) throw new Error('Fehler beim Laden der Spenden');
    const data = await res.json();
    donations.value = data.results;
    totalDonations.value = allDonations.value.length;
  } catch (err) {
    donationsError.value = err.message;
  } finally {
    donationsLoading.value = false;
  }
};
  watch(page, fetchDonations);
const contactsPage = ref(1);
const contactsLimit = 20;
const totalContacts = ref(0);

const fetchContacts = async () => {
  contactsLoading.value = true;
  contactsError.value = null;
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    const res = await fetch(`/api/contacts?page=${contactsPage.value}&limit=${contactsLimit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Fehler beim Laden der Kontakte');
    const data = await res.json();
    contacts.value = data.results || [];
    totalContacts.value = data.count || 0;
  } catch (err) {
    contactsError.value = err.message;
  } finally {
    contactsLoading.value = false;
  }
};
watch(contactsPage, fetchContacts);
const getStatusSquareClass = (status) => {
  const baseClass = 'status-square';
  switch (status) {
    case 'neu':
      return `${baseClass} yellow`; 
    case 'notfall':
      return `${baseClass} red`;   
    case 'niedrig':
      return `${baseClass} green`; 
    case 'Wichtig':
      return `${baseClass} orange`; 
    case 'Mittel': 
      return `${baseClass} yellow`; 
    case 'fertig':
      return `${baseClass} black`;  
    default:
      return baseClass;
  }
};
const updateContactStatus = async (contact) => {
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    const response = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ status: contact.status })
    });
  } catch (err) {
    alert('Fehler beim Aktualisieren des Status');
  }
};

const deleteContact = async (id) => {
  if (!confirm('Kontakt wirklich löschen?')) return;
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    const response = await fetch(`/api/contacts/${id}`, { 
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      contacts.value = contacts.value.filter(c => c.id !== id);
    }
  } catch (err) {
    alert('Fehler beim Löschen')
  }
};
function removeAssignment(assignmentId) {
  const index = weekSchedule.value.findIndex(a => a.id === assignmentId);
  if (index >= 0) {
    weekSchedule.value.splice(index, 1);
    localStorage.setItem('weekSchedule', JSON.stringify(weekSchedule.value));
    }
}
const allDonations = ref([]);
const fetchAllDonations = async () => {
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    const res = await fetch(`${API_BASE}/donations/all`, {
      headers: {
        'Authorization': `Bearer ${token}` 
            }});
                if (!res.ok) throw new Error('Fehler beim Laden aller Spenden');
    const data = await res.json();
    allDonations.value = data || [];
  } catch (err) {
  }
};
onMounted(() => {
  fetchAllDonations();
  fetchDonations();
  fetchContacts();
  fetchPatients();

const totalSum = computed(() => {
  return allDonations.value.reduce((sum, d) => sum + Number(d.amount), 0);
});
  const monthSum = computed(() => {
    const now = new Date();
    return allDonations.value
      .filter(d => {
        const date = new Date(d.created_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + Number(d.amount), 0);
  });
document.addEventListener('mousemove', onDrag);
document.addEventListener('mouseup', onDragEnd);

const storedSchedule = localStorage.getItem('weekSchedule');
  if (storedSchedule) {
    weekSchedule.value = JSON.parse(storedSchedule);
  }

  const storedShifts = localStorage.getItem('shifts');
  if (storedShifts) {
    shifts.value = JSON.parse(storedShifts);
  } else {
    shifts.value = [];
  }
const stored = localStorage.getItem('staffMembers');
  if (stored) {
    staffMembers.value = JSON.parse(stored);
  } else {
    staffMembers.value = [
      { id: 1, name: 'Max Mustermann', role: 'Tierarzt' },
      { id: 2, name: 'Erika Musterfrau', role: 'Pflegekraft'},
      { id: 3, name: 'Hans Müller', role: 'Verwaltung'}
    ];
  }

if (staffMembers.value.length === 0) {
  staffMembers.value = [
    { id: 1, name: 'Max Mustermann', role: 'Tierarzt' },
    { id: 2, name: 'Erika Musterfrau', role: 'Pflegekraft'},
    { id: 3, name: 'Hans Müller', role: 'Verwaltung'}
  ];
}
  tasks.value = [
    { text: 'Tierarzttermin planen', done: false },
    { text: 'Medikamente bestellen', done: false },
    { text: 'Rechnungen prüfen', done: true }
  ];
});
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
  });
  const addStaffMember = () => {
  if (!newStaffMember.value.name.trim()) return;
  staffMembers.value.push({
    id: Date.now(),
    name: newStaffMember.value.name,
    role: newStaffMember.value.role,
  });
  localStorage.setItem('staffMembers', JSON.stringify(staffMembers.value));
  showStaffForm.value = false;
  newStaffMember.value = { name: '', role: 'staff'};
};
function removeStaffMember(id) {
  staffMembers.value = staffMembers.value.filter(s => s.id !== id);
  weekSchedule.value = weekSchedule.value.filter(a => a.staff.id !== id);
  localStorage.setItem('staffMembers', JSON.stringify(staffMembers.value));
  localStorage.setItem('weekSchedule', JSON.stringify(weekSchedule.value));
}
function shortName(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts [0];
  return `${parts[0]} ${parts[1][0]}.`;
}
</script>

<style scoped>
.details-input {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.patients-table {
  width: 100%; 
  border-collapse: collapse;
  margin-top: 1rem;
  word-break: keep-all;
  table-layout: auto;
}
.patients-table th:nth-child(4), 
.patients-table td:nth-child(4) {
  min-width: 160px;
}
.patients-table th, .patients-table td {
  border: 1px solid #ccc;
  padding: 0.75rem; 
  text-align: center;
  vertical-align: center; 
  word-break: keep-all;
}

.patients-table th {
  background: #eee;
  font-weight: bold;
}

.contacts-table tr:nth-child(even) {
  background: #fafcfd;
}

.contacts-table tr:hover {
  background: #f1f7f6;
}
.status-square {
  width: 16px;
  height: 16px;
  border: 1px solid #000000;
  margin-right: 0.2em;
  flex-shrink: 0;
}
.staff-menu button.contacts-tab-btn {
  position: relative; 
}
.notification-badge {
  position: absolute;
  top: -8px; 
  right: -8px;
  background-color: red;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 0.15rem 0.4rem; 
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  line-height: 1; 
  z-index: 10;
}
.staff-menu {
  display: flex;
  gap: 1rem;
  margin-bottom: -1rem;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  justify-content: center;
  z-index: 1000;
}
.staff-menu button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  background: #eee;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;

}
.staff-menu button.active {
  background: #0c4b47;
  color: #fff;
}
.staff-menu button:hover {
  border-color: #0c4b47;
  transform: translateY(-2px);
}
.staff-content {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  overflow-x: auto;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  display: block;
}
.donations-table {
  width: 50%;
  border-collapse: collapse;
  align-items: center;
  text-align: center;
  display: block;
  margin: 0 auto;
}
@media (max-width: 800px) {
  .donations-table {
    width: 100%;
    min-width: 320px;
    font-size: 0.95rem;
  }
  .staff-content {
    padding: 0.5rem;
  }
}
.donations-table th, .donations-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
  word-break: none;
  
}
.status-content-wrapper {
  display: inline-flex;  
  align-items: center;     
  justify-content: center; 
  gap: 0.5em;             
  width: 100%;            
}
.donations-table th {
  background: #eee;
}
.error {
  color: red;
  margin: 1rem 0;
}
.donation-sums {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 80px; 
  margin-top: 1.5rem;
  font-size: 1.1em;
}
.donation-sums p {
  margin: 0.2em 0;
}
.pagination {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  height: 50px;
}
.pagination-btn {
  background: #f3f3f3;
  color: #0c4b47;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  min-width: 80px; 
  height: 40px; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination-btn:hover:not(.disabled) {
  scale: 1.2;
}
.pagination-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 300px;
  justify-content: center;
}
.page-btn {
  background: white;
  color: #0c4b47;
  border: none;
  width: 40px;
  height: 40px; 
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
}
.page-btn:hover {
  scale: 1.05;
}
.page-btn.active {
  background: #0c4b47;
  color: white;
}
.dots {
  color: #666;
  font-weight: bold;
  margin: 0 0.5rem;
  width: 20px;
}
.contacts-table {
  width: 96%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 2rem auto 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px #0001;
  font-family: 'Helvetica', sans-serif;
  font-size: 1.08rem;
  overflow: hidden;
}
.contacts-table th, .contacts-table td {
  padding: 1rem 0.5rem;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}
.contacts-table td.priority-column-cell,
.contacts-table th.priority-column-cell { 
  min-width: 160px;
  width: 170px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.contacts-table th {
  background: #f7fafb;
  color: #0c4b47;
  font-weight: 600;
  font-size: 1.08rem;
  border-bottom: 1px solid #e0e0e0;
  letter-spacing: 0.02em;
}
.contacts-stats {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}
.status-select {
  width: 100%;
  padding: 0.25rem 0.7rem;
  border: none;
  border-radius: 8px;
  background: #f3f3f3;
  font-size: 1rem;
  margin-left: 0.2em;
  flex-grow: 1; 
  color: #0c4b47;
  word-break: keep-all;
  font-family: 'Helvetica', sans-serif;
}
.status-select.option {
  color: #0c4b47;
  background-color: #ffffff;
  word-break: keep-all;
  text-align: center;
}
.status-select:focus {
  outline: 2px solid #0c4b47;
}
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  margin: 0 auto;
  transition: transform 0.15s, color 0.2s;
  color: #0c4b47;
}
@media (max-width: 900px) {
  .contacts-table {
    font-size: 0.97rem;
    width: 100%;
  }
  .contacts-table th, .contacts-table td {
    padding: 0.7rem 0.2rem;
  }
}
.contacts-table td:nth-child(6) {
  text-align: center;
  vertical-align: middle;
}
.contacts-table tr:last-child td {
  border-bottom: none;
}
.contacts-table td.status-cell, .contacts-table th.status-cell {
  min-width: 160px;
  width: 170px;
  padding-left: 1rem;
  padding-right: 1rem;
}
.delete-btn:hover {
  transform: scale(1.18);
  color: #e53935;
  background: #f9f9f9;
}
.cart-icon-container {
  position: relative;
}
.cart-icon {
  display: flex;
  align-items: center;
  position: relative;
}
.cart-count {
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: red;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
}
.status-square.green {
  background: #4caf50;
}
.status-square.red {
  background: #e53935;
}
.status-square.orange {
  background: #66b5ff;
}
.status-square.yellow {
  background: #afff02;
}
.status-square.black {
  background: #000000;
}
.schedule-section {
  margin-top: 1rem;
}

.staff-management {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.staff-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px dashed #ccc;
}

.staff-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #0c4b47;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.staff-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-add-staff {
  background: #0c4b47;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.week-calendar {
  background: white;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.time-header {
  background: #0c4b47;
  color: white;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
  width: 70px;
  font-size: 0.9rem;
}

.day-header {
  background: #0c4b47;
  color: white;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
}

.time-cell {
  background: #f5f5f5;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
  border: 1px solid #ddd;
  width: 70px;
  font-size: 0.85rem;
  vertical-align: middle;
}

.schedule-cell {
  height: 70px;
  border: 1px solid #ddd;
  background: #fafafa;
  vertical-align: middle;
  text-align: center;
  position: relative;
  padding: 0;
}

.schedule-cell.drag-hover {
  background: #e8f5e8 !important;
  border-color: #0c4b47 !important;
  border-width: 2px !important;
}

.staff-assignment {
  display: flex;
  align-items: center;
  text-align:center;
  justify-content: center;
  color: #0c4b47;
  background: transparent;
  padding: 0.2rem;
  font-size: 0.7rem;
  word-break: keep-all;
  cursor: grab;
  user-select: none;
  min-width: 100%;
  max-width: 100%;
  z-index: 10;
}

.staff-name {
  font-size: 0.7rem;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-assignment-btn {
  border: 1px solid #0c4b47;
  color: #0c4b47;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-left: 0.2rem;
}

.remove-assignment-btn:hover {
  transform: scale(1.1);
}
.subtab-container button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  color: #444747;
  font-family: 'Helvetica', sans-serif;
  background: #eee;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
  margin-right: 1rem;
  color: #0c4b47;
}

.subtab-container button.active {
  background: #0c4b47;
  color: #fff;
}

.subtab-container button:hover {
  transform: translateY(-2px);
  font-weight: bold;
}
.remove-staff-btn {
  border: 1px solid #0c4b47;
  color: #0c4b47;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-left: 0.2rem;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0001;
}
.task-table th, .task-table td {
  border: 1px solid #eee;
  padding: 0.7rem 0.5rem;
  text-align: left;
}
.task-table th {
  background: #f7fafb;
  color: #0c4b47;
  font-weight: 600;
}
.task-done {
  text-decoration: line-through;
  color: #888;
}
.sort-arrow:hover {
  cursor: pointer;
}
.search-popup {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  padding: 0.7em 1em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 99999;
  font-size: 1em;
  color: #0c4b47;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.donation-search-input {
  border-radius: 6px;
  border: 1px solid #ccc;
  padding: 0.2em 0.5em;
  font-size: 1em;
}
.search-btn {
  border: none;
  cursor: pointer;
  font-weight: bold;
}

/* Responsive Styles for Staff Component */
@media (max-width: 1024px) {
  .staff-content {
    width: 95%;
    padding: 1rem;
  }
  .contacts-table,
  .patients-table,
  .donations-table {
    font-size: 0.95rem;
  }
  .schedule-table {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .staff-menu {
    gap: 0.5rem;
  }
  .staff-menu button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  .staff-content {
    width: 100%;
    padding: 0.5rem;
  }
  .contacts-table,
  .patients-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  .contacts-table th,
  .contacts-table td,
  .patients-table th,
  .patients-table td {
    padding: 0.5rem 0.3rem;
    font-size: 0.85rem;
  }
  .week-calendar {
    max-width: 100%;
  }
  .schedule-table {
    font-size: 0.75rem;
  }
  .time-header,
  .day-header {
    padding: 0.3rem;
    font-size: 0.75rem;
  }
  .schedule-cell {
    height: 50px;
  }
  .staff-assignment {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  .staff-menu {
    flex-direction: column;
    align-items: stretch;
  }
  .staff-menu button {
    width: 100%;
    text-align: center;
  }
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .donations-table {
    width: 100%;
  }
}
</style>