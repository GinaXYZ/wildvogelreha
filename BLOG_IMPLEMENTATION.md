
# Blog-Implementierung

Kurzüberblick:
Verwalten und Ausliefern von Blog-Posts; öffentliche Anzeige und optionales Admin-Backend zum Erstellen.

Frontend:
- `Blog.vue`: List-Seite mit Pagination (`GET /api/posts?page=1&limit=10`).
- Einzelpost-Route `/blog/:slug` lädt `GET /api/posts/:slug`.
- Editor: für Admins `POST/PUT /api/posts` mit Markdown-Inhalt oder HTML (sanitize vor speichern).

Server-Endpunkte (Beispiele):
- `GET /api/posts` – Liste (pagination, filter nach tag/author)
- `GET /api/posts/:slug` – Einzelansicht
- `POST /api/posts` – neuen Beitrag anlegen (auth: admin)
- `PUT /api/posts/:id` – Beitrag aktualisieren (auth: admin)

Datenmodell (Vorschlag):
- Post { id, title, slug, excerpt, content_markdown, content_html, author_id, published_at, tags }

Rendering & SEO:
- Bei statischen Inhalten: Pre-rendered HTML (SSG) oder server-side rendering für bessere SEO/OG-Tags.
- Generate `content_html` serverseitig aus `content_markdown` und speichere zur schnellen Auslieferung.

Moderation & Sicherheit:
- Inhalte sanitizen (z. B. `dompurify`) bevor HTML gespeichert/ausgeliefert wird.
- Admin-Rights prüfen; Audit-Logs für Änderungen möglich.

Beispiel: Post-Payload

```
POST /api/posts
{
	"title":"Neuer Beitrag",
	"slug":"neuer-beitrag",
	"content_markdown":"# Hallo\nInhalt",
	"tags":["news"]
}
```

Offene Aufgaben (Blog-spezifisch):
- Editor Experience: Integriere Image-Upload in den Editor, automatische Bild-Optimierung und Media-Library.
- Sanitization & Security: Markdown → HTML Pipeline mit Sanitizer, XSS-Tests und image hotlink protection.
- Publishing Workflow: Drafts, Scheduled Publishing und Rollback von veröffentlichten Beiträgen.
- Rollen & Rechte: Autoren-, Editor- und Admin-Rollen mit Approval-Flow für Beiträge.
- Performance: Caching (CDN/HTTP) und Cache-Invalidation bei Beitrag-Updates.
