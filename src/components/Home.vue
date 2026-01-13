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
        <div class="intro-section">
        <h1 class="intro-title">Wildvogel Rehastation Waabs </h1>
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
      <h2>Letzte Blogposts✍️</h2>
      <div v-if="postsLoading">Lade Blogposts...</div>
      <div v-else-if="postsError" class="error">{{ postsError }}</div>
      <ul v-else class="blogposts-list">
        <li v-for="post in latestPosts" :key="post.id">
          <router-link :to="`/blog/`" class="blog-link">
            <strong>{{ post.title }}</strong>
          </router-link>
          <span class="blog-date">{{ new Date(post.created_at).toLocaleDateString('de-DE') }}</span>
        </li>
      </ul>
      <router-link to="/blog" class="all-blogs-link">Alle Blogposts ansehen</router-link>
    </div>
    <div class="slideshow-center">
      <Slideshow :slides="slides" />
    </div>
    <div class="donation-table-container">
      <h2>Top 10 Spenden 🎉</h2>
      <div v-if="donationsLoading">Lade Spenden...</div>
      <div v-else-if="donationsError" class="error">{{ donationsError }}</div>
        <ul v-else class="donation-list">
        <li v-for="donation in topDonations" :key="donation.id">
          <span class="donor-name">{{ shortName(donation.donor_name) }}</span>
          <span class="donation-amount">{{ Number(donation.amount).toFixed() }} €</span>
        </li>
        </ul>
    </div>
  </div>
  <div class="news">
    <div class="newsHeadline">
      <h1>Unsere Neuankömmlinge 🦅</h1>
      <div class="newBirds">
        <router-link
          v-for="(bird) in newBirds"
          :to="`/voegel/`"
          class="bird-link"
        >
          <div class="bird-img-wrapper">
            <img :src="bird.image" :alt="bird.Hnews || bird.news" class="bird-img" />
            <div class="news-overlay">
              <div>
                <h3 v-if="bird.Hnews">{{ bird.Hnews }}</h3>
                <p v-if="bird.descr">{{ bird.descr }}</p>
                <p v-else-if="bird.news" class="news-text">{{ bird.news }}</p>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-main-row {
  display: grid;
  grid-template-columns: minmax(120px, 180px) 1fr minmax(120px, 180px);
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto 2rem auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .home-main-row {
    grid-template-columns: 1fr 1fr;
    margin-top: 2rem;
  }
  .slideshow-center {
    grid-column: 1 / -1;
    order: -1;
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .home-main-row {
    grid-template-columns: 1fr;
    margin-top: 1.5rem;
    gap: 1rem;
    padding: 0 0.8rem;
  }
  .blogposts-container,
  .donation-table-container {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .home-main-row {
    margin-top: 1rem;
    padding: 0 0.5rem;
    gap: 0.8rem;
  }
}
.slideshow-center {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 0;
}
.donation-table th, .donation-table td {
  padding: 0.4em 0.7em;
  text-align: left;
}
.donation-table th {
  background: #eee;
}
.error {
  color: red;
  margin: 1rem 0;
}
.blogposts-container,
.donation-table-container {
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 0.5rem;
  min-width: 0;
  max-width: 100%;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  box-sizing: border-box;
}
.donation-table {
  width: 100%;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  margin: 0 auto;
  border-collapse: collapse;
  font-size: 1rem;
  border-radius: 8px;
  background: #fff;
  text-align: center;
}
.donation-table th {
  background: #eee;
}
.error {
  color: red;
  margin: 1rem 0;
}
.slideshow-outer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.center-content {
  width: 600px; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.newsHeadline {
    margin-bottom: 0.2rem;
    color: #0c4b47;
    font-size: 0.8rem;
    font-family: 'Helvetica', sans-serif;
    text-align: center;
}
.newBirds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  min-height: 180px;
  margin: 1rem auto;
  place-items: center;
  font-family: 'Helvetica', sans-serif;
  border-radius: 24px;
  justify-items: center;
  justify-content: center;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .newBirds {
    grid-template-columns: repeat(2, 1fr);
    width: 95%;
    gap: 1rem;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .newBirds {
    grid-template-columns: 1fr;
    width: 100%;
  }
}
.bird-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  width: 100%
}
.bird-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  display: block;
}
.bird-img:hover {
  transform: scale(1.07);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
   border-radius: 8px;
}
.bird-img-wrapper {
  position: relative;
  display: block;
  width: 100%; 
  max-width: 250px; 
  height: 0;
  padding-bottom: 100%; /* 1:1 aspect ratio */
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
}

.bird-img-wrapper .bird-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.news-overlay {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%; 
  height: 35%; 
  background: rgba(226, 226, 226, 0.85);
  border-radius: 0;
  box-sizing: border-box;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; 
    color: #0c4b47;
}
.bird-img-wrapper:hover .news-overlay {
  opacity: 1;
}
.news-text {
  font-size: 1rem;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}
.blogposts-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  width: 100%;
    color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}
.blogposts-list li {
  margin-bottom: 1em;
  word-break: break-word;
    color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}
.blog-link {
  color: #0c4b47;
  text-decoration: none;
  transition: color 0.2s;
    color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}
.blog-link:hover {
  color: #2196f3;
}
.blog-date {
  display: block;
  font-size: 0.85em;
  color: #888;
  margin-top: 0.1em;
}
.all-blogs-link {
  margin-top: 0.5em;
  color: #0c4b47;
  font-size: 0.95em;
  transition: color 0.2s;
}
.all-blogs-link:hover {
  color: #2196f3;
}
.donation-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  width: 100%;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}

.donation-list li {
  word-break: break-word;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.donation-amount {
  font-weight: bold;
  margin-left: 0.5rem;
  color: #2196f3;
  font-family: 'Helvetica', sans-serif;
}

.intro-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  margin-top: 7rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
}

.intro-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #0c4b47;
  line-height: 1.2;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-align: justify;
}

.intro-highlight {
  font-size: 1rem;
  font-weight: bold;
  color: #0c4b47;
  background: rgba(12, 75, 71, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #0c4b47;
}
@media (max-width: 768px) {
  .intro-section {
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
    margin-top: 5rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
  .intro-title {
    font-size: 1.5rem;
  }
  
  .intro-text {
    font-size: 0.95rem;
    text-align: left;
  }
  
  .intro-highlight {
    font-size: 0.85rem;
    padding: 0.6rem;
  }
}

@media (max-width: 480px) {
  .intro-section {
    margin-top: 4.5rem;
    padding: 1rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  
  .intro-title {
    font-size: 1.3rem;
  }
  
  .intro-text {
    font-size: 0.9rem;
  }
  
  .intro-highlight {
    font-size: 0.8rem;
  }
}
</style>


