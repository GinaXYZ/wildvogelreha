
# Terminverwaltung (Appointments)

Kurzüberblick:
Ermöglicht Nutzern, Termine zu buchen, zu prüfen und zu verwalten. Server übernimmt Konfliktprüfung und Benachrichtigung.

Frontend (Flow):
- `Appointments.vue`: Kalenderansicht + Formular zur Terminwahl. Lädt verfügbare Slots via `GET /api/appointments/availability?date=YYYY-MM-DD`.
- Beim Absenden: `POST /api/appointments` mit Nutzer-ID (auth) und Slot-Info.

Server-Endpunkte (Beispiele):
- `GET /api/appointments?userId=...` – eigene Termine
- `GET /api/appointments/availability?date=...` – freie Slots
- `POST /api/appointments` – Termin buchen (prüft Konflikte)
- `PUT /api/appointments/:id` – ändern
- `DELETE /api/appointments/:id` – stornieren

Konflikt-/Verfügbarkeitsprüfung:
- Server-seitig: atomare DB-Transaktion oder Locking prüfen, um Doppelbuchungen zu verhindern.
- Alternativ: Reservierungs-Timeout (z. B. 10 Minuten) bevor endgültig bestätigt.

Datenmodell (Vorschlag):
- Appointment { id, user_id, start_utc, end_utc, type, notes, status }

Benachrichtigungen:
- Bei Buchung / Änderung / Storno: E-Mail an Nutzer (siehe `EMAIL_IMPLEMENTATION.md`), optional SMS.

Zeit & Darstellung:
- Speichern in UTC; im Client in lokale Zeitzone konvertieren. Klare UI-Angabe der Zeitzone.

Beispiel: Buchung

```
POST /api/appointments
{
	"start": "2026-01-20T10:00:00Z",
	"end": "2026-01-20T10:30:00Z",
	"type": "Beratung"
}
```

Offene Aufgaben (Terminverwaltung-spezifisch):
- Slot-Reservierung: Implementiere Hold/Reserve-Mechanismus mit Timeout, um Rennbedingungen zu vermeiden.
- Kalender-Synchronisation: iCal/Google-Calendar Export/Sync und Einladungseinladungen per E-Mail.
- Erinnerungen: E-Mail-/SMS-Reminders (24h, 1h) mit Retry/Failure-Handling.
- Admin-Tools: Bulk-Reschedule, Blackout-Dates und Manuelle Anpassungen mit Audit-Log.
- Zeitzonen-Handling: UI/DB-Tests für DST-Übergänge und konsistente UTC-Speicherung.
