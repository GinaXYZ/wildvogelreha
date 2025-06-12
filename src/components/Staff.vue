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
              <th>Spender</th>
              <th>Betrag (€)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="donation in sortedDonations" :key="donation.id">
              <td>{{ formatDate(donation.created_at) }}</td>
              <td>{{ donation.donor_name || 'Anonym' }}</td>
              <td>{{ (+donation.amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
          <div class="pagination">
            <button @click="page--" :disabled="page === 1">Zurück</button>
            <span>Seite {{ page }}</span>
            <button @click="page++" :disabled="page * limit >= totalDonations">Weiter</button>
          </div>
        <div class="donation-sums">
          <p><strong>Gesamt:</strong> {{ totalSum.toFixed(2) }} € ({{ donations.length }} Spenden)</p>
          <p><strong>Gesamt diesen Monat:</strong> {{ monthSum.toFixed(2) }} €</p>
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
    >
      Aufgaben
    </button>
    <button
      :class="{ active: activeTaskTab === 'schicht' }"
      @click="activeTaskTab = 'schicht'"
    >
      Schichtplanung
    </button>
  </div>
  <div class="tasks-shifts-container">
    <div v-if="activeTaskTab === 'aufgaben'" class="tasks-section">
      <h3>Aufgaben</h3>
        <form @submit.prevent="addTask">
          <input v-model="newTask" placeholder="Neue Aufgabe hinzufügen" required />
          <button type="submit" class="action-btn">Hinzufügen</button>
        </form>
      <ul class="task-list">
        <li v-for="(task, idx) in tasks" :key="idx" :class="{ done: task.done }">
          <input type="checkbox" v-model="task.done" />
          <span>{{ task.text }}</span>
          <button @click="removeTask(idx)" class="delete-btn" title="Aufgabe löschen">🗑️</button>
        </li>
        <li v-if="tasks.length === 0" style="color: #888;">Keine Aufgaben.</li>
      </ul>
    </div>
    <div v-if="activeTaskTab === 'schicht'" class="shifts-section">
      <h3>Schichtplan (Woche)</h3>
      <form @submit.prevent="addShift" class="shift-form">
        <input type="date" v-model="newShift.date" required class="details-input" />
        <input type="time" v-model="newShift.time" required class="details-input" />
        <input v-model="newShift.staff" placeholder="Mitarbeiter" required class="details-input" />
        <button type="submit" class="action-btn">Hinzufügen</button>
      </form>
      <table class="shifts-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Zeit</th>
            <th>Mitarbeiter</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(shift, idx) in shifts" :key="idx">
            <td>{{ shift.date }}</td>
            <td>{{ shift.time }}</td>
            <td>{{ shift.staff }}</td>
            <td>
              <button @click="removeShift(idx)" class="delete-btn" title="Schicht löschen">🗑️</button>
            </td>
          </tr>
          <tr v-if="shifts.length === 0">
            <td colspan="4" style="color: #888;">Keine Schichten geplant.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from './auth.js';
const authStore = useAuthStore();

const activeStaffTab = ref('donations');
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
const activeTaskTab = ref('aufgaben');
function removeTask(index) {
  tasks.value.splice(index, 1);
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
const saveAllPatients = async () => {
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    for (const patient of patients.value) {
      await fetch(`http://localhost:3000/api/patients/${patient.id}`, {
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
    }
    alert('Alle Änderungen wurden gespeichert.');
  } catch (err) {
    alert('Fehler beim Speichern der Patientendaten');
  }
};
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
const getSortArrowClass = (field) => {
  if (sortField.value !== field) return 'inactive';
  return sortDirection.value === 'desc' ? 'desc' : 'asc';
};

const sortedDonations = computed(() => {
  return [...donations.value].sort((a, b) => {
    let aVal = a[sortField.value];
    let bVal = b[sortField.value];

    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    if (sortField.value === 'created_at') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);

      if (isNaN(aVal)) aVal = new Date(0);
      if (isNaN(bVal)) bVal = new Date(0);
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
    const res = await fetch(`http://localhost:3000/api/patients?page=${patientsPage.value}&limit=${patientsLimit}`, {
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

const updatePatient = async (patient) => {
  try {
    const token = authStore.token || localStorage.getItem('token'); 
    await fetch(`http://localhost:3000/api/patients/${patient.id}`, {
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
  donations.value.reduce((sum, d) => sum + Number(d.amount), 0)
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
    const res = await fetch(`http://localhost:3000/api/donations?page=${page.value}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });
    if (!res.ok) throw new Error('Fehler beim Laden der Spenden');
    const data = await res.json();
    donations.value = data.results;
    totalDonations.value = data.count;
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
    const res = await fetch(`http://localhost:3000/api/contacts?page=${contactsPage.value}&limit=${contactsLimit}`, {
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
    const response = await fetch(`http://localhost:3000/api/contacts/${contact.id}`, {
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
    const response = await fetch(`http://localhost:3000/api/contacts/${id}`, { 
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      contacts.value = contacts.value.filter(c => c.id !== id);
    }
  } catch (err) {
    alert('Fehler beim Löschen')
  }
};

onMounted(() => {
  fetchDonations();
  fetchContacts();
  fetchPatients();
});
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
  margin-bottom: 0.5rem;
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
  background: #0c4b47;
  color: white;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: background-color 0.2s;
  min-width: 80px; 
  height: 40px; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination-btn:hover:not(.disabled) {
  background: #0a3a36;
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
  background: #0c4b47;
  color: white;
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
.tasks-shifts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 1.5rem;
}
.tasks-section, .shifts-section {
  flex: 1 1 320px;
  background: #fff;
  border-radius: 8px;
  padding: 1.2rem 1rem 1.5rem 1rem;
  min-width: 300px;
  box-shadow: 0 2px 8px #0001;
}
.task-form, .shift-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.task-list li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.3rem 0;
  
}
.task-list li.done span {
  text-decoration: line-through;
  color: #888;
}
.shifts-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}
.shifts-table th, .shifts-table td {
  border: 1px solid #ccc;
  padding: 0.4rem;
  text-align: left;
}
.shifts-table th {
  background: #eee;
}
@media (max-width: 900px) {
  .tasks-shifts-container {
    flex-direction: column;
    gap: 1rem;
  }
}
.subtab-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  margin-top: -1rem;
}
.subtab-container button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  color: #0c4b47;
  background: #eee;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}
.subtab-container button.active {
  background: #0c4b47;
  color: #f0f0f0;
  transform: translateY(-2px);
}
.subtab-container button:hover {
  transform: translateY(-2px);
}
.action-btn {
  margin-right: 0.3rem;
  margin-left: 0.3rem;
  border: 1px solid #0c4b47;
  background-color: #0c4b47;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Helvetica', sans-serif;
  font-weight: bold;
}

.action-btn:hover {
  background: linear-gradient(135deg, #097a6a 0%, #0c4b47 100%);
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.2s;
}

.sortable-header:hover {
  background: #ddd !important;
}

.sort-arrow {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  transition: transform 0.2s, opacity 0.2s;
}

.sort-arrow.inactive {
  opacity: 0.3;
}

</style>