<template>
  <div class="staff-root">
  <div class="staff-menu">
    <button :class="{active: activeStaffTab === 'donations'}" @click="activeStaffTab = 'donations'">Spendenverwaltung</button>
    <button :class="{active: activeStaffTab === 'contacts'}" @click="activeStaffTab = 'contacts'" class="contacts-tab-btn">
      Kundenkontakte
      <span v-if="newContactsCount > 0" class="notification-badge">{{ newContactsCount }}</span>
    </button>
    <button :class="{active: activeStaffTab === 'patients'}" @click="activeStaffTab = 'patients'">Tier-/Patientenverwaltung</button>
    <button :class="{active: activeStaffTab === 'appointments'}" @click="activeStaffTab = 'appointments'">Terminverwaltung</button>
    <button :class="{active: activeStaffTab === 'schicht'}" @click="activeStaffTab = 'schicht'">Schichtplanung</button>
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
                  <th>
                    Name
                    <button class="search-btn" @click.stop="showContactsSearchPopup($event)" title="Nach Kontakten suchen" style="margin-left:0.4rem;">🔍</button>
                  </th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Datum</th>
              <th>Aktionen</th>
              <th>Nachricht</th>
            </tr>
          </thead>
                    <tbody>
                <tr v-for="contact in contactsDisplayed" :key="contact.id">
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
      <div 
        v-if="contactsSearchPopupVisible"
        class="search-popup"
        :style="{ top: contactsPopupY + 'px', left: contactsPopupX + 'px' }"
      >
        <input v-model="contactsSearch" type="text" placeholder="Kontakte suchen" class="donation-search-input" autofocus />
        <button @click="closeContactsSearchPopup" style="margin-left:0.5em;">✖</button>
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
              <th>
                Name
                <button class="search-btn" @click.stop="showPatientsSearchPopup($event)" title="Nach Patienten suchen" style="margin-left:0.4rem;">🔍</button>
              </th>
              <th>Tierart</th>
              <th>Status</th>
              <th>Aufnahmedatum</th>
              <th>Aktionen</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patientsDisplayed" :key="patient.id">
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
        <div v-else-if="activeStaffTab === 'schicht'" class="schedule-section">
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

// Contacts search state
const contactsSearch = ref('');
const contactsSearchPopupVisible = ref(false);
const contactsPopupX = ref(0);
const contactsPopupY = ref(0);

// Patients search state
const patientsSearch = ref('');
const patientsSearchPopupVisible = ref(false);
const patientsPopupX = ref(0);
const patientsPopupY = ref(0);

function showSearchPopup(event) {
  searchPopupVisible.value = true;
  popupX.value = event.clientX;
  popupY.value = event.clientY;
}
function closeSearchPopup() {
  searchPopupVisible.value = false;
  donationSearch.value = '';
}

function showContactsSearchPopup(event) {
  contactsSearchPopupVisible.value = true;
  contactsPopupX.value = event.clientX;
  contactsPopupY.value = event.clientY;
}
function closeContactsSearchPopup() {
  contactsSearchPopupVisible.value = false;
  contactsSearch.value = '';
}

function showPatientsSearchPopup(event) {
  patientsSearchPopupVisible.value = true;
  patientsPopupX.value = event.clientX;
  patientsPopupY.value = event.clientY;
}
function closePatientsSearchPopup() {
  patientsSearchPopupVisible.value = false;
  patientsSearch.value = '';
}
const paginatedDonations = computed(() => {
  const start = (page.value - 1) * limit;
  return sortedDonations.value.slice(start, start + limit);
});

// Filtered views for contacts and patients (searchable)
const contactsDisplayed = computed(() => {
  if (!contactsSearch.value || !contacts.value) return contacts.value || [];
  const q = contactsSearch.value.trim().toLowerCase();
  return (contacts.value || []).filter(c => {
    return (
      (c.firstname || '').toLowerCase().includes(q) ||
      (c.lastname || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.telefon || '').toLowerCase().includes(q) ||
      (c.msg || '').toLowerCase().includes(q)
    );
  });
});

const patientsDisplayed = computed(() => {
  if (!patientsSearch.value || !patients.value) return patients.value || [];
  const q = patientsSearch.value.trim().toLowerCase();
  return (patients.value || []).filter(p => {
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.species || '').toLowerCase().includes(q) ||
      (p.details || '').toLowerCase().includes(q)
    );
  });
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

// === Schichtplanung Funktionen ===
const shortName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0]}.`;
  }
  return name;
};

const addStaffMember = () => {
  if (!newStaffMember.value.name.trim()) return;
  const member = {
    id: Date.now(),
    name: newStaffMember.value.name,
    role: newStaffMember.value.role || 'staff'
  };
  staffMembers.value.push(member);
  localStorage.setItem('staffMembers', JSON.stringify(staffMembers.value));
  newStaffMember.value = { name: '', role: 'staff' };
  showStaffForm.value = false;
};

const removeStaffMember = (id) => {
  if (!confirm('Mitarbeiter wirklich löschen?')) return;
  staffMembers.value = staffMembers.value.filter(m => m.id !== id);
  weekSchedule.value = weekSchedule.value.filter(a => a.staff.id !== id);
  localStorage.setItem('staffMembers', JSON.stringify(staffMembers.value));
  localStorage.setItem('weekSchedule', JSON.stringify(weekSchedule.value));
};

const removeAssignment = (assignmentId) => {
  weekSchedule.value = weekSchedule.value.filter(a => a.id !== assignmentId);
  localStorage.setItem('weekSchedule', JSON.stringify(weekSchedule.value));
};

const loadScheduleData = () => {
  const savedStaff = localStorage.getItem('staffMembers');
  const savedSchedule = localStorage.getItem('weekSchedule');
  if (savedStaff) {
    staffMembers.value = JSON.parse(savedStaff);
  }
  if (savedSchedule) {
    weekSchedule.value = JSON.parse(savedSchedule);
  }
};

onMounted(() => {
  fetchAllDonations();
  fetchDonations();
  fetchContacts();
  fetchPatients();
  loadScheduleData();
  
  // Add global event listeners for drag and drop
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', onDragEnd);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', onDragEnd);
});
</script>

<style scoped>
/* === Modern Table Styles === */
.patients-table,
.contacts-table,
.donations-table {
  width: 100%;
  max-width: 1400px;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  table-layout: auto;
}

.patients-table th,
.contacts-table th,
.donations-table th {
  background: linear-gradient(135deg, #0c4b47 0%, #157a74 100%);
  color: white;
  padding: 1rem 0.8rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border-bottom: none;
}

.patients-table td,
.contacts-table td,
.donations-table td {
  padding: 0.9rem 0.8rem;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  color: #333;
  font-size: 0.95rem;
}

.patients-table tbody tr,
.contacts-table tbody tr,
.donations-table tbody tr {
  transition: background 0.2s;
}

.patients-table tbody tr:hover,
.contacts-table tbody tr:hover,
.donations-table tbody tr:hover {
  background: #f8fffe;
}

.patients-table tbody tr:last-child td,
.contacts-table tbody tr:last-child td,
.donations-table tbody tr:last-child td {
  border-bottom: none;
}

/* Allow message/details column to wrap */
.message-cell {
  white-space: normal;
  overflow-wrap: anywhere;
  max-width: 250px;
}

.details-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  white-space: normal;
  overflow-wrap: anywhere;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 50px;
}

.details-input:focus {
  outline: none;
  border-color: #0c4b47;
  box-shadow: 0 0 0 2px rgba(12, 75, 71, 0.1);
}

/* Actions column */
.actions-cell,
.actions-column {
  white-space: nowrap;
  width: 100px;
}

.actions-wrapper {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.action-btn {
  background: #e3f2fd;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: transform 0.2s, background 0.2s;
}

.action-btn:hover {
  background: #bbdefb;
  transform: scale(1.1);
}

.patients-table th {
  background: #eee;
  font-weight: bold;
}

.contacts-table tr:nth-child(even) {
  background: #fafcfd;
}

/* Status select styling */
.status-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
  cursor: pointer;
  min-width: 100px;
}

.status-select:focus {
  outline: none;
  border-color: #0c4b47;
}

/* Status square indicator */
.status-content-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-square {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.status-square.yellow { background: #ffc107; }
.status-square.red { background: #e53935; }
.status-square.green { background: #4caf50; }
.status-square.orange { background: #ff9800; }
.status-square.black { background: #333; }

/* Priority column cell */
.priority-column-cell {
  min-width: 140px;
}

/* Sortable header styling */
.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.sortable-header:hover {
  background: rgba(255,255,255,0.1);
}

.sort-arrow {
  margin-left: 0.3rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.search-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.search-btn:hover {
  background: rgba(255,255,255,0.4);
}

.search-popup {
  position: fixed;
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.donation-search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 150px;
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
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto 1.5rem auto;
  padding: 0 1rem;
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex-wrap: wrap;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  z-index: 1000;
  box-sizing: border-box;
}
.staff-menu button {
  padding: 0.6rem 1.2rem;
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
  flex-shrink: 0;
  transition: transform 0.2s, background 0.2s;
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
  width: 100%;
  max-width: none;
  padding: 2rem;
  border-radius: 0; /* remove rounded card look */
  overflow-x: auto;
  box-sizing: border-box;
  display: flex; /* center child tables */
  flex-direction: column;
  align-items: center;
}

/* make tables retain white background but no outer gray card */
.contacts-table, .patients-table, .donations-table {
  background: #fff;
  border-radius: 8px;
}
.contacts-table, .patients-table, .donations-table, .task-table {
  font-size: 0.95rem; /* match donations table sizing */
}
.donations-table {
  width: 100%;
  max-width: 600px;
  border-collapse: collapse;
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
.on-board-table th, .on-board-table td,
.donations-table th, .donations-table td,
.contacts-table th, .contacts-table td,
.patients-table th, .patients-table td,
.task-table th, .task-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
.status-content-wrapper {
  display: inline-flex;  
  align-items: center;     
  justify-content: center; 
  gap: 0.5em;             
  width: 100%;            
}
.donations-table th {
  background: #0c4b47;
  color: #fff;
  font-weight: 600;
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
  box-shadow: none; /* removed shadow to blend */
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

/* === Schichtplanung Styles === */
.schedule-section {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.schedule-section h3 {
  color: #0c4b47;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.staff-management {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.staff-management h4 {
  color: #0c4b47;
  margin-bottom: 1rem;
}

.btn-add-staff {
  background: #0c4b47;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s, background 0.2s;
}

.btn-add-staff:hover {
  background: #0a3a36;
  transform: translateY(-2px);
}

.staff-form {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.staff-form input {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 150px;
}

.staff-form button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.staff-form button:first-of-type {
  background: #0c4b47;
  color: white;
}

.staff-form button:last-of-type {
  background: #f5f5f5;
  color: #666;
}

.staff-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  min-height: 60px;
}

.staff-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #0c4b47 0%, #157a74 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(12, 75, 71, 0.3);
  cursor: grab;
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.staff-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(12, 75, 71, 0.4);
}

.staff-item:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.staff-item .remove-assignment-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.staff-item .remove-assignment-btn:hover {
  background: rgba(255,255,255,0.4);
}

/* Week Calendar / Schedule Grid */
.week-calendar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.schedule-table .time-header,
.schedule-table .day-header {
  background: linear-gradient(135deg, #0c4b47 0%, #157a74 100%);
  color: white;
  padding: 1rem 0.5rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
  border-right: 1px solid rgba(255,255,255,0.2);
}

.schedule-table .time-header {
  width: 100px;
}

.schedule-table .time-cell {
  background: #f9f9f9;
  padding: 0.8rem 0.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
}

.schedule-table .schedule-cell {
  padding: 0.5rem;
  min-height: 80px;
  vertical-align: top;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  background: white;
  transition: background 0.2s;
}

.schedule-table .schedule-cell:hover {
  background: #f0f9f8;
}

.schedule-table .schedule-cell.drag-hover {
  background: #e3f2fd;
  outline: 2px dashed #0c4b47;
  outline-offset: -2px;
}

.staff-assignment {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.7rem;
  margin: 0.2rem;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: grab;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.staff-assignment:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
}

.staff-assignment .staff-name {
  white-space: nowrap;
}

.staff-assignment .remove-staff-btn {
  background: rgba(255,255,255,0.25);
  border: none;
  color: white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
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

/* Unified plain header + no truncation for staff tables */
.contacts-table th,
.patients-table th,
.donations-table th,
.task-table th,
.schedule-table .time-header,
.schedule-table .day-header {
  background: #0c4b47 !important;
  color: #fff !important;
  white-space: normal !important;
  text-transform: none;
}

.contacts-table th, .contacts-table td,
.patients-table th, .patients-table td,
.donations-table th, .donations-table td,
.task-table th, .task-table td {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
</style>