# Deployment Anleitung - Wildvogelreha

## Problem gelöst: Frontend-Änderungen werden nicht sichtbar

### Root Cause
Der `frontend-builder` Service hat das `dist`-Verzeichnis im Container gebaut, aber es wurde nicht persistent gespeichert. Das `frontend` Service versuchte, ein nicht existierendes `./dist` vom Host zu mounten.

### Lösung
Verwendung eines **Named Volume** (`dist_volume`), das von beiden Services geteilt wird:
- `frontend-builder` baut die Dateien und speichert sie in `dist_volume`
- `frontend` (nginx) liest die Dateien aus `dist_volume`

---

## Deployment auf dem Server

### 1. Code aktualisieren
```bash
cd /root/Wildvogelreha
git pull origin main
```

### 2. Alte Container und Volumes stoppen & entfernen
```bash
docker-compose down -v
```

**Wichtig:** `-v` entfernt auch die Volumes. Das ist nötig, um das neue `dist_volume` sauber zu erstellen.

### 3. Alte dist-Reste aufräumen (falls vorhanden)
```bash
rm -rf dist/
```

### 4. Container neu bauen und starten
```bash
docker-compose up -d
```

**Was passiert:**
1. `frontend-builder` startet zuerst
2. Führt `npm install` und `npm run build` aus
3. Speichert `dist/` in `dist_volume`
4. Container stoppt erfolgreich
5. `frontend` (nginx) startet und mounted `dist_volume` als read-only
6. Webseite ist mit aktuellen Änderungen verfügbar

### 5. Logs prüfen
```bash
# Builder-Logs (sollte "Built successfully" oder ähnliches zeigen)
docker logs wildvogelreha-builder

# Frontend-Logs (nginx sollte starten)
docker logs wildvogelreha-frontend

# Alle Services prüfen
docker-compose ps
```

### 6. Testen im Browser
1. **Cache leeren**: Strg+Shift+R (Chrome/Firefox) oder Strg+F5
2. **Service Worker entfernen** (falls vorhanden):
   - Chrome: F12 → Application → Service Workers → Unregister
   - Firefox: F12 → Application → Service Workers → Unregister
3. Website neu laden: https://wildvogelreha-stuttgart.de

---

## Troubleshooting

### Problem: Builder scheitert
```bash
docker logs wildvogelreha-builder
```
→ Fehler in `npm install` oder `npm run build`?
→ Prüfe `package.json`, Node-Version, Dependencies

### Problem: Nginx zeigt 404 oder alte Dateien
```bash
# Prüfe, ob dist_volume befüllt wurde
docker run --rm -v wildvogelreha_dist_volume:/data alpine ls -la /data

# Sollte index.html, assets/, etc. zeigen
```

### Problem: Container startet nicht
```bash
docker-compose logs frontend
docker-compose logs backend
```

### Volume manuell inspizieren
```bash
# Volume-Inhalt anzeigen
docker run --rm -v wildvogelreha_dist_volume:/data alpine ls -laR /data

# Volume löschen und neu erstellen
docker-compose down -v
docker-compose up -d
```

---

## Bei zukünftigen Frontend-Änderungen

### Schnelles Rebuild (ohne Downtime für Backend/DB)
```bash
# Nur Builder neu starten
docker-compose up -d --force-recreate frontend-builder

# Warten bis Build fertig (Logs beobachten)
docker logs -f wildvogelreha-builder

# Nginx neu starten, um neue Dateien zu laden
docker-compose restart frontend
```

### Vollständiges Rebuild
```bash
docker-compose down
docker-compose up -d
```

---

## Architektur-Übersicht

```
┌─────────────────────┐
│  frontend-builder   │ (node:18-alpine)
│  - npm install      │
│  - npm run build    │
│  - dist → Volume    │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ dist_volume  │ (Named Volume)
    └──────┬───────┘
           │
           ▼
┌──────────────────────┐
│     frontend         │ (nginx:alpine)
│  - Mounted Volume    │
│  - Port 80/443       │
│  - Serves HTML/JS    │
└──────────────────────┘
```

---

## Vorteile dieser Lösung

✅ **Build im Container**: Konsistente Node/npm-Version
✅ **Kein Host-Dependency**: Kein lokales `npm install` auf dem Server nötig
✅ **Atomic Deployment**: Builder muss erfolgreich sein, bevor nginx startet
✅ **Volume-basiert**: Schneller als Bind-Mounts, plattformunabhängig
✅ **Reproduzierbar**: Gleiche Umgebung in Dev/Staging/Production

---

## Alternative: Multi-Stage Dockerfile (Future Enhancement)

Für noch saubereres Deployment könnte man einen Multi-Stage-Build verwenden:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

Dann in `docker-compose.yml`:
```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile
  ports:
    - "80:80"
```

Dies würde den `frontend-builder` Service überflüssig machen.
