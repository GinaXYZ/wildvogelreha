<template>
  <div class="staff-menu">
    <button :class="{active: activeStaffTab === 'donations'}" @click="activeStaffTab = 'donations'">Spendenverwaltung</button>
    <button :class="{active: activeStaffTab === 'contacts'}" @click="activeStaffTab = 'contacts'" class="contacts-tab-btn">
      Kundenkontakte
      <span v-if="newContactsCount > 0" class="notification-badge">{{ newContactsCount }}</span>
    </button>
    <button :class="{active: activeStaffTab === 'patients'}" @click="activeStaffTab = 'patients'">Tier-/Patientenverwaltung</button>
    <button :class="{active: activeStaffTab === 'appointments'}" @click="activeStaffTab = 'appointments'">Terminverwaltung</button>
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
              <td class="actions-cell">
                <button @click="editContact(contact)" class="action-btn" title="Kontakt bearbeiten">✏️</button>
                <button @click="convertToPatient(contact)" class="action-btn" title="Als Patient anlegen">➕</button>
                <button @click="deleteContact(contact.id)" class="delete-btn" title="Kontakt löschen">🗑️</button>
              </td>
              <td class="message-cell">{{ contact.msg }}</td>
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
              <th>Aktionen</th>
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
              <td class="actions-column">
                <div class="actions-wrapper">
                  <button @click="editPatient(patient)" class="action-btn" title="Bearbeiten">✏️</button>
                  <button @click="addNewPatient()" class="action-btn" title="Neu">➕</button>
                </div>
              </td>
              <td>
                <textarea
                  v-model="patient.details"
                  class="details-input"
                  @blur="updatePatient(patient)"
                  rows="2"
                ></textarea>
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
    <!-- Terminverwaltung Tab -->
    <div v-else-if="activeStaffTab === 'appointments'">
      <h2>Terminverwaltung (IHK-Projekt)</h2>
      <Appointments />
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
import Appointments from './Appointments.vue';
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

// move allDonations here so computed properties that use it don't run before declaration
const allDonations = ref([]);
const fetchAllDonations = async () => {
  try {
    const token = authStore.token || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/donations/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Fehler beim Laden aller Spenden');
    const data = await res.json();
    allDonations.value = data || [];
  } catch (err) {
    console.error('fetchAllDonations error', err);
  }
};
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

// Edit contact (quick inline prompt) and persist full contact
const updateContact = async (contact) => {
  try {
    const token = authStore.token || localStorage.getItem('token');
    await fetch(`/api/contacts/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contact)
    });
  } catch (err) {
    alert('Fehler beim Speichern des Kontakts');
  }
};

const editContact = async (contact) => {
  // minimal quick editor: edit Nachricht; can be replaced by modal later
  const newMsg = prompt('Nachricht bearbeiten:', contact.msg || '');
  if (newMsg === null) return; // cancelled
  contact.msg = newMsg;
  await updateContact(contact);
};

const convertToPatient = async (contact) => {
  if (!confirm('Kontakt als neuen Patienten anlegen?')) return;
  try {
    const token = authStore.token || localStorage.getItem('token');
    const name = `${contact.firstname || ''} ${contact.lastname || ''}`.trim() || 'unbekannt';
    const body = {
      name: name,
      species: 'unbekannt',
      status: 'in Behandlung',
      admission_date: new Date().toISOString(),
      details: contact.msg || ''
    };
    const res = await fetch(`/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Fehler beim Anlegen des Patienten');
    // optionally refresh patients list and remove contact locally
    contacts.value = contacts.value.filter(c => c.id !== contact.id);
    fetchPatients();
  } catch (err) {
    alert(err.message || 'Fehler beim Anlegen des Patienten');
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

// New helper action handlers (UI only / simple placeholders)
const editPatient = (patient) => {
  // simple inline edit prompt for name as placeholder
  const newName = prompt('Name bearbeiten:', patient.name || '');
  if (newName !== null) {
    patient.name = newName;
    updatePatient(patient);
  }
};
const addNewPatient = () => {
  const name = prompt('Neuen Patienten anlegen - Name:');
  if (!name) return;
  const newP = { id: Date.now(), name, species: '', status: 'in Behandlung', admission_date: new Date().toISOString(), details: '' };
  patients.value.unshift(newP);
};
onMounted(() => {
  fetchAllDonations();
  fetchDonations();
  fetchContacts();
  fetchPatients();
});
</script>

<style scoped>
.patients-table {
  width: 100%; 
  border-collapse: collapse;
  margin-top: 1rem;
  word-break: keep-all;
  table-layout: auto;
}

/* default cell overflow handling: apply ellipsis only to data cells, not headers */
.contacts-table td,
.patients-table td,
.donations-table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* keep headers untruncated and always fully visible */
.contacts-table th,
.patients-table th,
.donations-table th {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

/* allow message/details column to wrap instead of being cut off */
.message-cell {
  white-space: normal;
  overflow-wrap: anywhere;
  text-overflow: unset;
}

.details-input {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;          /* responsive input */
  box-sizing: border-box;
  white-space: normal; /* allow wrapping in details */
  overflow-wrap: anywhere;
}

/* ensure actions column stays compact */
.contacts-table td:nth-child(6), .contacts-table th:nth-child(6) {
  white-space: nowrap;
  width: 80px;
}

/* smaller font for dense tables on large screens if needed */
@media (min-width: 1200px) {
  .contacts-table, .patients-table {
    font-size: 0.98rem;
  }
}
.contacts-table,
.patients-table,
.donations-table {
  width: 100%;
  max-width: 100%;
  table-layout: fixed; /* distribute columns and prevent extreme widths */
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
  background: transparent; /* removed gray background */
  padding: 2rem;
  border-radius: 0; /* remove rounded card look */
  overflow-x: auto;
  width: 90%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  display: flex; /* center child tables */
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

/* make tables retain white background but no outer gray card */
.contacts-table, .patients-table, .donations-table {
  background: #fff;
  border-radius: 8px;
}
.donations-table {
  width: 100%;
  max-width: 600px;
  border-collapse: collapse;
  text-align: center;
  margin: 0 auto;
  display: table;
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
  margin: 2rem auto 0 auto; /* keep centered */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px #0001;
  font-family: 'Helvetica', sans-serif;
  font-size: 1.08rem;
  overflow: hidden;
}

/* Make contacts/patients tables explicitly wider on large screens so headers are not clipped */
@media (min-width: 1200px) {
  .staff-content {
    overflow-x: visible; /* allow tables to extend beyond the gray area */
  }
  .contacts-table, .patients-table {
    min-width: 1600px; /* wider so headings fit without wrapping or ellipsis */
    margin-left: auto;
    margin-right: auto;
    table-layout: auto; /* allow columns to size to content */
  }
  .contacts-table th:nth-child(7), .contacts-table td:nth-child(7),
  .patients-table th:nth-child(6), .patients-table td.actions-column {
    width: 140px; /* reserve space for actions */
  }
}

/* On medium screens, still allow larger min-width but less extreme */
@media (min-width: 900px) and (max-width:1199px) {
  .contacts-table, .patients-table {
    min-width: 1200px;
    table-layout: auto;
  }
}

/* ensure message/details columns wrap */
.message-cell, .patients-table td:nth-child(7), .patients-table td:nth-child(7) textarea {
  white-space: normal;
  overflow-wrap: anywhere;
}

/* center tables on all screen sizes */
.contacts-table, .patients-table {
  margin-left: auto;
  margin-right: auto;
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

.subtab-container {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}

.subtab-container button {
  padding: 0.6rem 1.5rem;
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
  transition: background 0.2s, color 0.2s;
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
    padding: 0 0.5rem;
  }
  .staff-menu button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    flex: 1 1 auto;
    min-width: 0;
  }
  .staff-content {
    width: 100%;
    padding: 0.5rem;
    margin-top: 1rem;
    overflow-x: auto;
  }
  
  /* Responsive table wrapper */
  .contacts-table,
  .patients-table,
  .donations-table,
  .task-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
    max-width: 100%;
    font-size: 0.9rem;
  }
  
  .contacts-table th,
  .contacts-table td,
  .patients-table th,
  .patients-table td {
    padding: 0.5rem 0.3rem;
    font-size: 0.85rem;
    min-width: 70px;
  }
  
  /* Hide less important columns on mobile */
  .contacts-table th:nth-child(3),
  .contacts-table td:nth-child(3),
  .contacts-table th:nth-child(4),
  .contacts-table td:nth-child(4) {
    display: none;
  }
  
  .donations-table {
    width: 100%;
    max-width: 100%;
  }
  
  .donations-table th,
  .donations-table td {
    padding: 0.4rem;
    font-size: 0.9rem;
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
  
  /* Task form responsive */
  .task-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-form input {
    width: 100%;
    box-sizing: border-box;
  }
  
  .task-form button {
    width: 100%;
  }
  
  /* Subtab responsive */
  .subtab-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1.5rem;
  }
  
  .subtab-container button {
    margin-right: 0;
    flex: 1 1 auto;
    min-width: 100px;
    font-size: 0.85rem;
  }
  
  /* Staff form responsive */
  .staff-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .staff-form input {
    width: 100%;
    box-sizing: border-box;
  }
  
  .staff-form button {
    width: 100%;
    padding: 0.5rem;
  }
  
  /* Staff pool responsive */
  .staff-pool {
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .staff-item {
    padding: 0.4rem;
    font-size: 0.85rem;
  }
  
  /* Donation sums */
  .donation-sums {
    text-align: center;
    font-size: 0.95rem;
  }
  
  /* Status select smaller */
  .status-select {
    font-size: 0.8rem;
    padding: 0.3rem;
    min-width: 80px;
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
    padding: 0.6rem;
  }
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .donations-table {
    width: 100%;
  }
  
  /* Very small screen table handling */
  .contacts-table th,
  .contacts-table td,
  .patients-table th,
  .patients-table td {
    font-size: 0.8rem;
    padding: 0.3rem 0.2rem;
  }
  
  .status-select {
    font-size: 0.85rem;
    padding: 0.2rem 0.4rem;
  }
  
  /* Schedule table very small */
  .schedule-table {
    font-size: 0.65rem;
  }
  
  .time-header,
  .day-header,
  .time-cell {
    padding: 0.2rem;
    font-size: 0.65rem;
  }
  
  .schedule-cell {
    height: 40px;
  }
  
  .staff-assignment {
    font-size: 0.55rem;
    padding: 0.1rem;
  }
  
  .staff-name {
    font-size: 0.55rem;
  }
  
  .remove-assignment-btn,
  .remove-staff-btn {
    font-size: 0.6rem;
    padding: 0.1rem;
  }
}
</style>