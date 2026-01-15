
# Kontakt-Implementierung

Kurzüberblick:
Kontaktformular im Frontend, Server nimmt die Nachricht entgegen und leitet sie weiter (z. B. per SMTP oder E-Mail-Service).

Frontend:
- `Contact.vue`: Felder `name`, `email`, `subject`, `message`. Clientseitige Validierung (Pflichtfelder, E-Mail-Format).
- Beim Absenden: `POST /api/contact` und Nutzer über Erfolg/Fehler informieren.

Server (Empfehlung):
- `POST /api/contact`: Rate-Limit und Captcha validieren, Eingaben sanitizen, E-Mail an interne Adresse senden.
- Optional: Speichern der Anfrage in DB (`contacts` table) für Nachverfolgung.

E-Mail Integration:
- Lege `EMAIL_IMPLEMENTATION.md` zugrunde: z.B. SendGrid, Mailgun oder SMTP via Nodemailer.
- Template für interne Nachricht + Bestätigungs-E-Mail an Absender.

Spam-Schutz & Sicherheit:
- IP-basiertes Rate-Limiting (z. B. `express-rate-limit`).
- reCAPTCHA v2/v3 oder hCaptcha hinzufügen.
- Input sanitization und max length für Felder.

Beispiel: Server-Payload

```
POST /api/contact
{
	"name":"Anna",
	"email":"anna@example.com",
	"subject":"Frage zum Projekt",
	"message":"Hallo, ich habe eine Frage..."
}
```

Antworten:
- 200 OK bei Erfolg
- 400 Bad Request bei Validierungsfehlern
- 429 Too Many Requests bei Ratelimit


Offene Aufgaben (Kontakt-spezifisch):
- Anti-Spam: Adaptive Rate-Limits, Honeypot-Felder und reCAPTCHA-Integration testen und konfigurieren.
- Sender-Bestätigung: Automatische Bestätigungs-E-Mail an Absender sowie Ticket-Erstellung im internen System.
- Attachment Handling: Sichere Uploads für Anhänge mit Größenlimits, Viren-Scan und temporärer Speicherung.
- Admin-Inbox: Tagging, Priorisierung, Suche und Export-Funktion für eingehende Anfragen.
- Datenschutz: Lösch- und Aufbewahrungsrichtlinien (GDPR), Opt-Out-Mechanismen und Audit-Logs.
