<template>
  <div class="about-page">
    <div class="mission-section">
      <div class="container">
        <h2>Unsere Mission</h2>
        <div class="mission-grid">
          <div class="mission-card">
            <div class="mission-icon">🚑</div>
            <h3>Retten</h3>
            <p>Wir nehmen verletzte, verwaiste und kranke Wildvögel auf und geben ihnen eine zweite Chance.</p>
          </div>
          <div class="mission-card">
            <div class="mission-icon">💊</div>
            <h3>Pflegen</h3>
            <p>Mit modernster Ausstattung und tierärztlicher Betreuung sorgen wir für optimale Genesung.</p>
          </div>
          <div class="mission-card">
            <div class="mission-icon">🌲</div>
            <h3>Auswildern</h3>
            <p>Unser Ziel ist es, jeden Vogel erfolgreich in seine natürliche Umgebung zurückzuführen.</p>
          </div>
        </div>
      </div>
    </div>


    <div class="story-section">
      <div class="container">
        <div class="story-content">
          <div class="story-text">
            <h2>Unsere Geschichte</h2>
            <p>Die Wildvogelreha Norddeutschland wurde 2021 in Brandenburg gegründet, als eine Gruppe von Vogelliebhabern erkannte, dass verletzte Wildvögel in der Region dringend professionelle Hilfe benötigten.</p>
            <p>Was als kleine Initiative begann, hat sich zu einer vollwertigen Rehabilitationsstation entwickelt, die jährlich über 2.000 Vögel behandelt.</p>
            <ul class="achievements">
              <li>✅ Über 2.000 Vögel pro Jahr behandelt</li>
              <li>✅ 24/7 Notfallversorgung</li>
              <li>✅ Moderne Klinikausstattung</li>
              <li>✅ Ehrenamtliches Engagement</li>
            </ul>
          </div>
          <img src="/image16.jpg" alt="Behandlung" class="story-image">
        </div>
      </div>
    </div>

    <div class="facilities-section">
      <div class="container">
        <h2>Unsere Einrichtung</h2>
        <div class="facilities-grid">
          <div class="facility-item">
            <img src="/image17.jpg" alt="Intensivstation">
            <h3>Intensivstation</h3>
            <p>UV-beleuchtete Pflegezimmer für die Erstversorgung kritischer Patienten.</p>
          </div>
          <div class="facility-item">
            <img src="/image18.jpg" alt="Außenvolieren">
            <h3>Außenvolieren</h3>
            <p>Artgerechte Volieren für die Rehabilitation verschiedener Vogelarten.</p>
          </div>
          <div class="facility-item">
            <img src="/image19.jpg" alt="Flugvolieren">
            <h3>Flugvolieren</h3>
            <p>Spezielle Flugvolieren bereiten die Vögel auf die Auswilderung vor.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="team-section">
      <div class="container">
        <h2>Unser Team</h2>
        <div class="team-grid">
          <div class="team-member">
            <img src="/sarah.jfif" alt="Sarah Müller" class="member-avatar" />
            <h3>Dr. Sarah Müller</h3>
            <p>Tierärztin</p>
            <small>Medizinische Versorgung & Operationen</small>
          </div>
          <div class="team-member">
            <img src="/max.jfif" alt="Max Fischer" class="member-avatar" />
            <h3>Max Fischer</h3>
            <p>Tierpfleger</p>
            <small>Rehabilitation & Auswilderung</small>
          </div>
          <div class="team-member">
            <img src="/lisa.jpg" alt="Lisa Wagner" class="member-avatar" />
            <h3>Lisa Wagner</h3>
            <p>Vereinsleitung</p>
            <small>Koordination & Öffentlichkeitsarbeit</small>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="container">
        <h2>Zahlen & Fakten</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">2.000+</div>
            <div class="stat-label">Vögel pro Jahr</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">95%</div>
            <div class="stat-label">Erfolgreiche Auswilderungen</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Notfallbereitschaft</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">15+</div>
            <div class="stat-label">Ehrenamtliche Helfer</div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container">
        <h2>Verletzten Vogel gefunden?</h2>
        <p>Kontaktieren Sie uns sofort! Unsere Notfall-Hotline ist rund um die Uhr erreichbar.</p>
        <div class="cta-buttons">
          <router-link to="/contact" class="cta-button primary">Kontakt aufnehmen</router-link>
          <router-link to="/spenden" class="cta-button secondary">Jetzt spenden</router-link>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
</script>

<style scoped>
.about-page {
  font-family: 'Helvetica', sans-serif;
  color: #0c4b47;
    margin-top: 6rem;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
.mission-section {
  padding: 6rem 0;
  background: white;
  margin-top: 3rem;
}
.mission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}
.mission-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}
.mission-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.mission-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.story-section {
  padding: 6rem 0;
  border-radius: 8px;
  background: #f8f9fa;
  margin-top: 3rem;
}
.story-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.story-text h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}
.story-text p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.achievements {
  list-style: none;
  padding: 0;
}
.achievements li {
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}
.story-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
}
.facilities-section {
  padding: 6rem 0;
  background: white;
  border-radius: 8px;
  margin-top: 3rem;
}
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  margin-top: 3rem;
}
.facility-item {
  text-align: center;
}
.facility-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}
.facility-item h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}
.stats-section {
  padding: 6rem 0;
  background: white;
  color: #0c4b47;
  border-radius: 8px;
  margin-top: 3rem;
}
.stats-section h2 {
  color: #0c4b47;
  text-align: center;
  margin-bottom: 3rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}
.stat-item {
  text-align: center;
}
.stat-number {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.stat-label {
  font-size: 1.1rem;
}
.cta-section {
  padding: 6rem 0;
  background: #f8f9fa;
  text-align: center;
  border-radius: 8px;
  margin-top: 3rem;
}
.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}
.cta-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
}
.cta-button {
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
}
.cta-button.primary {
  background: #0c4b47;
  color: white;
}
.cta-button.secondary {
  background: #0c4b47;
  color: white;
}
.cta-button:hover {
  background: linear-gradient(135deg, #097a6a 0%, #0a3a36 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
}
@media (max-width: 768px) {
  .hero-section,
  .story-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .mission-grid,
  .facilities-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
h2 {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
}
.team-section {
  padding: 6rem 0;
  background: #f8f9fa;
  border-radius: 8px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  margin-top: 3rem;
}

.team-member {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.member-avatar {
  font-size: 4rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  width: 100px;
  height: 150px;
  object-fit: cover;
}

.team-member h3 {
  margin-bottom: 0.5rem;
}
</style>