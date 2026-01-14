# E‑Mail Implementierung — Kurzbeschreibung

Diese Datei beschreibt kurz, wie E‑Mails im Projekt implementiert sind, welche Komponenten beteiligt sind und wie du die Einstellungen testen oder anpassen kannst.

## Tech‑Stack
- Backend: Node.js (Express)
- Datenbank: MariaDB / MySQL
- E‑Mail: Brevo (SMTP früher, jetzt HTTP Transactional API)
- Versandbibliothek: ursprünglich `nodemailer` (für SMTP), jetzt HTTP‑Requests an Brevo API
- Deployment: Docker Compose

## Wo liegt die Logik
- Hauptimplementierung: `src/server/server.js`
- DB‑Schema / Initialisierung: `src/server/init.sql`

## Auslöser
- POST `/api/appointments` legt einen Termin in die DB und startet anschließend einen asynchronen (fire‑and‑forget) Block, der:
  1. Admin‑E‑Mailadressen aus der DB liest
  2. `sendAppointmentEmail(appointment, recipients)` aufruft

## Versand (wie es jetzt funktioniert)
- Statt SMTP (Port 587/465) wird die Brevo Transactional HTTP API (`https://api.brevo.com/v3/smtp/email`) verwendet.
- Vorteile: HTTPS (Port 443) ist in der Regel nicht blockiert, stabilere Auslieferung und bessere Fehlercodes.
- Die Funktion erzeugt sowohl Plain‑Text als auch HTML‑Versionen (Template) und sendet JSON per HTTPS.

## Wichtige Umgebungsvariablen (`.env`)
- `BREVO_API_KEY` : Brevo Transactional / API v3 Key (wird im Header `api-key` gesendet)
- `EMAIL_FROM` : Absenderadresse (muss in Brevo als Sender/Domain verifiziert sein)
- (DB/JWT Variablen bleiben unverändert: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `JWT_SECRET`)

## Fehlerbehandlung
- E‑Mail‑Versand ist non‑fatal: Termin wird trotzdem erstellt, Fehler werden im Serverlog geloggt.
- Typische Fehler und Behebung:
  - `401 Key not found`: falscher Key‑Typ (SMTP Passwort statt HTTP API Key) → neuen Transactional API Key in Brevo erzeugen und `BREVO_API_KEY` setzen.
  - `valid sender email required`: `EMAIL_FROM` nicht verifiziert in Brevo → Sender/Domain verifizieren.
  - Netzwerk‑Timeouts bei SMTP: früheres Problem bei Port 587/465 (Firewall/Provider); Nutzung der HTTP API umgangen diese Blockade.

## Kleine technische Anpassungen
- `appointment_date` wird vor dem DB‑Write auf `YYYY-MM-DD` normalisiert, um MySQL DATE‑Fehler zu vermeiden.

## Test / Schnellbefehle
- Schlüssel und Sender in `.env` setzen, Backend neu starten:

```bash
# in Projektroot
sed -i '/^BREVO_API_KEY=/d' .env
echo "BREVO_API_KEY=DEIN_API_KEY_HIER" >> .env
sed -i '/^EMAIL_FROM=/d' .env
echo "EMAIL_FROM=verified@yourdomain.tld" >> .env

# Backend neu starten
docker compose up -d --no-deps --force-recreate backend
sleep 5

# Token holen + Termin anlegen (Test)
TOKEN=$(curl -s -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"test123"}' | sed -n 's/.*"token":"\([^\"]*\)".*/\1/p')
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Testmail","appointment_date":"2026-01-24","appointment_time":"10:00","notes":"Test"}'

# Logs prüfen
docker logs wildvogelreha-backend --tail 80 | grep -i -E "Brevo|Email sent|❌|Error sending appointment email|valid sender"
```

## Aufräumen / Entfernte Dateien
- Temporäre Migrationen und Testskripte entfernt: `src/server/migration_fix_images.sql`, `src/server/migration_fix_all_images.sql`, `src/server/scripts/check_emails_and_send_test.js`.
- `server.js` und `init.sql` wurden nicht entfernt.

## Offene Punkte
- DB‑Schema: Warnungen zu fehlenden Tabellen/Spalten (`audit_logs`, `deleted_at`) sind weiterhin vorhanden; können bei Bedarf automatisch ergänzt werden (ich kann das übernehmen).

---
Datei erstellt: `src/server/EMAIL_IMPLEMENTATION.md`
