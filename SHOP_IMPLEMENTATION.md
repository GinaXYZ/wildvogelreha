
# Shop-Implementierung

Kurzüberblick:
Produkte anzeigen, Warenkorb verwalten, Checkout starten und Bestellungen auf dem Server anlegen.

Frontend (Components):
- `Shop.vue`: Produktliste, Filter, Pagination; lädt Daten via `GET /api/products`.
- `ShopEmbed.vue`: External-Shop-Widget einbetten (falls vorhanden).
- `cart.vue` + `cartState.js`: zentrale Store-Logik (z. B. Composition API oder Vuex/Pinia), persistiert in `localStorage`.

Checkout-Flow (empfohlen):
1. Nutzer prüft Warenkorb → `POST /api/cart/validate` (optional)
2. `POST /api/orders` auf Server mit bereinigten Artikel-IDs und Menge
3. Server validiert Preise/Verfügbarkeit und erstellt Zahlungs-Session (z. B. Stripe Checkout Session)
4. Redirect zu Zahlungsanbieter oder Payment UI; nach Erfolg Webhook-Verarbeitung und Bestellstatus auf `paid`

Server-Endpunkte (Beispiele):
- `GET /api/products?limit=20&page=1` – Produkte
- `GET /api/products/:id` – Einzelprodukt
- `POST /api/orders` – Bestellung erstellen (auth empfohlen)
- `POST /api/webhooks/stripe` – Zahlungswebhook

Datenmodell (Kurz):
- Product { id, title, slug, price_cents, stock, images:[] }
- Order { id, user_id, items:[{product_id, qty, price_cents}], total_cents, status }

Zahlungsintegration / Sicherheit:
- Verwende Stripe/PayPal SDKs; erstelle die Checkout-Session serverseitig.
- Validierung: Preise und Stock-Nachprüfung auf Server zwingend.
- Keine Karteninfo auf eigenem Server speichern, nur Token/Session-IDs.

Beispiel: Bestellung anlegen (Payload)

```
POST /api/orders
{
	"items": [{"productId": 123, "qty": 2}],
	"shipping": {"name":"Max Mustermann","address":"..."}
}
```

Offene Aufgaben (Shop-spezifisch):
- Cart-Reconciliation: Serverseitige Validierung und automatisches Repricing beim Checkout.
- Checkout-Resilienz: Retry-Logik, idempotency keys und robuste Webhook-Verarbeitung (Stripe/PayPal).
- Bild-Performance: Thumbnails, Lazy-Loading und responsive srcset-Generierung für Produktbilder.
- Inventory-Alerts: Low-Stock-Benachrichtigungen und Admin-Dashboard für Nachbestellungen.
- Steuer- & Versandlogik: regionspezifische Steuerberechnung und flexible Versandprofile implementieren.
