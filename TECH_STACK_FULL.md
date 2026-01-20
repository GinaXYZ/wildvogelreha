# Wildvogelreha — Full Tech Stack

## Kurzüberblick
- Single Page App (SPA) frontend: Vue 3 + Vite
- State management: Pinia
- Routing: Vue Router
- Backend: Node.js + Express
- Database: MariaDB (MySQL compatible)
- Deployment: Docker Compose (nginx frontend, node backend, mariadb)
- E‑Mail: Brevo Transactional HTTP API (HTTP requests from backend)
- Build system: Vite (dev / build / preview)

---

## Hauptkomponenten
- Frontend: Vue 3 Single File Components (SFC)
- Backend: Express REST API (JWT auth, bcrypt password hashing)
- Database: relational schema in MariaDB (users, appointments, patients, orders, etc.)
- Deployment: multi‑service Docker Compose with separate builder, nginx and mariadb services

---

## Frontend (client)
- Core framework: vue 3 (vue)
- Tooling: vite (@vitejs/plugin-vue)
- State: pinia
- Router: vue-router
- Mapping: leaflet + vue3-leaflet
- Drag & drop / sorting: vuedraggable
- Utilities: uuid (id generation)
- CSS / assets: static files in `public/` and images in `src/assets/`

Key frontend files and folders
- `src/main.js` — app bootstrap
- `src/App.vue` — root component
- `src/components/` — components (Appointments.vue, Staff.vue, Home.vue, etc.)
- `src/router/router.js` — routes
- `src/api.js` — API base URL helper
- `vite.config.js` — Vite configuration (dev proxy, build)

Dependencies (from root `package.json`)
- vue @^3.5.13
- vite @^6.3.5
- @vitejs/plugin-vue @^5.2.3
- pinia @^3.0.2
- vue-router @^4.5.1
- leaflet @^1.9.4
- vue3-leaflet @^1.0.50
- vuedraggable @^4.1.0
- uuid @^11.1.0

Note: the repository uses a single package.json for frontend and shared dependencies; backend-specific deps are in `src/server/package.json`.

---

## Backend (server)
- Runtime: Node.js (images use node:18-alpine in Docker Compose)
- Web framework: express (Express 5)
- DB client: mysql2 (Promise API)
- Authentication & security:
  - jsonwebtoken (JWT) for stateless sessions
  - bcrypt for password hashing
  - helmet, cors, express-rate-limit, validator for basic hardening and input validation
- Email sending:
  - nodemailer present in dependencies (historical / fallback)
  - current email sending implemented via Brevo Transactional HTTP API (see `EMAIL_IMPLEMENTATION.md`)

Key backend files and folders
- `src/server/server.js` — Express API, routes, auth and email logic
- `src/server/init.sql` — schema and seed data (admin/test users)
- `src/server/package.json` — backend-specific dependencies and scripts

Dependencies (from `src/server/package.json`)
- express @^5.1.0
- mysql2 @^3.14.1
- cors @^2.8.5
- jsonwebtoken @^9.0.2
- bcrypt @^6.0.0
- uuid @^11.1.0
- dotenv @^16.5.0
- express-rate-limit @^7.5.0
- helmet @^8.0.0
- validator @^13.12.0
- nodemailer @^6.9.3
- dev: nodemon @^3.0.2

---

## Database
- Engine: MariaDB (MySQL compatible) — used in Docker Compose
- Client lib: mysql2 (Node.js)
- Schema and seed data: `src/server/init.sql`
- Reasons: easy MySQL compatibility, familiar relational model for users/appointments/orders

---

## Deployment & Infrastructure
- Orchestration: Docker Compose (`docker-compose.yml`)
  - Services typically included in this repo:
    - db: mariadb (image: mariadb)
    - backend: node (mounts `src/server`, runs Express API)
    - frontend-builder: node (builds frontend into a shared volume)
    - frontend (static): nginx:alpine serving built `dist`
    - certbot (optional): for LetsEncrypt certificates
  - Named volume: used to share `dist` between builder and nginx
- Reverse proxy / static: nginx (configs present: `nginx.conf`, `nginx-temp.conf`)
- Ports conventionally used:
  - backend: 3000
  - frontend: 80/443

Notes on build & deploy
- Build frontend in a builder container with `npm run build` (Vite) and copy artifacts to a volume
- Start services with `docker-compose up -d`
- Ensure backend healthcheck / readiness before nginx proxying in production

---

## Third-party services
- Brevo (formerly Sendinblue) Transactional Email API for outgoing emails
  - API calls made from backend to Brevo HTTP endpoints
  - API key stored in env var `BREVO_API_KEY`

---

## Environment variables (common)
- JWT_SECRET — JWT signing secret
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME — database connection
- BREVO_API_KEY — Brevo HTTP API key
- EMAIL_FROM — verified sender address used with Brevo
- NODE_ENV, PORT, and other standard vars

---

## Developer / Build tools
- Node.js (project uses Node 18 images in Docker)
- npm
- Vite (dev server and build)
- nodemon (backend dev/watch)
- Docker & Docker Compose for local full-stack dev and production

Local development quick commands (common)
- Frontend dev (in repo root):
  - npm install
  - npm run dev
- Backend dev (in `src/server`):
  - cd src/server
  - npm install
  - npm run dev
- Full stack with Docker Compose (preferred for parity):
  - docker-compose up --build -d

Adjust paths/commands if you run from Windows PowerShell (use the proper path separators and `docker compose` if using newer Docker CLI).

---

## Notable files (where to look)
- `package.json` (root) — main deps used by app
- `src/server/package.json` — backend deps and scripts
- `vite.config.js` — dev proxy and build config
- `docker-compose.yml` — service definitions
- `nginx.conf`, `nginx-temp.conf` — nginx configuration
- `src/server/server.js` — backend server implementation
- `src/server/init.sql` — DB schema and seed data (admin/test users)
- `EMAIL_IMPLEMENTATION.md` — details about email sending implementation
- `src/components/` — important Vue components (Appointments.vue, Staff.vue, Login.vue, etc.)

---

## Recommendations / notes
- For reliable email delivery consider moving Brevo calls to a background job queue (BullMQ + Redis) with retries and dead-letter handling.
- Add container healthchecks and dependency readiness checks (wait-for / dockerize / start script with retries).
- Store secrets in a secure secret manager for production (Vault, cloud secrets, or Docker secrets) instead of plain `.env`.
- Consider migrating to TypeScript to improve maintainability across frontend and backend.

---

If you want, I can also:
- Add a short QuickStart section with exact PowerShell commands for this repo, or
- Produce a simplified architecture diagram (ASCII or mermaid) and include it in this file.