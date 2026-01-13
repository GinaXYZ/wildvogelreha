<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from './auth.js'

const authStore = useAuthStore()
const loading = ref(false)
const API_BASE = '/api'
async function loadMapItems() {
  try {
    loading.value = true
    const response = await fetch(`${API_BASE}/map-items`)
    if (response.ok) {
      mapItems.value = await response.json()
    } else {
      console.error('Fehler beim Laden der Map Items')
    }
  } catch (error) {
    console.error('Fehler beim Laden:', error)
  } finally {
    loading.value = false
  }
}
const isAdmin = computed(() => authStore.user?.role === 'admin')
const isStaff = computed(() => authStore.user?.role === 'staff')
const isCustomer = computed(() => authStore.user?.role === 'customer' || !authStore.user)

const mapItems = ref([])

const hoveredItem = ref(null)
const editingItem = ref(null)
const showAddForm = ref(false)
const newItem = ref({
  id: null,
  label: '',
  class: 'voliere-new',
  x: 0.5,
  y: 0.5,
  image: '/image1.jpg',
  details: {
    name: '',
    species: '',
    age: '',
    description: '',
    status: 'Gesund'
  }
})

let dragItem = null
let offset = { x: 0, y: 0 }
let hoverTimeout = null
let isTooltipHovered = false

function showTooltip(item) {
  clearTimeout(hoverTimeout)
  hoveredItem.value = item
}

function hideTooltip() {
  if (!isTooltipHovered) {
    hoverTimeout = setTimeout(() => {
      if (!isTooltipHovered) {
        hoveredItem.value = null
      }
    }, 150)
  }
}

function onTooltipEnter() {
  isTooltipHovered = true
  clearTimeout(hoverTimeout)
}

function onTooltipLeave() {
  isTooltipHovered = false
  hoverTimeout = setTimeout(() => {
    hoveredItem.value = null
  }, 150)
}

function editItem(item) {
  if (!isAdmin.value && !isStaff.value) return
  editingItem.value = { ...item, details: { ...item.details } }
}

async function saveItem() {
  if (!isAdmin.value && !isStaff.value) return
  if (!editingItem.value) return

  try {
    loading.value = true
    const token = authStore.token || localStorage.getItem('token'); 
    const response = await fetch(`${API_BASE}/map-items/${editingItem.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(editingItem.value)
    })

    if (response.ok) {
      const index = mapItems.value.findIndex(item => item.id === editingItem.value.id)
      if (index !== -1) {
        mapItems.value[index] = editingItem.value
      }
      editingItem.value = null
      hoveredItem.value = null
    }
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
  } finally {
    loading.value = false
  }
}

function cancelEdit() {
  editingItem.value = null
}

async function deleteItem(itemId) {
  if (!isAdmin.value && !isStaff.value) return
  if (!confirm('Möchten Sie diesen Vogel wirklich löschen?')) return

  try {
    loading.value = true
    const token = authStore.token || localStorage.getItem('token'); 
    const response = await fetch(`${API_BASE}/map-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
    }});

    if (response.ok) {
      mapItems.value = mapItems.value.filter(item => item.id !== itemId)
      hoveredItem.value = null
    }
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
  } finally {
    loading.value = false
  }
}

function startAddItem() {
  if (!isAdmin.value && !isStaff.value) return
  const nextId = Math.max(...mapItems.value.map(item => item.id)) + 1
  newItem.value = {
    id: nextId,
    label: '',
    class: 'voliere-new',
    x: 0.5,
    y: 0.5,
    image: '/image1.jpg',
    details: {
      name: '',
      species: '',
      age: '',
      description: '',
      status: 'Gesund'
    }
  }
  showAddForm.value = true
}

async function saveNewItem() {
  if (!isAdmin.value && !isStaff.value) return
  if (!newItem.value.details.name.trim()) return

  try {
    loading.value = true
    newItem.value.label = newItem.value.details.name
    const token = authStore.token || localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/map-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newItem.value)
    })

    if (response.ok) {
      const result = await response.json()
      newItem.value.id = result.id
      mapItems.value.push({ ...newItem.value })
      showAddForm.value = false
    }
  } catch (error) {
    console.error('Fehler beim Erstellen:', error)
  } finally {
    loading.value = false
  }
}

function cancelAddItem() {
  showAddForm.value = false
}



function onDragStart(e, item) {
  if (!isAdmin.value) return
  e.preventDefault()
  dragItem = item
  const rect = e.target.getBoundingClientRect()
  offset.x = e.clientX - rect.left
  offset.y = e.clientY - rect.top
  document.body.style.userSelect = 'none'
}

function onDrag(e) {
  if (!dragItem || !isAdmin.value) return
  e.preventDefault()
  
  const map = document.querySelector('.map')
  if (!map) return
  
  const rect = map.getBoundingClientRect()
  let x = (e.clientX - rect.left - offset.x) / rect.width
  let y = (e.clientY - rect.top - offset.y) / rect.height

  x = Math.max(0, Math.min(0.9, x))
  y = Math.max(0, Math.min(0.9, y))
  
  dragItem.x = x
  dragItem.y = y
}

async function onDragEnd() {
  if (dragItem && isAdmin.value) {
    
    try {
      const token = authStore.token || localStorage.getItem('token'); 
      const response = await fetch(`${API_BASE}/map-items/${dragItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dragItem)
      })
      
      if (!response.ok) {
        console.error('Fehler beim Speichern der Position')
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Position:', error)
    }
  }
  dragItem = null
  document.body.style.userSelect = ''
}

onMounted(() => {
  authStore.initAuth() 
  loadMapItems()
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', onDragEnd)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', onDragEnd)
  clearTimeout(hoverTimeout)
})
</script>

<template>
  <div class="main-layout">
    <div class="map-container">
      <div class="map">
        <img src="/image48.png" class="map-bg" alt="Karte" />
        <div
          v-for="item in mapItems"
          :key="item.id"
          class="map-item-wrapper"
          :style="{
            left: (item.x * 100) + '%',
            top: (item.y * 100) + '%'
          }"
          @mouseenter="showTooltip(item)"
          @mouseleave="hideTooltip"
        >
          <div
            class="map-item"
            :class="[
              item.class,
              { 'admin-mode': isAdmin, 'readonly-mode': isCustomer }
            ]"
            @mousedown="isAdmin ? onDragStart($event, item) : null"
          >
            <img :src="item.image" :alt="item.label" class="item-image" />
          </div>
          <span class="item-label">{{ item.label }}</span>
        </div>
        
        <div 
          v-if="hoveredItem && !editingItem && !showAddForm" 
          class="bird-tooltip"
          :style="{
            left: (hoveredItem.x * 100) + '%',
            top: (hoveredItem.y * 100 + 12) + '%'
          }"
          @mouseenter="onTooltipEnter"
          @mouseleave="onTooltipLeave"
        >
          <h4>{{ hoveredItem.details?.name || hoveredItem.label }}</h4>
          <p v-if="hoveredItem.details?.species"><strong>Art:</strong> {{ hoveredItem.details.species }}</p>
          <p v-if="hoveredItem.details?.age"><strong>Alter:</strong> {{ hoveredItem.details.age }}</p>
          <p v-if="hoveredItem.details?.status"><strong>Status:</strong> {{ hoveredItem.details.status }}</p>
          <p v-if="hoveredItem.details?.description">{{ hoveredItem.details.description }}</p>
          
          <div v-if="isAdmin || isStaff" class="tooltip-actions">
            <button @click="editItem(hoveredItem)" class="btn-edit">Bearbeiten</button>
            <button @click="deleteItem(hoveredItem.id)" class="btn-delete">Löschen</button>
          </div>
        </div>

        <div 
          v-if="editingItem && (isAdmin || isStaff)" 
          class="edit-form"
          :style="{
            left: (editingItem.x * 100) + '%',
            top: (editingItem.y * 100 + 12) + '%'
          }"
        >
          <h4>Vogel bearbeiten</h4>
          <div class="form-group">
            <label>Name:</label>
            <input v-model="editingItem.details.name" type="text" />
          </div>
          <div class="form-group">
            <label>Art:</label>
            <input v-model="editingItem.details.species" type="text" />
          </div>
          <div class="form-group">
            <label>Alter:</label>
            <input v-model="editingItem.details.age" type="text" />
          </div>
          <div class="form-group">
            <label>Status:</label>
            <select v-model="editingItem.details.status">
              <option>Gesund</option>
              <option>In Behandlung</option>
              <option>Zur Adoption</option>
              <option>Quarantäne</option>
            </select>
          </div>
          <div class="form-group">
            <label>Beschreibung:</label>
            <textarea v-model="editingItem.details.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Bild-URL:</label>
            <input v-model="editingItem.image" type="text" placeholder="z.B. /images/mein-vogel.jpg" />
            <small class="input-hint">Geben Sie den Pfad zu Ihrem Bild ein</small>
          </div>
          <div class="form-actions">
            <button @click="saveItem" class="btn-save">Speichern</button>
            <button @click="cancelEdit" class="btn-cancel">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAdmin || isStaff" class="admin-panel">
      <h3>Verwaltung</h3>
      <div class="panel-section">
        <h4>Neues Element</h4>
        <button @click="startAddItem" class="btn-add-custom">
          ➕ Detailliert hinzufügen
        </button>
      </div>

      <div class="panel-section">
        <h4>Statistiken</h4>
        <div class="stats">
          <p><strong>{{ mapItems.length }}</strong> Elemente</p>
          <p><strong>{{ mapItems.filter(item => item.details?.status === 'Gesund').length }}</strong> Gesunde Vögel</p>
          <p><strong>{{ mapItems.filter(item => item.details?.status === 'In Behandlung').length }}</strong> In Behandlung</p>
        </div>
      </div>

      <div class="panel-section">
        <h4>Benutzer</h4>
        <div class="user-info">
          <p v-if="authStore.user">
            <strong>{{ authStore.user.username }}</strong><br>
            <small>{{ authStore.user.role }}</small>
          </p>
          <p v-else>
            <router-link to="/login">Anmelden</router-link>
          </p>
        </div>
      </div>
    </div>
    <div v-if="showAddForm && (isAdmin || isStaff)" class="add-form-overlay">
      <div class="add-form">
        <h4>Neues Element hinzufügen</h4>
        <div class="form-group">
          <label>Name:</label>
          <input v-model="newItem.details.name" type="text" />
        </div>
        <div class="form-group">
          <label>Art:</label>
          <input v-model="newItem.details.species" type="text" />
        </div>
        <div class="form-group">
          <label>Alter:</label>
          <input v-model="newItem.details.age" type="text" />
        </div>
        <div class="form-group">
          <label>Status:</label>
          <select v-model="newItem.details.status">
            <option>Gesund</option>
            <option>In Behandlung</option>
            <option>Zur Adoption</option>
            <option>Quarantäne</option>
          </select>
        </div>
        <div class="form-group">
          <label>Beschreibung:</label>
          <textarea v-model="newItem.details.description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Bild-URL:</label>
          <input v-model="newItem.image" type="text" placeholder="z.B. /images/mein-vogel.jpg" />
          <small class="input-hint">Geben Sie den Pfad zu Ihrem Bild ein</small>
        </div>
        <div class="form-actions">
          <button @click="saveNewItem" class="btn-save">Hinzufügen</button>
          <button @click="cancelAddItem" class="btn-cancel">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  gap: 2rem;
  margin: 2rem auto;
  max-width: 1200px;
  margin-top: 6rem;
  padding: 0 1rem;
}

.map-container {
  position: relative;
  flex: 1;
  min-width: 0;
  aspect-ratio: 4/3;
  max-height: calc(100vh - 10rem);
}

.map {
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid #ccc;
  border-radius: 8px;
  overflow: visible; 
  background: #fff;
}

.map-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
  border-radius: 8px;
}

.map-item-wrapper {
  position: absolute;
  width: 60px;
  height: 80px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%) translateY(-30px); 
  z-index: 10;
}

.map-item {
  width: 60px;
  height: 60px;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.1s ease;
}

.map-item.admin-mode {
  cursor: grab;
}

.map-item.admin-mode:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.map-item.admin-mode:active {
  cursor: grabbing;
  transform: scale(1.1);
}

.map-item.readonly-mode {
  cursor: pointer;
}

.map-item.readonly-mode:hover {
  transform: scale(1.02);
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.item-label {
  margin-top: 2px;
  font-size: 0.8rem;
  background: rgba(255,255,255,0.8);
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: 'Helvetica', sans-serif;
  font-weight: bold;
  color: #0c4b47;
}

.bird-tooltip {
  position: absolute;
  background: white;
  border: 2px solid #0c4b47;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 999999;
  min-width: 200px;
  max-width: 250px;
  font-family: 'Helvetica', sans-serif;
  font-weight: bold;
  color: #0c4b47;
  font-size: 0.8rem;
  pointer-events: auto;
  transform: translateX(-50%);
}

.bird-tooltip::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #0c4b47;
}

.bird-tooltip::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
}

.bird-tooltip h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #0c4b47;
}

.bird-tooltip p {
  margin: 0.2rem 0;
  line-height: 1.2;
}

.tooltip-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete, .btn-save, .btn-cancel {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Helvetica', sans-serif;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}

.btn-save {
  background: #4caf50;
  color: white;
}

.btn-save:hover {
  background: #388e3c;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}

.btn-cancel:hover {
  background: #757575;
}

.edit-form {
  position: absolute;
  background: white;
  border: 2px solid #0c4b47;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 2599999;
  min-width: 280px;
  max-width: 350px;
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  font-size: 0.8rem;
  pointer-events: auto;
  transform: translateX(-50%);
}

.edit-form::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #0c4b47;
}

.edit-form::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
}

.edit-form h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #0c4b47;
}

.form-group {
  margin-bottom: 0.8rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.2rem;
  font-weight: bold;
  font-size: 0.7rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: 'Helvetica', sans-serif;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.input-hint {
  display: block;
  font-size: 0.6rem;
  color: #666;
  margin-top: 0.2rem;
  font-style: italic;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.admin-panel {
  width: 280px;
  background: #f5f5f5;
  border: 2px solid #0c4b47;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  font-family: 'Helvetica', sans-serif;
}

.admin-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #0c4b47;
  font-size: 1.2rem;
  text-align: center;
}

.panel-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.panel-section h4 {
  margin: 0 0 0.8rem 0;
  color: #0c4b47;
  font-size: 1rem;
}

.quick-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-quick {
  padding: 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-family: 'Helvetica', sans-serif;
}

.btn-bird {
  background: #e3f2fd;
  color: #1976d2;
  border: 2px solid #1976d2;
}

.btn-bird:hover {
  background: #1976d2;
  color: white;
}

.btn-entrance {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 2px solid #7b1fa2;
}

.btn-entrance:hover {
  background: #7b1fa2;
  color: white;
}

.btn-office {
  background: #e8f5e8;
  color: #388e3c;
  border: 2px solid #388e3c;
}

.btn-office:hover {
  background: #388e3c;
  color: white;
}

.btn-add-custom {
  width: 100%;
  padding: 1rem;
  background: #0c4b47;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Helvetica', sans-serif;
}

.btn-add-custom:hover {
  background: #094037;
}

.stats {
  font-size: 0.9rem;
  color: #666;
}

.stats p {
  margin: 0.3rem 0;
}

.user-info {
  font-size: 0.8rem;
}

.user-info a {
  color: #0c4b47;
  text-decoration: underline;
}

.add-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999999;
}

.add-form {
  background: white;
  border: 2px solid #0c4b47;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  font-family: 'Helvetica', sans-serif;
}

.add-form h4 {
  margin: 0 0 1.5rem 0;
  color: #0c4b47;
  font-size: 1.2rem;
  text-align: center;
}

@media (max-width: 1000px) {
  .main-layout {
    flex-direction: column;
    align-items: center;
    margin-top: 5rem; 
  }
  
  .map-container {
    width: 100%;
    flex: none; 
    max-height: 70vh;
  }

  .admin-panel{
    width: 100%; 
    max-width: 600px; 
    position: static; 
    margin-top: 1rem;
  }
}

@media (max-width: 640px) {
  .main-layout {
    padding: 0 0.5rem;
    margin-top: 4.5rem;
    gap: 1rem;
  }
  .map-container {
    border-radius: 0; 
    border-left: none;
    border-right: none;
    max-height: 60vh;
  }
  .map {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .admin-panel {
    max-width: 100%;
    padding: 1rem;
  }
  .add-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  .bird-tooltip {
    max-width: 250px;
    padding: 0.8rem;
    font-size: 0.75rem;
  }
  .edit-form {
    min-width: 220px;
    max-width: 280px;
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .main-layout {
    margin-top: 4rem;
  }
  .map-item-wrapper {
    width: 45px;
    height: 65px;
  }
  .map-item {
    width: 40px;
    height: 40px;
  }
  .item-label {
    font-size: 0.6rem;
    padding: 1px 3px;
  }
  .bird-tooltip {
    min-width: 180px;
    max-width: 220px;
  }
  .bird-tooltip h4 {
    font-size: 0.9rem;
  }
  .btn-edit, .btn-delete {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }
}
</style>