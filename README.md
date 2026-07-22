# Web App for Bird Rescues

Web App for Bird Rescues is a full-stack web application designed as a digital platform for a fictional wild bird rehabilitation centre. It combines public information pages with bird profiles, blog content, appointment management, user accounts and administrative tools.

The project was created as a learning and portfolio application. It is not intended for medical advice, real animal records or production use by an active rescue organisation.

## Project status

The application contains a working Vue frontend, an Express API and a MariaDB-backed data layer. Docker configuration is included for running the frontend, backend, database and nginx reverse proxy together.

The repository represents an actively developed portfolio project. Before real-world use, it would require a full security review, additional testing, accessibility checks and operational safeguards.

## Features

- Public information pages for a bird rescue organisation
- Profiles for birds currently or previously in care
- Blog and news content
- Product and donation-related pages
- User registration and login
- JWT-based authentication
- Staff and administrator roles
- Appointment creation and coordination
- Administrative management of content and images
- Email notifications for appointments
- Audit logging for administrative actions
- Soft deletion for selected records
- Input validation and sanitisation
- Rate limiting for general, login and registration requests

## Technology

### Frontend

- Vue 3
- Vite
- Vue Router
- Pinia
- Leaflet
- Vitest

### Backend

- Node.js
- Express 5
- MariaDB / MySQL
- JSON Web Tokens
- bcrypt
- Nodemailer and the Brevo API
- Helmet
- express-rate-limit

### Infrastructure

- Docker Compose
- nginx
- Certbot configuration
- Persistent database volumes

## Architecture

```text
Browser
   |
Vue single-page application
   |
nginx reverse proxy
   |
Express REST API
   |
MariaDB
```

The frontend handles navigation, public content and authenticated user interfaces. The Express backend provides the API, authentication, authorisation and database access. MariaDB stores users, appointments, bird-related content, products, blog posts and audit information.

The Docker setup separates the database, backend, frontend build and nginx services. The database is only exposed inside the Docker network.

## Security measures

The project currently includes:

- Password hashing with bcrypt
- JWT authentication
- Separate staff and administrator checks
- Required environment-based JWT configuration
- Request rate limiting
- Security headers through Helmet
- Input validation and sanitisation
- Parameterised database queries
- Audit records for selected administrative actions

These measures are part of the learning project and do not replace an independent security assessment.

## Getting started

### Requirements

- Node.js 18 or later
- npm
- MariaDB or MySQL for local development
- Docker and Docker Compose for the container setup

### Frontend development

```bash
git clone https://github.com/GinaXYZ/WebApp-for-Bird-Rescues.git
cd WebApp-for-Bird-Rescues
npm install
npm run dev
```

The Vite development server will print the local address in the terminal.

### Backend development

```bash
cd src/server
npm install
npm run dev
```

The backend expects database credentials and a `JWT_SECRET` through environment variables. The API runs on port `3000` by default.

Typical variables include:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET
BREVO_API_KEY
EMAIL_FROM
```

Do not commit real credentials or API keys.

### Docker

Create a local `.env` file with the required database and application settings, then run:

```bash
docker compose up --build
```

The Compose configuration starts MariaDB, the Express backend, a frontend build container and nginx. It also includes Certbot configuration for certificate renewal.

## Tests

Run the frontend unit tests with:

```bash
npm run test:unit
```

The current automated test coverage focuses on the Vue application. Additional backend and integration tests are still required.

## Project structure

```text
WebApp-for-Bird-Rescues/
├── src/                 Vue application
│   ├── components/      Reusable interface components
│   └── server/          Express API and SQL setup
├── public/              Static images and assets
├── tests/               Frontend tests
├── docker-compose.yml   Multi-container development setup
├── nginx.conf           Reverse proxy configuration
└── package.json         Frontend dependencies and scripts
```

## Known limitations

- The project is not intended for real medical or animal-management use
- Backend test coverage is incomplete
- Operational monitoring and production logging are not included
- Email delivery requires an external provider configuration
- Deployment settings must be reviewed for the target environment
- Accessibility and browser compatibility require further testing

## Possible next steps

- Add backend unit and integration tests
- Add API documentation
- Add automated database migrations
- Improve accessibility and keyboard navigation
- Add image upload validation and storage abstraction
- Add structured monitoring and error reporting
- Add a GitHub Actions build and test workflow
- Deploy a demonstration environment using a managed cloud platform

## Author

Gina  
[GitHub](https://github.com/GinaXYZ) | [Portfolio](https://ginaxyz.net)
