
# Profil-Implementierung

Kurzüberblick:
Verwaltung von Nutzerprofilen: anzeigen, editieren, Avatar-Uploads und sensible Felder schützen.

Frontend:
- `Profile.vue`: lädt `GET /api/me` und zeigt editierbare Felder an. Änderungen per `PUT /api/me` senden.
- Avatar-Upload: Bild auswählen → `POST /api/me/avatar` (FormData), danach Profil aktualisieren.

Server-Endpunkte (Beispiel):
- `GET /api/me` – aktuelles Profil
- `PUT /api/me` – Profil aktualisieren (validieren: allowedFields)
- `POST /api/me/avatar` – Upload (resize, store)

Datei-Handling & Validierung:
- Max-Dateigröße (z. B. 2MB), erlaubte MIME-Types (image/jpeg, image/png).
- Beim Upload: Bild skalieren (thumb/medium) mit `sharp` oder ähnlichem und in `public/avatars` oder S3 speichern.

Datenschutz & Security:
- Nur erlaubte Felder vom Client akzeptieren; sensitive Felder (z. B. roles, isAdmin) serverseitig schützen.
- Changes auditieren wenn nötig.

Beispiel: Update-Payload

```
PUT /api/me
{
	"name":"Georg",
	"phone":"0123456789"
}

Offene Aufgaben (Profil-spezifisch):
- Avatar-Workflow: Cropping, resizing und CDN-Delivery sowie Fallback-Default-Avatare.
- E-Mail-Änderung: Verified email-change flow mit Token-Link und Rollback-Möglichkeit.
- Datenexport & Löschung: GDPR-konforme Datenexport- und Account-Deletion-Workflows.
- Feldvalidierung: Serverseitige Whitelist für editierbare Felder und Rate-Limits für Änderungen.
- Social Login: Optionale OAuth-Provider-Anbindung (Google, Facebook) mit Account-Linking.
```
