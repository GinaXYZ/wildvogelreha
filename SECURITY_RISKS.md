# Security Risks & Fixes – Wildvogelreha

## 1. Server & Backend
- **Secrets in .env:** Sicherstellen, dass `.env` nicht im Repository liegt und alle Secrets (JWT, DB, API-Keys) nur dort stehen.
- **CORS:** Whitelist ist offen für mehrere Domains. Prüfen, ob alle Domains wirklich benötigt werden.
- **Datenbank:** SQLite ist für Produktion nicht optimal. Empfehlung: MariaDB/PostgreSQL (wird in Docker genutzt, gut!).
- **SQL-Injection:** Prepared Statements werden genutzt, aber alle Query-Parameter regelmäßig prüfen.
- **Rate Limiting:** Aktiv, aber ggf. weitere DDoS-Schutzmaßnahmen (z.B. Cloudflare) sinnvoll.
- **Audit-Logs:** Vorhanden, aber prüfen, ob sensible Daten geloggt werden.

## 2. API, Authentifizierung, Autorisierung
- **Endpoint-Schutz:** Schreibende Endpunkte sind mit Auth und Rollen geschützt. Prüfen, ob das für alle gilt.
- **JWT-Invalidierung:** Nach Logout/Passwort-Reset werden JWTs nicht invalidiert. Risiko: Gestohlene Tokens bleiben gültig bis Ablauf.
- **Fehlerausgaben:** Prüfen, ob keine internen Fehlerdetails (Stacktraces, SQL-Fehler) an den Client gehen.
- **Datenlecks:** Prüfen, ob sensible Daten (z.B. E-Mail, Rollen) nicht unnötig im Frontend landen.

## 3. Frontend, Deployment, Secrets Management
- **Frontend:** Prüfen, ob keine sensiblen Daten im Client-Code oder in API-Responses landen.
- **Vite Proxy:** Proxy auf `/api` ist offen für localhost, aber im Deployment sollte nur HTTPS genutzt werden.
- **nginx.conf:** Security-Header sind gesetzt (gut!), aber CSP ist nicht aktiv. Empfehlung: CSP-Header ergänzen.
- **Docker:** DB-Port wird nicht nach außen freigegeben (gut!). Prüfen, ob keine sensiblen Volumes/Dateien nach außen gemountet werden.
- **Secrets:** `.env`-Datei nicht im Repo, keine Secrets in Docker-Compose oder im Code.
- **HTTPS:** nginx leitet HTTP auf HTTPS um (gut!). SSL-Zertifikate müssen gültig und sicher gespeichert werden.

---

**Empfohlene Fixes:**
- CSP-Header in nginx ergänzen
- JWT-Invalidierung nach Logout/Passwort-Reset implementieren
- Fehlerausgaben auf generische Messages beschränken
- Secrets niemals ins Repo pushen
- CORS-Whitelist regelmäßig prüfen
- Keine sensiblen Daten im Frontend/API-Response

> Diese Liste regelmäßig aktualisieren und als Checkliste für Security-Reviews nutzen!