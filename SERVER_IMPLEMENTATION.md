
# Server-Implementierung (Überblick)

Kurzüberblick:
Architektur, Endpunkte, Middleware, DB-Migrationen und Deployment-Notizen.

Organisation & Dateien:
- `server/server.js`: Express-App / Server-Entrypoint
- `server/init.sql`, `server/migration_fix_images.sql`: DB-Initialisierung & Migrationen

API-Design & Routing:
- Basis: `/api/*` mit modularen Routern (`/api/auth`, `/api/posts`, `/api/products`, `/api/orders`, `/api/appointments`, `/api/contact`).
- Verwende strukturierte Controller-Services (clear separation: controller → service → repo).

Middleware-Empfehlungen:
- Auth-Middleware (JWT validation)
- Error-Handling-Middleware (Standardisierte Fehlerantworten)
- Logging: `morgan` oder `pino`
- Security: `helmet`, CORS-Konfiguration, Rate-Limit

Datenbank & Migrationen:
- Versioniere Migrationen (z. B. `knex`, `sequelize-cli` oder plain SQL mit Ordnerstruktur).
- Backups und Migrations-Tests vor Deployment prüfen.

Umgebungsvariablen (wichtig):
- `DATABASE_URL`, `JWT_SECRET`, `SMTP_*` oder `SENDGRID_API_KEY`, `STRIPE_SECRET`

Deployment:
- `docker-compose.yml` für lokale/Prod-Stacks; nginx als Reverse-Proxy (siehe `nginx.conf`).
- Healthchecks hinzufügen, Restart-Policy in Compose/Swarm/Kubernetes setzen.

Observability & Operations:
- Error Tracking (Sentry), App-Metrics (Prometheus) und Logs zentralisieren.

Beispiel: Start-Skript (lokal)

```
npm --prefix server run start
```

Offene Aufgaben (Server-spezifisch):
- Observability: Implementiere /health, /metrics und zentralisiertes Logging + Alerting.
- Secrets & Config: Integrate secrets manager (Vault or KMS) and runtime config validation.
- Migrations & Rollback: CI-Tests für DB-Migrationen und Safe-Rollback-Strategien.
- API-Governance: Versioning, rate-limits per-route and standardized error formats.
- Backups & DR: Automatisierte Backups, restore-tests and disaster recovery runbooks.
