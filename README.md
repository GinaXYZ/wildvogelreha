# Wildvogelreha

Wichtig: Dieses Projekt wurde ausschließlich erstellt, um meine Fähigkeiten zu entwickeln und zu demonstrieren. Es dient als Portfolio- oder Lernprojekt und ist nicht für den produktiven Einsatz, medizinische Beratung oder echte Tierverwaltung gedacht.

Ein Webprojekt zur Unterstützung einer Wildvogel­rehabilitation — Informationsseite, Terminverwaltung, Shop und interaktive Profile für betreute Vögel (Projektzwecke).

**Tech-Stack:** Vue 3 (Vite), Node.js-Backend, SQLite/Postgres (server/init.sql), Docker + nginx (docker-compose.yml, nginx.conf)

Kurzbeschreibung
- Darstellung von betreuten Vögeln, Team und Projekten
- Online-Shop/Spendenmöglichkeit
- Nutzer-Accounts mit Terminbuchung für Einlieferungen und Abholungen
- Administrationsbereich für Terminkoordination, Bildverwaltung und Beiträge

Wichtigste Projekt-Dateien und Ordner
- `src/` — Vue-Frontend-Komponenten (z. B. `src/components/`)
- `server/` — Node-Backend, Migrationen und SQL-Skripte
- `public/` — Statische Assets (Bilder)
- `docker-compose.yml`, `nginx.conf` — Container- & Webserver-Konfiguration
- `tests/` — Unit-Tests mit Vitest

Voraussetzungen
- Node.js 18+ und npm oder yarn
- Optional: Docker & Docker Compose

Lokale Entwicklung
1. Repository klonen
   `git clone <repo>`
2. Projektabhängigkeiten installieren
   `npm install`
3. Entwicklungsserver starten
   `npm run dev`

Backend lokal (optional separate Schritte)
1. In das Server-Verzeichnis wechseln
   `cd server`
2. Abhängigkeiten installieren und Server starten
   `npm install`
   `npm start`
3. Datenbank-Initialisierung: `server/init.sql` und `server/migration_fix_images.sql`.

Build & Deployment
- Produktion bauen: `npm run build`
- Mit Docker starten: `docker-compose up --build`

Tests
- Unit-Tests ausführen: `npm run test` oder `npx vitest`

Konfiguration
- Setze Umgebungsvariablen für Backend (z. B. DB-URL, SMTP, PORT). Eine `.env.example` kann hinzugefügt werden.

Contributing
- Contributions willkommen: Branch erstellen, PR öffnen und Änderungen beschreiben.

Lizenz
- Es liegt derzeit keine Lizenzdatei bei. Falls du dieses Projekt teilen möchtest, füge bitte eine passende Lizenz (`LICENSE`) hinzu.

Kontakt & Hinweise
- Dieses Repository zeigt persönliche Entwicklungsarbeiten. Für produktive Projekte, Tierarzt- oder Reha-Einsätze bitte eine spezialisierte, geprüfte Anwendung verwenden.

---

Wenn du möchtest, ergänze ich noch eine `.env.example`, detaillierte Deploy-Anweisungen oder einen kurzen Maintainer-Text mit Kontaktinformationen.
