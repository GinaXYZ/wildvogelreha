
# Bild-Migration & Medienverwaltung

Kurzüberblick:
Anleitung zur Migration bestehender Bildpfade, Speicherstrategie und Bildverarbeitung (Resize/Optimierung).

Speicheroptionen:
- Entwicklung: `public/` für statische Assets.
- Produktion: Object Storage (z. B. AWS S3, DigitalOcean Spaces) mit CDN voranstellen.

Migrationsempfehlung:
1. Analysiere DB-Felder mit Bildpfaden (`SELECT ... FROM ... WHERE image IS NOT NULL`).
2. Schreibe ein Script, das Pfade normalisiert (relativ → `/public/...` oder S3-URL) und teste es lokal.
3. Führe `server/migration_fix_images.sql` in Test-DB aus, prüfe Ergebnisse, dann auf Prod anwenden.

Bildverarbeitung:
- Beim Upload generate multiple sizes (`thumb`, `medium`, `large`) mit `sharp`.
- Optimiere WebP/AVIF-Ausgaben für modernere Browser.

Referenz-URLs & Cache:
- Nutze versionierte URLs (z. B. `/images/avatar-12345_v2.jpg`) oder Query-Param für Cache-Busting.

Tools & Scripts:
- Node-Script (`scripts/migrate-images.js`) zum Prüfen und Korrigieren der Pfade.
- CLI-Beispiel mit `sharp` für massenweise Umwandlung.

Beispiel-SQL (vereinfachtes Update):

```
UPDATE photos SET url = REPLACE(url, 'old/path/', '/public/images/') WHERE url LIKE 'old/path/%';
```

Offene Punkte:
- Backup vor jeder Migration
- Prüfung, ob Bilder in Content (Markdown/HTML) referenziert sind und diese ebenfalls anpassen


Offene Aufgaben (Bilder & Migration-spezifisch):
- Bulk-Optimierung: Skript zur verlustfreien Kompression und Prüfung von Checksums nach Konvertierung.
- Content-Referenzen: Tool zur Ersetzung alter Bildpfade in DB, Markdown und HTML mit Preview-Modus.
- Format-Strategie: Automatische WebP/AVIF-Konvertierung + Fallbacks und Browser-Switching-Policy.
- CDN & Cache: Invalidation-Prozess planen und Cache-Control für optimales Caching setzen.
- Rollback-Plan: Schnelle Wiederherstellung alter Pfade/Objekte und Teststrategie vor Live-Migration.
