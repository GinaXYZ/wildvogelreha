# IHK-Abschlussprojekt: Terminverwaltungssystem

**Auszubildende:** Georgina Jankowski  
**Ausbildungsberuf:** Fachinformatiker für Anwendungsentwicklung  
**Projektdauer:** 80 Stunden (40h Planung/Doku, 40h Implementierung)  
**Datum:** 12.01.2026

---

## Projektidee

Entwicklung eines webbasierten Terminverwaltungssystems für die Wildvogel-Rehastation Waabs e.V. zur digitalen Planung von Pflege- und Behandlungsterminen. Das System ersetzt die aktuelle papierbasierte Terminverwaltung und ermöglicht zentrale, mehrbenutzerbasierte Koordination.

---

## Kernfunktionen

**Terminverwaltung:**
- Termine erstellen, bearbeiten, löschen (CRUD)
- Zuweisung an Mitarbeiter
- Verknüpfung mit Vögeln aus bestehender Datenbank
- Priorisierung und Kategorisierung nach Termintyp
- Status-Tracking (geplant, in Bearbeitung, erledigt, abgesagt)

**Kalenderansicht:**
- Wochen- und Monatsansicht
- Farbcodierung nach Priorität
- Filterung nach Mitarbeiter, Vogel oder Status

**Zusatzfeatures:**
- Wiederkehrende Termine
- CSV-Export
- Browser-Benachrichtigungen
- Nur für Admin/Staff-Accounts zugänglich

---

## Technischer Stack

**Frontend:** Vue.js 3, Vue Router, Pinia, Kalender-Bibliothek  
**Backend:** Node.js, Express.js, RESTful API, JWT-Auth  
**Datenbank:** MySQL  
**Deployment:** Docker (Frontend, Backend, DB als Container)  
**Versionsverwaltung:** Git

---

## Zeitplanung (80 Stunden)

**Planung & Dokumentation (40h):**
- Anforderungsanalyse, Use-Cases: 8h
- Datenmodell, ER-Diagramme: 7h
- Wireframes, UI-Konzept: 5h
- API-Dokumentation: 4h
- Projektdokumentation (IHK): 12h
- Testing-Dokumentation: 4h

**Implementierung (40h):**
- Datenbank-Setup, Schema: 5h
- Backend (API-Endpunkte): 15h
- Frontend (Komponenten, Kalender): 15h
- Docker-Setup: 3h
- Testing: 2h

---

## Liefergegenstände

- Lauffähige Webanwendung
- Datenbank mit vollständigem Schema
- RESTful API
- Docker-Konfiguration
- Projektdokumentation gemäß IHK-Vorgaben

---

## Nutzen

- Zentrale digitale Terminverwaltung
- Vermeidung von Terminüberschneidungen
- Verbesserte Kommunikation zwischen Mitarbeitern
- Zeitersparnis ca. 3-5h pro Woche
