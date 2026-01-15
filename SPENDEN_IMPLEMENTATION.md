
# Spenden-Implementierung

Kurzüberblick:
Handhabt einmalige und wiederkehrende Spenden, Zahlungsintegration und Quittungs-Versand.

Frontend:
- `Spenden.vue`: Betrag wählen, optional Nutzerdaten; Submit initialisiert Zahlung via `POST /api/donations`.

Server-Endpunkte & Flow:
- `POST /api/donations` – Erstelle Donation-Intent und erzeuge Zahlungs-Session (z. B. Stripe Checkout Session).
- `POST /api/webhooks/stripe` – Webhook: Payment succeeded → Bestellung/Donation als `completed` markieren und Quittung per E-Mail versenden.

Zahlungsanbieter & Sicherheit:
- Verwende Stripe/PayPal: Token/Session serverseitig erstellen, kein direktes Handling von Kartendaten.
- Verifiziere Webhooks (Stripe-Signature) und verhindere Replay-Attacken.

Quittungen & Reporting:
- Nach erfolgreich bestätigter Zahlung: E-Mail-Quittung (PDF optional) an Spender senden (siehe `EMAIL_IMPLEMENTATION.md`).
- Buchungs-Export: Admin-Endpoint `GET /api/donations?from=YYYY-MM-DD&to=YYYY-MM-DD`.

Beispiel: Donation-Request

```
POST /api/donations
{
	"amount_cents": 5000,
	"currency": "EUR",
	"email": "spender@example.com",
	"recurring": false
}
```

Offene Aufgaben (Spenden-spezifisch):
- Quittungen & Reporting: Automatische PDF-Quittungen erstellen und per E-Mail versenden.
- Recurring Payments: Subscription-Setup, Billing-Retry-Logik und Subscriber-Management.
- Transparenz: Spendenziele, Fortschrittsbalken und öffentliche Spendenstatistiken implementieren.
- Webhook-Sicherheit: Signatur-Verifikation und idempotency bei Zahlungs-Provider-Events.
- Datenschutz & Steuer: Spender-Datenexport, Aufbewahrungsfristen und Opt-In für Kommunikation.
