
# Authentifizierungs-Implementierung

Kurzüberblick:
Beschreibt Login, Registrierung, Session-Handling und Schutz für geschützte Ressourcen.

Frontend (Flow):
- `Register.vue`: Formulareingaben validieren (E-Mail-Format, Passwort-Länge, Passwort-Stärke). Sende `POST /api/register`.
- `Login.vue`: Authentifizieren mit `POST /api/login`, Token (JWT) empfangen.
- Speicherung: Bevorzuge `HttpOnly` Secure Cookie für das Access-Token; falls `localStorage` verwendet wird, nur für nicht-sensitive Fälle.
- Router-Guards: `router/router.js` prüft Token/Gültigkeit und leitet zu `/login` wenn nötig.

Server (Flow):
- `POST /api/register`: Payload validieren, Passwort mit `bcrypt` (salt) hashen, Nutzer in DB anlegen.
- `POST /api/login`: E-Mail/Passwort prüfen, bei Erfolg `JWT` ausstellen (Payload: userId, roles), optional Refresh-Token ausgeben.
- `GET /api/me`: Auth-Middleware extrahiert User aus JWT und gibt Profildaten zurück.

Wichtige Bibliotheken / Tools:
- `bcrypt` oder `bcryptjs` für Hashing
- `jsonwebtoken` für JWT
- Express-Middleware: `express-jwt` oder custom middleware
- Optional: `helmet`, `rate-limit` für zusätzliche Sicherheit

Sicherheitsentscheidungen:
- Tokens in `HttpOnly` Cookies speichern (Secure + SameSite) erhöht Sicherheit gegen XSS.
- Refresh-Token-Strategie: Refresh-Token in DB oder in Cookie (Rotation empfohlen).
- Passwort-Richtlinie: min 8 Zeichen + Mischung aus Zahlen/Symbolen; Brute-force Schutz mit Rate-Limit.

Beispiel: cURL Login

```
curl -X POST /api/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"secret"}'
```

Offene Aufgaben:
- Entscheiden: Cookie vs localStorage für Tokens
- Implementieren: Refresh-Token-Mechanismus
- Audit: Passwort-Reset-Flow und E-Mail-Verifikation
