<script setup>
import { ref, onMounted } from 'vue';
import Slideshow from './Slideshow.vue';

const topDonations = ref([]);
const donationsLoading = ref(false);
const donationsError = ref(null);

const fetchTopDonations = async () => {
  donationsLoading.value = true;
  donationsError.value = null;
  try {
    const res = await fetch('/api/donations/top10');
    if (!res.ok) throw new Error('Fehler beim Laden der Spenden');
    topDonations.value = await res.json();
  } catch (err) {
    donationsError.value = err.message;
  } finally {
    donationsLoading.value = false;
  }
};
const latestPosts = ref([]);
const postsLoading = ref(false);
const postsError = ref(null);

const fetchLatestPosts = async () => {
  postsLoading.value = true;
  postsError.value = null;
  try {
    const res = await fetch('/api/blog/latest?limit=5');
    if (!res.ok) throw new Error('Fehler beim Laden der Blogposts');
    latestPosts.value = await res.json();
  } catch (err) {
    postsError.value = err.message;
  } finally {
    postsLoading.value = false;
  }
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function shortName(name) {
  if (!name) return 'Anonym';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}
onMounted(() => {
  fetchTopDonations();
  fetchLatestPosts();
});
const slides = [
  {
    image: '/image1.jpg',
    news: 'Kolibris können rückwärts fliegen – dank ihrer einzigartigen Flügelrotation sind sie die einzigen Vögel, die das aktiv können.',
  },
  {
    image: '/image2.jpg',
    news: 'Papageien erkennen sich selbst im Spiegel – das zeigt, dass sie ein gewisses Selbstbewusstsein haben, ähnlich wie Delfine oder Menschenaffen.',
  },
  {
    image: '/image3.jpg',
    news: 'Der Rosalöffler (Platalea ajaja, Syn.: Ajaia ajaja) ist eine Vogelart aus der Gattung der Löffler (Platalea) innerhalb der Familie der Ibisse und Löffler (Threskiornithidae).',
  },
];

const newBirds = [
  {
    image: '/image40.jpg',
    Hnews: 'Wellensittich Frida',
    descr: 'Wellensittiche sind die beliebtesten Haustiervögel.',
  },
  {
    image: '/image41.jpg',
    Hnews: 'Graupapagei Max',
    descr: 'Grapapageien sind die schlausten Vögel der Welt.',
  },
  {
    image: '/image42.jpg',
    Hnews: 'Schwalbenpapagei Gerd',
    descr: 'Schwalbenpapageien sind die schnellsten Papageien der Welt.'
  },
    {
    image: '/image43.jpg',
     Hnews: 'Regenbogenlori Chester',
     descr: 'Chester versucht Ohrringe zu essen.', 
  },
      {
    image: '/image44.jpg',
    Hnews: 'Halsbandsittich Luna',
    descr: 'Luna ist ein Wildfund und kann nicht mehr fliegen.',
  },
      {
    image: '/image45.jpg',
    Hnews: 'Rotkehlchen Felix',
     descr: 'Felix hat einen gebrochenen Flügel.',
  },
      {
    image: '/image46.jpg',
    Hnews: 'Steinadler Jared',
     descr: 'Jared hat eine Spannweite von 2 Metern.',
  },
      {
    image: '/image47.jpg',
    Hnews: 'Rotstirnamazone Mia',
     descr: 'Mia ist noch sehr scheu.',
  },

];
</script>

<template>
  <div class="home-page">
    <div class="intro-section">
      <h1 class="intro-title">Wildvogel Rehastation Waabs</h1>
      <p class="intro-text">
        Willkommen bei der Wildvogelreha Waabs! Seit über 4 Jahren retten, 
        pflegen und rehabilitieren wir verletzte, verwaiste und kranke Vögel aller 
        Arten und Größen. Unser erfahrenes Team aus Tierärzten und Tierpflegern 
        verfügt über modernste Ausstattung und spezialisierte Kenntnisse in der 
        Wildvogelmedizin. Mit artgerechten Volieren, professioneller medizinischer 
        Betreuung und gezielten Rehabilitationsprogrammen bereiten wir unsere Schützlinge 
        optimal auf ihre Rückkehr in die freie Wildbahn vor.
      </p>
      <p class="intro-highlight">
        🦅 Über 200 Vögel pro Jahr • 🏥 24/7 Notfallversorgung • 🌿 Artgerechte Rehabilitation
      </p>
    </div>

    <div class="home-main-row">
      <div class="blogposts-container">
        <h2>Letzte Blogposts ✍️</h2>
        <div v-if="postsLoading" class="loading">Lade Blogposts...</div>
        <div v-else-if="postsError" class="error">{{ postsError }}</div>
        <ul v-else class="blogposts-list">
          <li v-for="post in latestPosts" :key="post.id" class="blogpost-item">
            <router-link :to="`/blog/`" class="blog-link">
              {{ post.title }}
            </router-link>
            <span class="blog-date">{{ formatDate(post.created_at) }}</span>
          </li>
        </ul>
        <router-link to="/blog" class="all-blogs-link">Alle Blogposts ansehen →</router-link>
      </div>

      <div class="slideshow-center">
        <Slideshow :slides="slides" />
      </div>

      <div class="donation-table-container">
        <h2>Top 10 Spenden 🎉</h2>
        <div v-if="donationsLoading" class="loading">Lade Spenden...</div>
        <div v-else-if="donationsError" class="error">{{ donationsError }}</div>
        <ul v-else class="donation-list">
          <li v-for="(donation, index) in topDonations" :key="donation.id" class="donation-item">
            <span class="donation-rank">{{ index + 1 }}.</span>
            <span class="donor-name">{{ shortName(donation.donor_name) }}</span>
            <span class="donation-amount">{{ Number(donation.amount).toFixed(0) }} €</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="news-section">
      <h1 class="news-headline">Unsere Neuankömmlinge 🦅</h1>
      <div class="newBirds">
        <router-link
          v-for="bird in newBirds"
          :key="bird.Hnews"
          to="/voegel/"
          class="bird-link"
        >
          <div class="bird-img-wrapper">
            <img :src="bird.image" :alt="bird.Hnews || bird.news" class="bird-img" />
            <div class="news-overlay">
              <h3 v-if="bird.Hnews">{{ bird.Hnews }}</h3>
              <p v-if="bird.descr">{{ bird.descr }}</p>
              <p v-else-if="bird.news" class="news-text">{{ bird.news }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== HOME PAGE CONTAINER ===== */
.home-page {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* ===== INTRO SECTION ===== */
.intro-section {
  text-align: center;
  padding: 2rem;
  margin: 1rem auto 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 900px;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}

.intro-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #0c4b47;
  line-height: 1.2;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-align: justify;
}

.intro-highlight {
  font-size: 1rem;
  font-weight: bold;
  color: #0c4b47;
  background: rgba(12, 75, 71, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #0c4b47;
}

/* ===== MAIN ROW - 3 Column Layout ===== */
.home-main-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
  box-sizing: border-box;
}

.slideshow-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* ===== BLOGPOSTS CONTAINER ===== */
.blogposts-container,
.donation-table-container {
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  box-sizing: border-box;
  min-width: 0;
}

.blogposts-container h2,
.donation-table-container h2 {
  font-size: 1.1rem;
  margin: 0 0 0.8rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.blogposts-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.8rem 0;
  width: 100%;
}

.blogpost-item {
  margin-bottom: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #eee;
  line-height: 1.4;
}

.blogpost-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.blog-link {
  color: #0c4b47;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  display: block;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: color 0.2s;
}

.blog-link:hover {
  color: #2196f3;
}

.blog-date {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.2rem;
}

.all-blogs-link {
  color: #0c4b47;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.all-blogs-link:hover {
  color: #2196f3;
}

/* ===== DONATION LIST ===== */
.donation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.donation-item {
  display: flex;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}

.donation-item:last-child {
  border-bottom: none;
}

.donation-rank {
  flex-shrink: 0;
  width: 1.5rem;
  font-weight: bold;
  color: #888;
}

.donor-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 0.5rem;
}

.donation-amount {
  flex-shrink: 0;
  font-weight: bold;
  color: #2196f3;
  white-space: nowrap;
}

/* ===== NEWS SECTION (New Birds) ===== */
.news-section {
  padding: 1.5rem;
  text-align: center;
}

.news-headline {
  margin-bottom: 1.5rem;
  color: #0c4b47;
  font-size: 1.8rem;
  font-family: 'Helvetica', sans-serif;
}

.newBirds {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

.bird-link {
  text-decoration: none;
  display: block;
}

.bird-img-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 aspect ratio */
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.bird-img-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.bird-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Info-Overlay - ALWAYS visible (no hover needed) */
.news-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.6rem;
  box-sizing: border-box;
  color: #0c4b47;
  text-align: left;
}

.news-overlay h3 {
  font-size: 0.9rem;
  margin: 0 0 0.2rem 0;
  line-height: 1.2;
}

.news-overlay p {
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.3;
  color: #555;
}

/* ===== LOADING & ERROR ===== */
.loading {
  color: #666;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

/* ===== TABLET (1024px) ===== */
@media (max-width: 1024px) {
  .home-main-row {
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 1rem;
  }
  
  .newBirds {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .intro-section {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .intro-title {
    font-size: 1.7rem;
  }
}

/* ===== TABLET SMALL (768px) ===== */
@media (max-width: 768px) {
  .home-main-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .slideshow-center {
    order: -1;
  }
  
  .blogposts-container,
  .donation-table-container {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .intro-section {
    margin: 0.5rem;
    padding: 1.2rem;
  }
  
  .intro-title {
    font-size: 1.5rem;
  }
  
  .intro-text {
    font-size: 1rem;
    text-align: left;
  }
  
  .intro-highlight {
    font-size: 0.95rem;
    padding: 0.8rem;
  }
  
  .newBirds {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 0 0.5rem;
  }
  
  .news-headline {
    font-size: 1.5rem;
  }
}

/* ===== MOBILE (480px) ===== */
@media (max-width: 480px) {
  .home-main-row {
    padding: 0 0.5rem;
    gap: 1rem;
  }
  
  .intro-section {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .intro-title {
    font-size: 1.3rem;
  }
  
  .intro-text {
    font-size: 0.95rem;
  }
  
  .intro-highlight {
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    text-align: left;
  }
  
  .newBirds {
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }
  
  .news-overlay h3 {
    font-size: 0.8rem;
  }
  
  .news-overlay p {
    font-size: 0.7rem;
  }
  
  .blog-link {
    font-size: 0.9rem;
  }
  
  .donation-item {
    font-size: 0.9rem;
  }
}
</style>


