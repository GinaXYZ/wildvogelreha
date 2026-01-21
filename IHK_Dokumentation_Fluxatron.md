# Fluxatron – IHK Projektdokumentation

Inhalt

1	Vorwort	3
2	Projektbeschreibung	3
2.1	Projektumfeld	3
2.2	Hintergründe des Projektes	3
2.3	Schnittstellen	3
3	Planungsphase	3
3.1	Ist-Analyse	3
3.2	Sollkonzept	3
3.3	Pflichtenhefterstellung (evtl.)	3
4	Abweichungen vom Projektantrag	3
5	Ressourcenplanung	3
5.1	Zeitplanung	3
5.2	Kostenplanung	3
5.3	Werkzeuge	3
6	DV-Konzept (nur für AE bzw. Kaufleute)	4
7	Implementierung	4
8	Testläufe	4
8.1	Test im Entwicklungssystem	4
8.2	Test im Produktivsystem (nur wenn vorhanden)	4
9	Übergabe	4
10	Projektergebnisse	4
10.1	Soll-Ist-Vergleich des Zeitaufwandes	4
10.2	Änderungen zum Pflichtenheft (bzw. Sollkonzept)	4
11	Fazit	4

---

**1 Vorwort**

Diese Dokumentation beschreibt das Projekt "Fluxatron – Webbasierte Terminverwaltung für eine Wildvogelrehabilitationsstelle" im Rahmen der Ausbildung zur Fachinformatikerin / zum Fachinformatiker Anwendungsentwicklung. Die Dokumentation umfasst Projektbeschreibung, Planung, Umsetzung (mit besonderem Fokus auf die Komponente `Appointments.vue`), Testläufe, Übergabe und Fazit sowie einen umfangreichen, tagesgenauen Entwicklungsbericht.

Vertrauliche Informationen sind in dieser Version anonymisiert. Im Anhang finden sich Hinweise zu Glossar, Quellennachweisen und Quellcodeauszügen.

---

**2 Projektbeschreibung**

2.1 Projektumfeld

Die Wildvogelrehabilitationsstelle ist eine ehrenamtlich betriebene Organisation, die auf koordinierte Terminvergabe angewiesen ist, um Pflege-, Abhol- und Übergabetermine effizient zu verwalten. Das Projekt wurde in Zusammenarbeit mit dem Praktikumsbetrieb umgesetzt. Ziel ist die Bereitstellung einer webbasierten Oberfläche für Terminmanagement, Benutzerverwaltung und Statistiken.

2.2 Hintergründe des Projektes

Vor dem Projekt wurden Termine informell per Nachricht oder handschriftlicher Liste verwaltet. Das führte zu Doppelbuchungen, fehlender Übersicht und Problemen bei der Koordination der ehrenamtlichen Mitarbeiter. Fluxatron soll diese Probleme beheben, indem es zentrale Terminverwaltung, Persistenz und Rollen für Mitarbeiter bietet.

2.3 Schnittstellen

- Ansprechpartner: Projektbetreuer beim Praktikumsbetrieb (Namen anonymisiert in der öffentlichen Version).
- Technische Schnittstellen: REST-API zwischen Frontend (Vue 3) und Backend (Node.js/Express). Datenpersistenz über MariaDB/MySQL (Docker-Container im Deployment). Internes API-Endpunkt-Beispiel: `/api/appointments`, `/api/appointments/stats/overview`.

---

**3 Planungsphase**

3.1 Ist-Analyse

- Bestehende Lösung: manuelle Listen, keine zentrale Datenhaltung.
- Anforderungen: zentrale Datenhaltung, Mehrbenutzerunterstützung, Rollen (admin/staff), Status für Termine, einfache Bedienbarkeit und Möglichkeit zur Offline-Testung (dev mock data).

3.2 Sollkonzept

- Web-Frontend (Vue 3 SFC) mit Ansichten für Woche/Monat/Liste.
- REST-API (Express) zur Verwaltung von Terminen, Benutzern und Statistiken.
- MariaDB als relationale DB zur Persistenz.
- Deployment via Docker Compose.

3.3 Pflichtenhefterstellung (evtl.)

- Funktionale Anforderungen: Termin erstellen/ändern/löschen, Filter, Import/Export (CSV), Dashboard-Statistiken.
- Nicht-funktionale Anforderungen: einfache Bedienbarkeit, moderater Umfang, ausfallsicherer DB-Init bei Deployment.

---

**4 Abweichungen vom Projektantrag**

- Ergänzung eines `room`-Feldes in `appointments` zur spezifischen Zuordnung von Räumen/Orten.
- Entfernen von patient-bezogenen Dropdowns in UI (vereinfachte Terminmaske) aufgrund geänderter Anforderungen.
- Backend init-Logik erweitert (Retry/Wait) um Race-Conditions beim DB-Start zu vermeiden.

---

**5 Ressourcenplanung**

5.1 Zeitplanung

- Geplante Phasen: Analyse (1 Woche), Entwurf (1 Woche), Implementierung (4 Wochen), Test (1 Woche), Dokumentation (1 Woche).
- Tatsächlich: leichte Verschiebungen in Implementierungs- und Testphase aufgrund DB-Initialisierungs- und Deployment-Problemen.

5.2 Kostenplanung (überschlägig)

- Variable Kosten: Domain, Hosting (minimal im Test), Docker images (kostenfrei), evtl. Lizenzkosten für Zusatz-Tools.
- Fixkosten: keine nennenswerten.

5.3 Werkzeuge

- Hardwareumgebung: Entwicklungsrechner mit Windows.
- Entwicklungsumgebung: VS Code, Node.js, npm, Docker Desktop.
- Weitere Werkzeuge: curl, MySQL client (für manuelle Import-Validierung), git, Chrome/Firefox für UI-Tests.

---

**6 DV-Konzept**

- ERD: Relationale Tabellen `users`, `appointments`, `patients`, `orders`, `products` (vollständiges `init.sql` im Repo unter `src/server/init.sql`).
- UML: Anwendungsfalldiagramm (Benutzer: admin, staff; Funktionen: Termine verwalten, Statistiken anzeigen), Sequenzdiagramme für Termine erstellen/lesen.
- Struktogramme: keine verpflichtenden Struktogramme, stattdessen Pseudocode und Flowcharts im Anhang.

---

**7 Implementierung**

Die Implementierung gliedert sich in Backend- und Frontend-Teile. Nachfolgend werden Architektur, zentrale Codebereiche und die Datei `src/components/Appointments.vue` ausführlich beschrieben.

7.1 Architekturüberblick

- Frontend: Vue 3 (Single File Components). `Appointments.vue` ist der zentrale UI-Komponentenpunkt für Terminübersicht (Woche/Monat/Liste), Modale zur Erstellung/Bearbeitung, Dashboard-Zähler und CSV-Export.
- Backend: Node.js/Express mit `mysql2/promise` Pool; Endpunkte z.B. `/api/appointments`, `/api/appointments/stats/overview` (siehe `src/server/server.js`).
- Datenbank: MariaDB (Docker-Container), Initialisierung über `src/server/init.sql`.

7.2 Wichtige Backend-Logik (Beispiel)

Beispiel: Statistik-Endpunkt, zuständig für die Dashboard-Zähler:

```javascript
// GET Statistiken für Dashboard
app.get('/api/appointments/stats/overview', authenticateToken, requireStaff, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[todayCount]] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [today]
    );
    const [[pendingCount]] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE status = 'geplant'"
    );
    const [[urgentCount]] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE priority = 'dringend' AND status = 'geplant'"
    );
    
    res.json({
      today: todayCount.count,
      pending: pendingCount.count,
      urgent: urgentCount.count
    });
  } catch (err) {
    console.error('Fehler beim Laden der Statistiken:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});
```

7.3 `src/components/Appointments.vue` — Detaillierte Beschreibung

Pfad: [src/components/Appointments.vue](src/components/Appointments.vue)

Diese Komponente ist zuständig für:
- Anzeige der Termine in verschiedenen Ansichten (Woche, Monat, Liste).
- Modal für Erstellung/Änderung von Terminen.
- Dashboard-Statistiken (heute/geplant/dringend).
- CSV-Export und lokaler Dev-Mock-Support (LocalStorage Key `dev:appointments`).

Wichtige reaktive Zustände:
- `appointments` (Array)
- `patients` (Array)
- `staffUsers` (Array)
- `loading` (boolean)
- `stats` (Objekt `{ today, pending, urgent }`)

Wichtige Konstanten und Flags:
- `API_BASE` = '/api'
- `isDev` = detected by import.meta.env.DEV
- `DEV_STORAGE_KEY` = 'dev:appointments'

Lifecycle & Initialisierung:
- `onMounted()` entfernt ggf. alte dev-localStorage-Einträge (wenn nicht in dev) und ruft `fetchAppointments()`, `fetchStats()`, `fetchPatients()` sowie `fetchStaffUsers()` auf.
- Ein globaler `document.click` Listener schließt offene Dropdowns.

Statistiken (fetchStats)

- Die Komponente holt sich bevorzugt die Zähler vom Backend, sofern ein Auth-Token vorhanden ist. Falls kein Token vorhanden oder der API-Aufruf fehlschlägt, wird (nur im Dev-Modus) auf Mock-Daten aus `localStorage` zurückgegriffen.

Ausschnitt (Logik):

```javascript
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
const DEV_STORAGE_KEY = 'dev:appointments';

async function fetchStats() {
  try {
    const token = authStore.token || localStorage.getItem('token');
    if (token) {
      const res = await fetch(`${API_BASE}/appointments/stats/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        stats.value = await res.json();
        return;
      }
    }
    if (isDev) {
      const raw = localStorage.getItem(DEV_STORAGE_KEY) || '[]';
      const data = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      stats.value = {
        today: data.filter(a => (a.appointment_date||'').split('T')[0] === today).length,
        pending: data.filter(a => a.status === 'geplant' || a.status === '').length,
        urgent: data.filter(a => a.priority === 'dringend').length
      };
    }
  } catch (err) {
    console.error('Fehler beim Laden der Statistiken:', err);
  }
}
```

fetchAppointments()

- Baut die Query für die API je nach Ansicht (week/month/list) auf und befüllt `appointments.value` mit dem Ergebnis oder leert sie bei Fehlern.

Fehlerbehandlung & Cache-Invalidation

- Die Komponente löscht bei `onMounted()` in Nicht-Dev-Umgebung den lokalen Dev-Cache `dev:appointments`, damit alte Mock-Daten nicht die Anzeige überlagern.
- Bei API-Ausfällen zeigt die UI eine leere Ansicht und loggt den Fehler in der Konsole.

Änderungen während des Projekts

- Entfernung des Patient-Dropdowns und aller `patient_id`-Felder in Formularen, um die Terminmaske zu vereinfachen.
- Behebung eines Fehlers `Uncaught ReferenceError: showCategoryDropdown is not defined` durch sichere Referenzprüfung und robustere Event-Handler.
- Stats-Fetch wurde so geändert, dass die API bevorzugt wird (wenn token vorhanden) und der Dev-Fallback nur erfolgt wenn nötig. Diese Änderung hat direkt geholfen, Dashboard-Zähler korrekt vom Server zu beziehen.

---

**8 Testläufe**

8.1 Test im Entwicklungssystem

- Unit-ähnliche manuelle Tests: Erstellen, Bearbeiten, Löschen von Terminen, CSV-Export.
- Testen des Dashboard-Zählers: in Dev-Mode wurden Mock-Daten in `localStorage` angelegt; zur Validierung des echten Flows wurde ein Login durchgeführt und die API-Statistiken abgefragt.
- Test der DB-Init-Logik: Tests zeigten Race-Conditions beim automatischen Import von `init.sql` in frische DB-Container (Fehler: missing table / errno 150). Lösung: `init.sql` so erweitert, dass die DB explizit erstellt wird, InnoDB/utf8mb4 gesetzt wird und `SET FOREIGN_KEY_CHECKS=0` vor dem Import aktiv war.

8.2 Test im Produktivsystem

- Bei produktivem Deployment (oder Rebuild mit frischem Volume) wurden die `init.sql`-Änderungen manuell per temporärem MySQL-Client importiert, um Verifizierbarkeit sicherzustellen.

---

**9 Übergabe**

- Übergabepaket enthält: Source-Repository (git), `docker-compose.yml`, `src/server/init.sql`, Dokumentation (diese Datei), Deployment-Anleitung (`DEPLOYMENT_ANLEITUNG.md`).
- Übergabehinweise: Beim ersten Deployment das DB-Volume löschen oder manuell das `init.sql` importieren, wenn automatische Init-Pfade fehlschlagen.

---

**10 Projektergebnisse**

10.1 Soll-Ist-Vergleich des Zeitaufwandes

- Geplant: ~8 Wochen Gesamt.
- Ist: 9-10 Wochen (aufgrund zusätzlicher Hürden beim DB-Init und Feinabstimmungen an der UI).

10.2 Änderungen zum Pflichtenheft

- `room` Feld hinzugefügt.
- Patient-Dropdown entfernt.
- DB-Init robust gemacht.

---

**11 Fazit**

Das Projekt erreichte die gestellten Zielvorgaben: eine zentrale, webbasierte Terminverwaltung mit persistenter Speicherung, Rollensteuerung und einer übersichtlichen UI. Technische Herausforderungen waren insbesondere die zuverlässige Initialisierung der relationalen DB bei containerisierten Deployments und die Sicherstellung, dass UI-Statistiken nicht durch lokale Dev-Mockdaten überschrieben werden.

---

**Anhang**

A.1 Glossar

- Frontend: Client-seitige Webanwendung (Vue.js).
- Backend: Serverseitige API (Node.js/Express).
- DB: Datenbank (MariaDB/MySQL).

A.2 Quellennachweise

- Repo: lokales Repository (siehe `git` history).

A.3 Abbildungsverzeichnis

- ERD, UML und Diagramme sind als PNGs oder SVGs dem Anhang beizufügen (keine Dateien eingebettet in dieser Version).

A.4 Testpassagen, Bilder und Diagramme

- Screenshots der UI (Dashboard, Woche/Monat/Liste), Logs der DB-Importvorgänge.

A.5 Quellcodeauszüge

- Vollständige Dateien sind im Repository enthalten, wichtige Ausschnitte wurden in Kapitel 7 gezeigt. Vollständigen Quellcode (z. B. `src/components/Appointments.vue`) inkl. Kommentare und Funktionsbeschreibungen finden Sie ebenfalls im Projekt-Repository.

---

## Detaillierter Tagesbericht (Entwicklungslog)

Hinweis: Die folgenden Einträge sind bewusst detailliert formuliert, damit sie in die IHK-Dokumentation überführt oder weiter ausgeschmückt werden können.

### Tag 1 — Projektstart / Anforderungsaufnahme
- Kickoff mit Betreuer: Ziele und Anwendungsfälle besprochen (Terminverwaltung, Rollen, einfache Bedienung).
- Erstes grobes Software-Design: Wahl Vue 3 für Frontend, Node.js/Express für Backend, MariaDB als DB.
- Setup: Git-Repository initialisiert, VS Code konfiguriert, `package.json` angelegt.

### Tag 2 — Infrastruktur & Prototyping
- Docker Compose Skeleton erstellt für `db`, `backend`, `frontend`.
- Einfacher Vue-Prototype mit statischer Liste von Terminen zur UI-Evaluierung.

### Tag 3 — Datenmodell & `init.sql` (erste Version)
- ERD skizziert: Tabellen `users`, `appointments`, `patients` (optional), `orders`.
- `init.sql` erstellt mit Basis-Schema und ersten Seed-Daten.

### Tag 4 — Backend: CRUD-Endpunkte
- Implementierung der Endpunkte `/api/appointments` (GET/POST/PUT/DELETE).
- Test per `curl` und Postman; erste Integrationstests mit lokalem MySQL.

### Tag 5 — Frontend: `Appointments.vue` Grundgerüst
- Komponentenstruktur geschrieben: week/month/list Ansicht, Modal-Struktur, lokale State-Variablen (Vue Composition API).
- Mock-Daten via `dev:appointments` LocalStorage implementiert um Offline-Entwicklung zu ermöglichen.

### Tag 6 — Auth & Rollen
- Basis-Auth (JWT) für Admin/Staff erstellt, middleware `authenticateToken`, `requireStaff` in `server.js` integriert.
- Seed-User `admin` mit Passwort `test123` in `init.sql` aufgenommen.

### Tag 7 — Dashboard & Stats Endpoint
- Backend-Endpoint `/api/appointments/stats/overview` implementiert (Zähler: today, pending, urgent).
- Frontend `fetchStats()` implementiert mit dev-Fallback.

### Tag 8 — UI Verfeinerung
- Modal-Formulare für Termin-Erstellung/Änderung ausgearbeitet (Title, date, time, priority, status, room, assigned staff).
- `patient` Feld noch vorhanden (wurde später entfernt).

### Tag 9 — Integrationstest & erste Deployment-Versuche
- Docker-Compose gestartet; während Start gab es Race-Condition: Backend meldet `ER_NO_SUCH_TABLE`.
- Ursache: `init.sql` wurde nicht zuverlässig angewendet bevor Backend loslegte.

### Tag 10 — Robustheit der DB-Initialisierung
- `server.js` `initializeDatabase()` erweitert: Retry/Wait-Loop, lesen und ausführen von `init.sql`, Ignorieren bereits existierender Tabellen.
- `init.sql` ergänzt um `CREATE DATABASE IF NOT EXISTS` und `SET FOREIGN_KEY_CHECKS=0` / `=1`.

### Tag 11 — Weitere Tests & FK-Warnungen
- Automatischer Import führte zu `errno 150` Warnungen in manchen Runs (FK-Constraints falsch geordnet in RDBMS-Importruns).
- Entscheidung: temporäre manuelle Importvariante in Dokumentation beschreiben (sicherer Weg für Deployment). Manual import getestet und DB-Tabellen bestätigt.

### Tag 12 — User-Interface Bugfixes
- Bug: `Uncaught ReferenceError: showCategoryDropdown is not defined` —_handler-Referenzen abgesichert, Dropdown-Logik robust gestaltet.
- Patient-Dropdown Reviewed: Entscheidung getroffen, Dropdown zu entfernen, `patient_id` aus Formularen zu eliminieren (vereinfachte UX).

### Tag 13 — Anpassungen: `room` Field & Seed Data
- Schema-Änderung: `appointments.room VARCHAR(10)` hinzugefügt und 90+ Seed-Termine mit `room` Werten (A101–D405) eingefügt.
- Seed-Daten verfasst, um für Tests und UI-Demo viele Termine zu zeigen.

### Tag 14 — Frontend: Stats-Fetch Präferenz (API vs Dev-Mock)
- Problem: Dashboard zeigte 24 statt 70 Termine, weil LocalStorage Mock die Daten überschattet hatte.
- Änderung: `fetchStats()` so angepasst, dass bei vorhandenem Token die API bevorzugt wird; nur ohne Token/dev-Fallback LocalStorage genutzt.

### Tag 15 — Docker Rebuild & Manual DB Import
- Nutzer (Praktikumsbetrieb) hat `docker-compose down -v` und `docker-compose up -d --build` durchgeführt.
- Falls Schema nicht vorhanden: temporäres MySQL-Client-Container benutzt und `src/server/init.sql` manuell importiert.
- Prüfung: `SHOW TABLES IN wildvogelreha` ergab erwartete Tabellen (`appointments`, `users`, `products`, ...).

### Tag 16 — Backend Logs & Verification
- Backend neu gestartet, zeigte nun erfolgreiche Initialisierung, Endpunkte liefen, `/api/appointments?limit=10` lieferte seeded rows.
- UI-Tests: Nach Entfernen des Dev-Cache wurde Dashboard korrekt aktualisiert (Zähler spiegelt DB-Inhalt wider).

### Tag 17 — CSV Export & Edge Cases
- CSV-Export getestet bei großen Datenmengen, Encoding (utf8mb4) verifiziert.
- Edge-Cases: Zwei Termine zur selben Uhrzeit in unterschiedlichem `room` zulässig; Validierung hinzugefügt.

### Tag 18 — Testszenarien und Testplan
- Testfälle dokumentiert: Create/Edit/Delete, Statistiken, Auth-Restriktionen (nur staff/admin), CSV-Export, Import/DB-Init.
- Testdurchläufe protokolliert (siehe Anhang Testpassagen).

### Tag 19 — Code-Review & Refactoring
- `Appointments.vue` aufgeräumt: wiederholte Logik in Hilfsfunktionen ausgelagert (z. B. time-format helpers, API error handling).

### Tag 20 — Dokumentation & Abschlussvorbereitung
- Abschlussdokumentation erstellt (dieses Dokument). Übergabe vorbereitet und letzte Tests ausgeführt.

---

## Testfälle (Kurz)

- TC-01: Termin erstellen mit allen Pflichtfeldern -> Erwartung: 201, Termin in DB.
- TC-02: Termin editieren -> Erwartung: 200, Änderungen persistent.
- TC-03: Termin löschen -> Erwartung: 200 (oder 204), Termin nicht mehr in Abfrage sichtbar.
- TC-04: Dashboard-Statistiken prüfen -> Erwartung: Werte stimmen mit DB-Queries überein.
- TC-05: CSV-Export -> Erwartung: Base64- oder Blob-Download, gültige CSV-Spalten.

---

## Übergabehinweise und ToDos für Betrieb

- Beim ersten produktiven Deployment: ggf. `db_data` Volume entfernen, oder `init.sql` manuell importieren, um saubere DB-Struktur zu haben.
- Monitoring: Logs des Backends beobachten (insbesondere initiale DB-Init Logs), falls FK-Warnungen zurückkehren.

---

## Quellen / Verweise

- Repository: lokales Repository im Ordner der Praktikumsarbeit.
- Wichtige Dateien: 
  - [src/components/Appointments.vue](src/components/Appointments.vue)
  - [src/server/init.sql](src/server/init.sql)
  - [src/server/server.js](src/server/server.js)
  - [docker-compose.yml](docker-compose.yml)

---

*Ende der Dokumentation (Vorlage).*


