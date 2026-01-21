# Wildvogelreha

Willkommen zum Wildvogelreha-Projekt! Dieses Projekt ist eine moderne Webanwendung zur Unterstützung von Wildvogelauffangstationen. Sie bietet Funktionen für Terminverwaltung, Spenden, Blog, Shop, Kontakt und vieles mehr. Die Anwendung ist mit einem modernen Tech-Stack umgesetzt und für den produktiven Einsatz vorbereitet.

## Inhaltsverzeichnis
- [Überblick](#überblick)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Entwicklung](#entwicklung)
- [Deployment](#deployment)
- [Verzeichnisstruktur](#verzeichnisstruktur)
- [Mitwirken](#mitwirken)
- [Lizenz](#lizenz)

## Überblick
Wildvogelreha ist eine Plattform, die es ermöglicht, Wildvogelstationen digital zu unterstützen. Sie vereinfacht die Kommunikation, Terminbuchung, Spendenabwicklung und vieles mehr. Ziel ist es, die Arbeit der Stationen effizienter und transparenter zu gestalten.

## Features
- **Terminbuchung:** Online-Terminvereinbarung für Vogelabgaben und Beratungen
- **Spenden:** Integration verschiedener Spendenmöglichkeiten
- **Shop:** Verkauf von Produkten zur Unterstützung der Station
- **Blog:** Aktuelle Beiträge und News
- **Kontaktformular:** Direkte Kontaktaufnahme
- **Benutzerprofile:** Registrierung, Login, Profilverwaltung
- **Admin-Funktionen:** Verwaltung von Terminen, Blogposts, Shopartikeln
- **Responsive Design:** Optimiert für Desktop und Mobilgeräte

## Tech Stack
- **Frontend:** Vue.js (Vite), JavaScript, CSS
- **Backend:** Node.js (Express)
- **Datenbank:** SQLite (kann leicht auf PostgreSQL/MySQL erweitert werden)
- **Sonstiges:** Docker, Nginx, REST API

## Installation
### Voraussetzungen
- Node.js (empfohlen: >= 18.x)
- npm
- Docker (optional, für Deployment)

### Lokale Entwicklung
1. **Repository klonen:**
   ```bash
   git clone https://github.com/DEIN-USERNAME/Wildvogelreha.git
   cd Wildvogelreha
   ```
2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   cd src/server
   npm install
   cd ../..
   ```
3. **Frontend starten:**
   ```bash
   npm run dev
   ```
4. **Backend starten:**
   ```bash
   cd src/server
   node server.js
   ```
5. **App im Browser öffnen:**
   [http://localhost:5173](http://localhost:5173)

### Mit Docker
1. **Docker Compose starten:**
   ```bash
   docker-compose up --build
   ```
2. **App im Browser öffnen:**
   [http://localhost](http://localhost)

## Deployment
Für den produktiven Einsatz empfiehlt sich die Nutzung von Docker und Nginx. Siehe dazu die Datei `DEPLOYMENT_ANLEITUNG.md` und das Beispiel `nginx.conf`.

## Verzeichnisstruktur
- `src/` – Quellcode der Anwendung
  - `components/` – Vue-Komponenten
  - `assets/` – Statische Assets (Bilder, CSS)
  - `server/` – Backend (Node.js, Express)
  - `data/` – Beispiel- und Seed-Daten
  - `router/` – Vue Router-Konfiguration
  - `services/` – API-Services
- `public/` – Öffentliche Dateien
- `docker-compose.yml` – Docker-Konfiguration
- `nginx.conf` – Beispielkonfiguration für Nginx
- `*.md` – Dokumentation zu einzelnen Modulen

## Mitwirken
Beiträge sind herzlich willkommen! Bitte beachte die folgenden Schritte:
1. Forke das Repository
2. Erstelle einen neuen Branch (`feature/DeinFeature`)
3. Committe deine Änderungen
4. Stelle einen Pull Request

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für weitere Informationen.

---

**Kontakt:**
Für Fragen oder Anregungen: [Kontaktformular](https://wildvogelreha.de/kontakt) oder direkt im Repository ein Issue eröffnen.

Viel Spaß beim Mitwirken und vielen Dank für deine Unterstützung der Wildvogelhilfe!