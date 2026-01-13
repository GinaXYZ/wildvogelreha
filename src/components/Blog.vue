<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from './auth.js';

const authStore = useAuthStore();
const message = ref('');
const posts = ref([]);
const newPost = ref({
  title: '',
  content: '',
  imageUrl: '',
  category: ''
});
const editingPostId = ref(null);
const editedPost = ref({
  title: '',
  content: '',
  imageUrl: '',
  category: ''
});
const toastMessage = ref('');
const showToast = ref(false);

onMounted(async () => {
  try {
    const response = await fetch('/api/blog', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      posts.value = Array.isArray(data) ? data : data.results || [];
    } else {
      message.value = `Fehler beim Abrufen der Blog-Beiträge: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    message.value = 'Verbindungsfehler: Die Blog-Beiträge konnten nicht geladen werden.';
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'Unbekanntes Datum';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unbekanntes Datum';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
  } catch (error) {
    return 'Unbekanntes Datum';
  }
};

const createBlogPost = async () => {
  if (!authStore || !authStore.isLoggedIn) {
    return;
  }

  if (!newPost.value || !newPost.value.title?.trim() || !newPost.value.content?.trim()) {
    message.value = 'Titel und Inhalt dürfen nicht leer sein.';
    return;
  }

  try {
    const blogPost = {
      ...newPost.value,
      author: authStore.user?.username || 'Unbekannter Autor',
      date: new Date().toISOString()
    };

 const token = authStore.token || localStorage.getItem('token');
    const response = await fetch('/api/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(blogPost)
    });

    if (response.ok) {
      const createdPost = await response.json();
      posts.value.unshift(createdPost);

      newPost.value = {
        title: '',
        content: '',
        imageUrl: '',
        category: ''
      };

      message.value = 'Beitrag erfolgreich erstellt!';
    } else {
      const errorText = await response.text();
      message.value = `Fehler beim Erstellen des Beitrags: ${errorText || response.statusText}`;
    }
  } catch (error) {
    message.value = 'Netzwerkfehler beim Erstellen des Beitrags.';
  }
};

const deletePost = async (postId) => {
  if (!authStore.isLoggedIn) {
    return;
  }

  if (!confirm('Sind Sie sicher, dass Sie diesen Beitrag löschen möchten?')) {
    return;
  }

  try {
    const token = authStore.token || localStorage.getItem('token'); 
    const response = await fetch(`/api/blog/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
    }});

    if (response.ok) {
      posts.value = posts.value.filter(post => post.id !== postId);
      message.value = 'Beitrag erfolgreich gelöscht.';
    } else {
      const errorText = await response.text();
      message.value = `Fehler beim Löschen des Beitrags: ${errorText || response.statusText}`;
    }
  } catch (error) {
    message.value = 'Netzwerkfehler beim Löschen des Beitrags.';
  }
};

const startEditing = (post) => {
  editingPostId.value = post.id;
  editedPost.value = { ...post };
};

const cancelEditing = () => {
  editingPostId.value = null;
  editedPost.value = { title: '', content: '', imageUrl: '', category: '' };
};

const updatePost = async (postId) => {
  if (!editedPost.value.title.trim() || !editedPost.value.content.trim()) {
    message.value = 'Titel und Inhalt dürfen nicht leer sein.';
    return;
  }

  try {
    const response = await fetch(`/api/blog/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedPost.value)
    });

    const responseText = await response.text();

    if (response.ok) {
      const updatedPost = JSON.parse(responseText);
      const index = posts.value.findIndex(post => post.id === postId);
      if (index !== -1) {
        posts.value[index] = updatedPost;
      }

      toastMessage.value = `Der Beitrag wurde bearbeitet!`;
      showToast.value = true;

      setTimeout(() => {
        showToast.value = false;
      }, 3000);

      cancelEditing();
    } else {
      message.value = `Fehler beim Aktualisieren des Beitrags: ${responseText}`;
    }
  } catch (error) {
    message.value = 'Netzwerkfehler beim Aktualisieren des Beitrags.';
  }
};
</script>

<template>
  <div class="blog-page">
    <div class="blog-editor" v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'staff')">
      <h2>Neuen Beitrag erstellen</h2>
      <form @submit.prevent="createBlogPost">
        <input v-model="newPost.title" type="text" placeholder="Titel des Beitrags" required class="post-title-input" />
        <textarea v-model="newPost.content" placeholder="Inhalt des Beitrags..." required rows="8" class="post-content-input"></textarea>
        <div class="post-options">
          <input v-model="newPost.imageUrl" type="text" placeholder="Bild-URL (optional)" class="image-url-input" />
          <select v-model="newPost.category" class="category-select">
            <option value="">Kategorie wählen...</option>
            <option value="Wildvögel">Wildvögel</option>
            <option value="Rehabilitation">Rehabilitation</option>
            <option value="Events">Events</option>
            <option value="Neuigkeiten">Neuigkeiten</option>
          </select>
        </div>
        <button type="submit" class="submit-post-button">Beitrag veröffentlichen</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
    </div>

    <div class="blog-posts">
      <h2>Blog Beiträge</h2>
      <div v-if="posts.length === 0" class="no-posts">Noch keine Beiträge vorhanden.</div>
      <div v-else class="posts-container">
        <div v-for="post in posts" :key="post.id" class="blog-post">
          <h3>{{ post.title }}</h3>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(post.date || post.created_at) }}</span>
            <span class="post-category">{{ post.category }}</span>
          </div>
          <img v-if="post.imageUrl" :src="post.imageUrl" alt="Beitragsbild" class="post-image" />
          <p>{{ post.content }}</p>
          <div class="post-actions" v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'staff')">
            <button @click="deletePost(post.id)" class="delete-button">Löschen</button>
            <button @click="startEditing(post)" class="edit-button">Bearbeiten</button>
          </div>
          <div v-if="editingPostId === post.id" class="edit-post-form">
            <h3>Beitrag bearbeiten</h3>
            <form @submit.prevent="updatePost(post.id)">
              <input v-model="editedPost.title" type="text" placeholder="Titel des Beitrags" required />
              <textarea v-model="editedPost.content" placeholder="Inhalt des Beitrags..." rows="8" required></textarea>
              <input v-model="editedPost.imageUrl" type="text" placeholder="Bild-URL (optional)" />
              <select v-model="editedPost.category" required>
                <option value="">Kategorie wählen...</option>
                <option value="Wildvögel">Wildvögel</option>
                <option value="Rehabilitation">Rehabilitation</option>
                <option value="Events">Events</option>
                <option value="Neuigkeiten">Neuigkeiten</option>
              </select>
              <button type="submit" class="submit-post-button">Speichern</button>
              <button @click="cancelEditing" type="button" class="cancel-button">Abbrechen</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  max-width: 1200px;
  margin: 6rem auto 0;
  padding: 2rem;
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.blog-editor {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  margin: 0 auto 2rem;
  box-sizing: border-box
}
input, textarea, select {
  width: 90%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
textarea {
  resize: vertical;
}
.post-options {
  display: flex;
  gap: 1rem;
}
.image-url-input, .category-select {
  flex: 1;
}
.submit-post-button {
  background-color: #0c4b47;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.submit-post-button:hover {
  background-color: #0a3a36;
}
.blog-posts h2 {
  margin-bottom: 1.5rem;
}
.no-posts {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}
.posts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}
.blog-post {
  flex: 1 1 300px;
  max-width: 350px;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}
.post-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 1rem;
  border-radius: 4px;
}
.post-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.edit-button, .delete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.edit-button {
  background-color: #2196f3;
  color: white;
}
.delete-button {
  background-color: #f44336;
  color: white;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .blog-page {
    margin-top: 5rem;
    padding: 1rem;
    gap: 2rem;
  }
  
  .posts-container {
    gap: 1rem;
  }
  
  .blog-post {
    flex: 1 1 100%;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  
  .blog-post p {
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    hyphens: auto;
  }
  
  .blog-post h3 {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .blog-editor {
    padding: 1rem;
    max-width: 100%;
  }
  
  .post-options {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  input, textarea, select {
    width: 100%;
    font-size: 1rem;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .blog-page {
    margin-top: 4.5rem;
    padding: 0.8rem;
  }
  
  .blog-posts h2 {
    font-size: 1.3rem;
  }
  
  .blog-post {
    padding: 0.8rem;
  }
  
  .blog-post h3 {
    font-size: 1.1rem;
    line-height: 1.3;
  }
  
  .blog-post p {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .post-actions {
    flex-wrap: wrap;
  }
}
</style>
