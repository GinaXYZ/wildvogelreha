// CSV Import
app.post('/api/appointments/import-csv', authenticateToken, requireStaff, async (req, res) => {
  try {
    const appointments = req.body.appointments;
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return res.status(400).json({ error: 'Keine Termine übergeben.' });
    }

    let inserted = 0, failed = 0, errors = [];
    for (const apt of appointments) {
      try {
        // Minimal-Validierung
        const title = (apt.title || apt.Titel || '').toString().trim();
        const appointment_date = apt.appointment_date || apt.Datum || '';
        const appointment_time = apt.appointment_time || apt.Startzeit || '';
        if (!title || !appointment_date || !appointment_time) {
          failed++;
          errors.push({ row: apt, error: 'Pflichtfelder fehlen' });
          continue;
        }
        const id = uuidv4();
        const description = apt.description || apt.Beschreibung || '';
        const end_time = apt.end_time || apt.Endzeit || null;
        const category = apt.category || apt.Kategorie || null;
        const priority = apt.priority || apt.Priorität || null;
        const status = apt.status || apt.Status || 'geplant';
        const recurring = apt.recurring === 'Ja' || apt.recurring === true ? 1 : 0;
        const notes = apt.notes || apt.Notizen || '';

        // Patient und assigned_to werden optional als Name übernommen (keine Zuordnung zu IDs)
        // Erweiterbar: Suche nach existierenden Patienten/Mitarbeitern
        const query = `INSERT INTO appointments (id, title, description, appointment_date, appointment_time, end_time, category, priority, status, recurring, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [id, title, description, appointment_date, appointment_time, end_time, category, priority, status, recurring, notes];
        await pool.query(query, values);
        inserted++;
      } catch (e) {
        failed++;
        errors.push({ row: apt, error: e.message });
      }
    }
    res.json({ inserted, failed, errors });
  } catch (err) {
    console.error('Fehler beim CSV-Import:', err);
    res.status(500).json({ error: 'Fehler beim CSV-Import' });
  }
});
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const nodemailer = require('nodemailer');
const https = require('https');

const saltRounds = 10;

// JWT_SECRET MUSS in .env gesetzt sein - kein unsicherer Fallback!
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET nicht in Umgebungsvariablen gesetzt!');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shop',
});

// Datenbank-Initialisierung mit Retry (wartet, bis DB bereit ist und wendet init.sql an)
async function initializeDatabase() {
  const maxAttempts = 12; // retry for ~60s (12 * 5s)
  const delayMs = 5000;

  async function waitForConnection() {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const conn = await pool.getConnection();
        conn.release();
        return true;
      } catch (err) {
        console.log(`DB not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    return false;
  }

  try {
    console.log('Initializing database schema...');
    const ready = await waitForConnection();
    if (!ready) {
      console.error('Database did not become ready in time, skipping initialization');
      return;
    }

    const connection = await pool.getConnection();
    const initSqlPath = path.join(__dirname, 'init.sql');
    const sqlStatements = fs.readFileSync(initSqlPath, 'utf8');

    const statements = sqlStatements
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore table already exists errors (ER_TABLE_EXISTS_ERROR / code 1050)
        if (err && err.code && (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 1050)) {
          // expected on subsequent runs
        } else {
          console.warn('SQL Warning:', err && err.message ? err.message : err);
        }
      }
    }

    connection.release();
    console.log('Database initialization completed successfully');
  } catch (err) {
    console.error('Database initialization error:', err && err.message ? err.message : err);
  }
}

// Passwort-Validierung
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Passwort muss mindestens 8 Zeichen lang sein' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Passwort muss mindestens einen Großbuchstaben enthalten' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Passwort muss mindestens einen Kleinbuchstaben enthalten' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Passwort muss mindestens eine Zahl enthalten' };
  }
  return { valid: true };
}

// Input Sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return validator.escape(validator.trim(input));
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kein Token' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token abgelaufen vs. ungültig unterscheiden
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token abgelaufen', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Bitte erst anmelden.' });
    }
    req.user = user;
    next();
  });
}

// Middleware: Nur Staff/Admin
function requireStaff(req, res, next) {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  next();
}

// Middleware: Nur Admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nur Admins haben Zugriff' });
  }
  next();
}

// Audit-Log Funktion
async function logAudit(action, entityType, entityId, userId, details = null) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [uuidv4(), action, entityType, entityId, userId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Audit-Log Fehler:', err.message);
  }
}

// Email helper: uses Brevo HTTP API (no SMTP ports needed)
async function sendAppointmentEmail(appointment, recipients = []) {
  try {
    console.log('sendAppointmentEmail: Brevo API key present?', !!process.env.BREVO_API_KEY);
    
    if (!process.env.BREVO_API_KEY) {
      console.warn('sendAppointmentEmail: BREVO_API_KEY not set, skipping email');
      return;
    }

    // Format date nicely (German locale)
    const dateFormatted = new Date(appointment.appointment_date).toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeRange = appointment.end_time 
      ? `${appointment.appointment_time} – ${appointment.end_time} Uhr`
      : `${appointment.appointment_time} Uhr`;
    
    // Priority colors/labels
    const priorityLabels = { niedrig: '🟢 Niedrig', mittel: '🟡 Mittel', hoch: '🟠 Hoch', dringend: '🔴 Dringend' };
    const priorityLabel = priorityLabels[appointment.priority] || appointment.priority;
    
    // Category labels
    const categoryLabels = {
      'sprint-planung': '📋 Sprint Planning', 'team-meeting': '👥 Team Meeting', 'code-review': '🔍 Code Review',
      'deployment': '🚀 Deployment', 'testing': '✅ Testing', 'dokumentation': '📚 Documentation', 
      'planning': '🎯 Planning', 'sonstiges': '📌 Other'
    };
    const categoryLabel = categoryLabels[appointment.category] || appointment.category;

    const subject = `🗓️ Neuer Termin: ${appointment.title} – ${dateFormatted}`;
    
    // Plain text version
    const textBody = `
═══════════════════════════════════════════════════════
   APPOINTMENT NOTIFICATION - Project Management
═══════════════════════════════════════════════════════

📌 ${appointment.title}

📅 Datum:      ${dateFormatted}
🕐 Zeit:       ${timeRange}
📂 Kategorie:  ${categoryLabel}
⚡ Priorität:  ${priorityLabel}

👥 Team/Project: ${appointment.patient_name || '–'}
👤 Zugewiesen: ${appointment.assigned_firstname ? appointment.assigned_firstname + ' ' + (appointment.assigned_lastname || '') : '–'}
📊 Status:     ${appointment.status || 'geplant'}

───────────────────────────────────────────────────────
📝 Beschreibung / Notizen:
───────────────────────────────────────────────────────
${appointment.description || appointment.notes || 'Keine Beschreibung vorhanden.'}

═══════════════════════════════════════════════════════
Diese E-Mail wurde automatisch generiert.
Project Management System
═══════════════════════════════════════════════════════
`;

    // HTML version (looks great in email clients)
    const htmlBody = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0c4b47 0%, #1a6b65 100%); color: white; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">🗓️ Neuer Termin erstellt</h1>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Wildvogel Rehastation Waabs</p>
    </div>
    
    <!-- Title -->
    <div style="padding: 24px 24px 16px; border-bottom: 1px solid #eee;">
      <h2 style="margin: 0; color: #0c4b47; font-size: 20px;">${appointment.title}</h2>
    </div>
    
    <!-- Details Grid -->
    <div style="padding: 20px 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; width: 40%; color: #666;">📅 <strong>Datum</strong></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666;">🕐 <strong>Uhrzeit</strong></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${timeRange}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666;">📂 <strong>Kategorie</strong></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${categoryLabel}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666;">⚡ <strong>Priorität</strong></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${priorityLabel}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666;">🐦 <strong>Patient</strong></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${appointment.patient_name || '–'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666;">👤 <strong>Zugewiesen an</strong></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${appointment.assigned_firstname ? appointment.assigned_firstname + ' ' + (appointment.assigned_lastname || '') : '–'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #666;">📊 <strong>Status</strong></td>
          <td style="padding: 12px 0; color: #333;"><span style="background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${appointment.status || 'geplant'}</span></td>
        </tr>
      </table>
    </div>
    
    <!-- Description -->
    ${(appointment.description || appointment.notes) ? `
    <div style="padding: 0 24px 24px;">
      <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; border-left: 4px solid #0c4b47;">
        <strong style="color: #666; font-size: 12px; text-transform: uppercase;">📝 Beschreibung / Notizen</strong>
        <p style="margin: 8px 0 0; color: #333; line-height: 1.6;">${(appointment.description || appointment.notes).replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div style="background: #f9f9f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
      Diese E-Mail wurde automatisch generiert.<br>
      <strong>Wildvogel Rehastation Waabs</strong>
    </div>
    
  </div>
</body>
</html>
`;

    // Prepare email data for Brevo API
    const emailData = JSON.stringify({
      sender: { email: process.env.EMAIL_FROM || 'no-reply@wildvogelreha.de', name: 'Wildvogel Rehastation' },
      to: recipients.map(email => ({ email })),
      subject,
      textContent: textBody,
      htmlContent: htmlBody
    });

    // Send via Brevo HTTP API (port 443, never blocked)
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'Content-Length': Buffer.byteLength(emailData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Email sent successfully via Brevo API:', data);
            resolve(JSON.parse(data));
          } else {
            console.error('❌ Brevo API error:', res.statusCode, data);
            reject(new Error(`Brevo API error: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error('❌ HTTPS request error:', err);
        reject(err);
      });

      req.write(emailData);
      req.end();
    });

  } catch (err) {
    console.error('Fehler beim Senden der Termin-Email:', err && err.stack ? err.stack : err);
    // rethrow so callers can handle, but keep the stack logged
    throw err;
  }
}

const app = express();

// Security Headers mit Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Für Vue SPA deaktivieren
  crossOriginEmbedderPolicy: false
}));

// Static file serving for images from public directory
// In Docker: public folder is mounted at /app/public (server.js is in /app)
app.use('/api/images', express.static(path.join(__dirname, 'public')));

// Rate Limiting - Allgemein
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Requests pro IP
  message: { error: 'Zu viele Anfragen, bitte später erneut versuchen' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting - Login (strenger)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 5, // Max 5 Login-Versuche
  message: { error: 'Zu viele Login-Versuche, bitte 15 Minuten warten' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting - Registrierung
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 3, // Max 3 Registrierungen pro Stunde
  message: { error: 'Zu viele Registrierungen, bitte später erneut versuchen' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Trust proxy für Rate Limiting hinter nginx
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:80', 'http://ginaxyz.site', 'https://ginaxyz.site', 'http://0.0.0.0:80'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(generalLimiter); // Allgemeines Rate Limiting

// Initialize database and then start server
initializeDatabase().then(() => {
  app.listen(3000, '0.0.0.0', () => {
    console.log('API läuft auf http://0.0.0.0:3000');
    console.log('DB Host:', process.env.DB_HOST);
    console.log('Security: Helmet, Rate Limiting aktiv');
  });
}).catch(err => {
  console.error('Failed to initialize database, starting anyway:', err);
  app.listen(3000, '0.0.0.0', () => {
    console.log('API läuft auf http://0.0.0.0:3000 (ohne DB-Init)');
  });
});

app.get('/api/blog', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  
  try {
    const [results] = await pool.query(`
      SELECT id, title, content, imageUrl, category, author, date 
      FROM blog_posts 
      WHERE deleted_at IS NULL
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM blog_posts WHERE deleted_at IS NULL');
    res.json({ results, count, page, limit });
  } catch (err) {
    console.error('Fehler beim Abrufen der Blog-Einträge:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Blog-Einträge' });
  }
});

app.post('/api/blog', authenticateToken, requireStaff, async (req, res) => {
  const { title, content, imageUrl, category, author } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Titel und Inhalt sind erforderlich' });
  }
  
  // Sanitize Inputs
  const safeTitle = sanitizeInput(title);
  const safeContent = sanitizeInput(content);
  const safeAuthor = sanitizeInput(author || req.user.username);
  const safeCategory = category ? sanitizeInput(category) : null;
  
  const id = uuidv4();
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = `
    INSERT INTO blog_posts (id, title, content, imageUrl, category, author, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [id, safeTitle, safeContent, imageUrl || null, safeCategory, safeAuthor, date];
  try {
    await pool.query(query, values);
    await logAudit('CREATE', 'blog_post', id, req.user.id, { title: safeTitle });
    const newPost = { id, title: safeTitle, content: safeContent, imageUrl, category: safeCategory, author: safeAuthor, date };
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Fehler beim Erstellen des Blog-Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Blog-Eintrags' });
  }
});

app.delete('/api/blog/:id', authenticateToken, requireStaff, async (req, res) => {
  const { id } = req.params;
  // Soft-Delete statt Hard-Delete
  const query = 'UPDATE blog_posts SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL';
  try {
    const [result] = await pool.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog-Eintrag nicht gefunden' });
    }
    await logAudit('DELETE', 'blog_post', id, req.user.id);
    res.status(200).json({ message: 'Blog-Eintrag erfolgreich gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Blog-Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Blog-Eintrags' });
  }
});

// Admin utility: set every user's email to a given address (protected)
app.post('/api/admin/set-all-emails', authenticateToken, requireAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email body required' });
  try {
    const [result] = await pool.query('UPDATE users SET email = ? WHERE 1', [email]);
    await logAudit('UPDATE', 'users_emails', null, req.user.id, { updated_to: email, affectedRows: result.affectedRows });
    res.json({ message: 'updated', affectedRows: result.affectedRows });
  } catch (err) {
    console.error('Error updating all emails:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der E-Mails' });
  }
});

// Admin debug: list admin emails
app.get('/api/admin/list-emails', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, email, role FROM users WHERE email IS NOT NULL");
    res.json(rows.map(r => ({ id: r.id, email: r.email, role: r.role })));
  } catch (err) {
    console.error('Error listing emails:', err);
    res.status(500).json({ error: 'Fehler beim Auflisten der E-Mails' });
  }
});

// Admin debug: send test email for appointment id
app.post('/api/admin/send-test-email/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT a.*, p.name as patient_name, u.firstname as assigned_firstname, u.lastname as assigned_lastname, u.email as assigned_email FROM appointments a LEFT JOIN patients p ON a.patient_id = p.id LEFT JOIN users u ON a.assigned_to = u.id WHERE a.id = ?', [id]);
    const appointmentFull = (rows && rows.length) ? rows[0] : null;
    if (!appointmentFull) return res.status(404).json({ error: 'Termin nicht gefunden' });
    const [adminRows] = await pool.query("SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL");
    const adminEmails = (adminRows || []).map(r => r.email).filter(Boolean);
    const recipients = new Set(adminEmails);
    if (appointmentFull.assigned_email) recipients.add(appointmentFull.assigned_email);
    const recipList = Array.from(recipients);
    if (recipList.length === 0) return res.status(400).json({ error: 'Keine Empfänger konfiguriert' });
    const info = await sendAppointmentEmail(appointmentFull, recipList);
    res.json({ ok: true, preview: nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null, recipients: recipList });
  } catch (err) {
    console.error('Error sending test email:', err);
    res.status(500).json({ error: 'Fehler beim Senden der Test-Email' });
  }
});


app.post('/api/register', registerLimiter, async (req, res) => {
  const { username, password, firstname, lastname, email } = req.body;
  if (!username || !password || !firstname || !lastname || !email) {
    return res.status(400).json({ error: 'Alle Felder (Benutzername, Passwort, Vorname, Nachname, E-Mail) sind erforderlich' });
  }
  
  // E-Mail Validierung
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
  }
  
  // Benutzername Validierung (alphanumerisch, 3-30 Zeichen)
  if (!validator.isAlphanumeric(username) || username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Benutzername muss 3-30 alphanumerische Zeichen sein' });
  }
  
  // Passwort Validierung
  const pwValidation = validatePassword(password);
  if (!pwValidation.valid) {
    return res.status(400).json({ error: pwValidation.error });
  }
  
  const assignedRole = 'user'; // Muss mit ENUM in DB übereinstimmen: 'user', 'staff', 'admin'
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Sanitize inputs
  const safeFirstname = sanitizeInput(firstname);
  const safeLastname = sanitizeInput(lastname);
  
  const query = `
    INSERT INTO users (id, username, password, firstname, lastname, email, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [id, username, hashedPassword, safeFirstname, safeLastname, email, assignedRole];
  try {
    await pool.query(query, values);
    res.status(201).json({ message: 'Benutzer erfolgreich registriert', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Benutzername oder E-Mail existiert bereits' });
    }
    console.error('Fehler beim Registrieren:', err);
    res.status(500).json({ error: 'Fehler beim Registrieren' });
  }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
  }
  const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
  try {
    const [results] = await pool.query(query, [username]);
    const user = results[0];
    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' } // Verlängert von 2h auf 8h
    );
    res.json({
      token, 
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error('Fehler beim Login:', err);
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

// Token Refresh Endpoint
app.post('/api/refresh-token', authenticateToken, async (req, res) => {
  try {
    // Neues Token mit aktualisierten User-Daten erstellen
    const [results] = await pool.query('SELECT id, username, role FROM users WHERE id = ?', [req.user.id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }
    const user = results[0];
    const newToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token: newToken, expiresIn: '8h' });
  } catch (err) {
    console.error('Fehler beim Token-Refresh:', err);
    res.status(500).json({ error: 'Fehler beim Token-Refresh' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    console.error('Keine Benutzer-ID bereitgestellt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const query = 'SELECT id, username, firstname, lastname, email, date, role FROM users WHERE id = ?';
  try {
    const [results] = await pool.query(query, [userId]);
    if (results.length === 0) {
      console.error('Benutzer nicht gefunden');
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }
    const user = results[0];
    res.json({
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      date: user.date,
    });
  } catch (err) {
    console.error('Fehler bei der Datenbankabfrage:', err);
    res.status(500).json({ error: 'Fehler bei der Datenbankabfrage' });
  }
});


app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const category = req.query.category; 
  const searchTerm = req.query.search; 

  // Note: products table doesn't have `deleted_at` column, use a neutral clause
  let whereClauses = ['1=1'];
  let queryParams = [];

  if (category && category !== 'Alle') {
    whereClauses.push("category = ?");
    queryParams.push(category);
  }

  if (searchTerm) {
    whereClauses.push("(title LIKE ? OR description LIKE ?)");
    queryParams.push(`%${searchTerm}%`);
    queryParams.push(`%${searchTerm}%`);
  }

  const whereCondition = `WHERE ${whereClauses.join(' AND ')}`;

  const productsQuery = `
    SELECT idproducts AS id, title, price, description, category, amountLeft, image
    FROM products
    ${whereCondition}
    ORDER BY title ASC
    LIMIT ?
    OFFSET ?
  `;

  const finalProductsParams = [...queryParams, limit, offset];

  const countQuery = `
    SELECT COUNT(*) as count
    FROM products
    ${whereCondition}
  `;

  const finalCountParams = [...queryParams];


  try {
    const [results] = await pool.query(productsQuery, finalProductsParams);
    const [[{ count }]] = await pool.query(countQuery, finalCountParams);

    res.json({
      results: results,
      count: count
    });
  } catch (err) {
    console.error('Fehler beim Abrufen der Produkte aus der DB:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Produkte' });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  const { title, price, description, category, amountLeft, image } = req.body;
  if (!title || !price || !description || !category || amountLeft === undefined || !image) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt sein.' });
  }
  
  // Sanitize und Validierung
  const safeTitle = sanitizeInput(title);
  const safeDescription = sanitizeInput(description);
  const safeCategory = sanitizeInput(category);
  const parsedPrice = parseFloat(price);
  const parsedAmount = parseInt(amountLeft, 10);
  
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Ungültiger Preis' });
  }
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return res.status(400).json({ error: 'Ungültige Menge' });
  }
  
  // Bild-URL Validierung (einfach)
  if (image && !validator.isURL(image, { require_protocol: false }) && !image.match(/^[\w\-\.]+\.(jpg|jpeg|png|gif|webp)$/i)) {
    return res.status(400).json({ error: 'Ungültige Bild-URL oder Dateiname' });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(`
      INSERT INTO products (title, price, description, category, amountLeft, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [safeTitle, parsedPrice, safeDescription, safeCategory, parsedAmount, image]);
    await connection.commit();
    await logAudit('CREATE', 'product', result.insertId, req.user.id, { title: safeTitle });
    res.status(201).json({ message: 'Produkt erfolgreich hinzugefügt', id: result.insertId });
  } catch (err) {
    await connection.rollback();
    console.error('Fehler beim Hinzufügen des Produkts:', err);
    res.status(500).json({ error: 'Fehler beim Hinzufügen des Produkts' });
  } finally {
    connection.release();
  }
});


app.get('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const query = `
    SELECT c.product_id AS idproducts, p.title, p.price, p.image, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.idproducts
    WHERE c.user_id = ?
  `;
  try {
    const [results] = await pool.query(query, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Fehler beim Abrufen des Warenkorbs:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen des Warenkorbs' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Cart muss ein Array sein' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    if (cart.length > 0) {
      const insertPromises = cart.map(item => {
        if (!item || typeof item.id === 'undefined' || typeof item.quantity === 'undefined' || item.quantity <= 0) {
          return Promise.resolve();
        }
        const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
        return connection.query(insertQuery, [userId, item.id, item.quantity]);
      });
      await Promise.all(insertPromises);
    }
    await connection.commit();
    res.json({ message: 'Warenkorb erfolgreich aktualisiert' });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Verarbeiten des Warenkorbs:', error);
    res.status(500).json({
      error: 'Fehler beim Verarbeiten des Warenkorbs',
      details: error.message
    });
  } finally {
    connection.release();
  }
});


app.get('/api/category', async (req, res) => {
  const query = 'SELECT DISTINCT category FROM products';
  try {
    const [results] = await pool.query(query);
    const categories = results.map(row => row.category);
    res.json(categories);
  } catch (err) {
    console.error('Fehler beim Abrufen der Kategorien:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Kategorien' });
  }
});


app.post('/api/order', authenticateToken,async (req, res) => {
  const { firstname, lastname, email, address, city, country, payment, cart, userId } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Warenkorb ist leer.' });
  }
  const orderId = uuidv4();
  const orderQuery = `
    INSERT INTO orders (id, user_id, firstname, lastname, email, address, city, country, payment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      orderQuery,
      [orderId, userId || null, firstname, lastname, email, address, city, country, payment]
    );
    const items = cart.map(item => [
      uuidv4(), 
      orderId,
      item.idproducts || item.id,
      item.quantity,
      item.price
    ]);
    const itemsQuery = 'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ?';
    await connection.query(itemsQuery, [items]);
    await connection.commit();
    res.json({ message: 'Bestellung erfolgreich aufgegeben', orderId });
  } catch (orderErr) {
    await connection.rollback();
    console.error('Fehler beim Anlegen der Bestellung:', orderErr);
    res.status(500).json({ error: 'Fehler beim Anlegen der Bestellung' });
  } finally {
    connection.release();
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  let query, params;
  if (role === 'admin' || role === 'staff') {
    query = `
      SELECT o.*, oi.product_id, oi.quantity, oi.price, p.title, p.image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.idproducts
      ORDER BY o.created_at DESC
    `;
    params = [];
  } else {
    query = `
      SELECT o.*, oi.product_id, oi.quantity, oi.price, p.title, p.image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.idproducts
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    params = [userId];
  }
  try {
    const [results] = await pool.query(query, params);
    const orders = [];
    const map = {};
    results.forEach(row => {
      if (!map[row.id]) {
        map[row.id] = {
          id: row.id,
          user_id: row.user_id,
          firstname: row.firstname,
          lastname: row.lastname,
          created_at: row.created_at,
          payment: row.payment,
          address: row.address,  
          city: row.city,         
          country: row.country,   
          items: [],
          status: row.status,
        };
        orders.push(map[row.id]);
      }
      map[row.id].items.push({
        product_id: row.product_id,
        title: row.title,
        image: row.image,
        quantity: row.quantity,
        price: row.price
      });
    });
    res.json(orders);
  } catch (err) {
    console.error('Fehler beim Abrufen der Bestellungen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Bestellungen' });
  }
});

app.post('/api/order-status', authenticateToken,async (req, res) => {
  const { orderId, status } = req.body;
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  try {
    await pool.query(query, [status, orderId]);
    res.json({ message: 'Status aktualisiert' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
});
app.get('/api/donations/all', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT id, donor_name, amount, created_at FROM donations ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden aller Spenden' });
  }
});

app.get('/api/donations', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const [results] = await pool.query(
      'SELECT id, donor_name, amount, created_at FROM donations ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM donations');
    res.json({ results, count });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Spenden' });
  }
});

app.get('/api/donations/top10', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT donor_name, amount, created_at, id FROM donations ORDER BY amount DESC LIMIT 10'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Spenden' });
  }
});


app.get('/api/blog/latest', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  try {
    const [results] = await pool.query(
      'SELECT id, title, content, date AS created_at FROM blog_posts ORDER BY date DESC LIMIT ?',
      [limit]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Blogposts' });
  }
});


app.get('/api/map-items', async (req, res) => {
  const query = `
    SELECT id, label, class, x, y, image, name, species, age, description, status 
    FROM map_items ORDER BY id
  `;
  try {
    const [results] = await pool.query(query);
    const formattedItems = results.map(row => ({
      id: row.id,
      label: row.label,
      class: row.class,
      x: parseFloat(row.x),
      y: parseFloat(row.y),
      image: row.image,
      details: {
        name: row.name,
        species: row.species,
        age: row.age,
        description: row.description,
        status: row.status
      }
    }));
    res.json(formattedItems);
  } catch (err) {
    console.error('Fehler beim Laden der Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Map Items' });
  }
});

app.post('/api/map-items', authenticateToken,async (req, res) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
  }
  const { label, class: itemClass, x, y, image, details } = req.body;
  const query = `
    INSERT INTO map_items (label, class, x, y, image, name, species, age, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    label,
    itemClass || 'voliere-new',
    x,
    y,
    image,
    details.name,
    details.species || '',
    details.age || '',
    details.description || '',
    details.status || 'Gesund'
  ];
  try {
    const [result] = await pool.query(query, values);
    res.json({ id: result.insertId, message: 'Item erstellt' });
  } catch (err) {
    console.error('Fehler beim Erstellen des Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Map Items' });
  }
});

app.put('/api/map-items/:id', authenticateToken,async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
  }
  
  const { id } = req.params;
  const { label, class: itemClass, x, y, image, details } = req.body;
  const query = `
    UPDATE map_items 
    SET label = ?, class = ?, x = ?, y = ?, image = ?, 
        name = ?, species = ?, age = ?, description = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    label,
    itemClass,
    x,
    y,
    image,
    details.name,
    details.species,
    details.age,
    details.description,
    details.status,
    id
  ];
  try {
    await pool.query(query, values);
    res.json({ message: 'Item aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Map Items' });
  }
});

app.delete('/api/map-items/:id', authenticateToken,async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
  }

  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM map_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Map Item nicht gefunden' });
    }
    res.json({ message: 'Item gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Map Items' });
  }
});
app.put('/api/blog/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
  }

  const { id } = req.params;
  const { title, content, imageUrl, category } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Titel und Inhalt sind erforderlich' });
  }
  
  const query = `
    UPDATE blog_posts 
    SET title = ?, content = ?, imageUrl = ?, category = ?
    WHERE id = ?
  `;
  
  try {
    const [result] = await pool.query(query, [title, content, imageUrl || null, category || null, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog-Eintrag nicht gefunden' });
    }
    res.json({ message: 'Blog-Eintrag erfolgreich aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Blog-Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Blog-Eintrags' });
  }
});
app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, telefon, msg, status } = req.body;
  if (!firstname || !lastname || !email || !telefon) {
    return res.status(400).json({ error: 'Vorname, Nachname, E-Mail und Telefon sind erforderlich' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail Adresse' });
  }
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Ungültige Telefonnummer' });
  }
  const id = uuidv4();
  const contactStatus = status || 'neu';
  const query = 'INSERT INTO contacts (id, firstname, lastname, email, telefon, msg, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  try {
    await pool.query(query, [id, firstname, lastname, email, telefon, msg || null, contactStatus]);
    res.json({ 
      message: 'Kontaktdaten erfolgreich gespeichert',
      id
    });
  } catch (err) {
    console.error('Fehler beim Speichern des Kontakts:', err);
    res.status(500).json({ error: 'Fehler beim Speichern der Daten' });
  }
});

app.get('/api/contacts', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    // Sortiert: "neu" zuerst, dann "notfall", dann nach Datum
    const [results] = await pool.query(
      `SELECT * FROM contacts ORDER BY 
        CASE status 
          WHEN 'neu' THEN 1 
          WHEN 'new' THEN 1
          WHEN 'notfall' THEN 2 
          WHEN 'Wichtig' THEN 3 
          WHEN 'Mittel' THEN 4 
          WHEN 'niedrig' THEN 5 
          WHEN 'fertig' THEN 6 
          ELSE 7 
        END, created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM contacts');
    res.json({ results, count });
  } catch (err) {
    console.error('Fehler beim Laden der Kontakte:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Kontakte' });
  }
});

app.put('/api/contacts/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, price, description, category, amountLeft, image } = req.body;
  
  if (!title || !price || !description || !category || !amountLeft || !image) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt sein.' });
  }
  
  const query = `
    UPDATE products 
    SET title = ?, price = ?, description = ?, category = ?, amountLeft = ?, image = ?
    WHERE idproducts = ?
  `;
  
  try {
    const [result] = await pool.query(query, [title, price, description, category, amountLeft, image, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produkt nicht gefunden' });
    }
    res.json({ message: 'Produkt erfolgreich aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Produkts:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Produkts' });
  }
});
app.delete('/api/contacts/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ message: 'Kontakt gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});


app.get('/api/patients', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const [results] = await pool.query(
      'SELECT id, name, species, status, admission_date, created_at, details FROM patients ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM patients');
    res.json({ results, count });
  } catch (err) {
    console.error('Fehler beim Laden der Patienten:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Patienten' });
  }
});

app.post('/api/patients', authenticateToken,async (req, res) => {
  const { name, species, status, admission_date, details } = req.body;
  if (!name || !species || !status || !admission_date) {
    return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt sein.' });
  }
  const id = uuidv4();
  const query = `
    INSERT INTO patients (id, name, species, status, admission_date, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(query, [id, name, species, status, admission_date, details || null]);
    res.status(201).json({ message: 'Patient erfolgreich hinzugefügt', id });
  } catch (err) {
    console.error('Fehler beim Hinzufügen des Patienten:', err);
    res.status(500).json({ error: 'Fehler beim Hinzufügen des Patienten' });
  }
});

app.put('/api/patients/:id', authenticateToken,async (req, res) => {
  const { id } = req.params;
  const { status, details } = req.body;
  const query = 'UPDATE patients SET status = ?, details = ? WHERE id = ?';
  try {
    await pool.query(query, [status, details, id]);
    res.json({ message: 'Patient aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Patienten:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Patienten' });
  }
});
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Soft-Delete statt Hard-Delete
    const [result] = await pool.query('UPDATE products SET deleted_at = NOW() WHERE idproducts = ? AND deleted_at IS NULL', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produkt nicht gefunden' });
    }
    await logAudit('DELETE', 'product', id, req.user.id);
    res.json({ message: 'Produkt erfolgreich gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Produkts:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Produkts' });
  }
});

// ============================================
// TERMINVERWALTUNG API (IHK-Projekt)
// ============================================

// GET alle Termine (mit Filteroptionen und Pagination)
app.get('/api/appointments', authenticateToken, requireStaff, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;
  const { date, week, month, year, status, category, assigned_to, patient_id } = req.query;
  
  let query = `
    SELECT a.*, 
           p.name as patient_name, 
           p.species as patient_species,
           u.firstname as assigned_firstname,
           u.lastname as assigned_lastname
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    query += ' AND a.appointment_date = ?';
    params.push(date);
  }
  if (week) {
    query += ' AND YEARWEEK(a.appointment_date, 1) = YEARWEEK(?, 1)';
    params.push(week);
  }
  if (month && year) {
    query += ' AND MONTH(a.appointment_date) = ? AND YEAR(a.appointment_date) = ?';
    params.push(month, year);
  }
  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }
  if (category) {
    query += ' AND a.category = ?';
    params.push(category);
  }
  if (assigned_to) {
    query += ' AND a.assigned_to = ?';
    params.push(assigned_to);
  }
  if (patient_id) {
    query += ' AND a.patient_id = ?';
    params.push(patient_id);
  }

  query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('Fehler beim Laden der Termine:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Termine' });
  }
});

// GET einzelner Termin
app.get('/api/appointments/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT a.*, 
             p.name as patient_name, 
             p.species as patient_species,
             u.firstname as assigned_firstname,
             u.lastname as assigned_lastname
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Fehler beim Laden des Termins:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Fehler beim Laden des Termins' });
  }
});

// POST neuer Termin
app.post('/api/appointments', authenticateToken, requireStaff, async (req, res) => {
  const { 
    title, description, appointment_date, appointment_time, end_time,
    category, priority, status, patient_id, assigned_to,
    recurring, recurring_interval, notes 
  } = req.body;

  if (!title || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Titel, Datum und Uhrzeit sind erforderlich' });
  }

  console.log('POST /api/appointments body:', req.body);
  // Sanitize
  const safeTitle = sanitizeInput(title);
  const safeDescription = description ? sanitizeInput(description) : null;
  const safeNotes = notes ? sanitizeInput(notes) : null;

  try {
    const [result] = await pool.query(`
      INSERT INTO appointments 
      (title, description, appointment_date, appointment_time, end_time,
       category, priority, status, patient_id, assigned_to,
       recurring, recurring_interval, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      safeTitle, safeDescription, appointment_date, appointment_time, end_time || null,
      category || 'sonstiges', priority || 'mittel', status || 'geplant',
      patient_id || null, assigned_to || null,
      recurring || false, recurring_interval || null, safeNotes, req.user.id
    ]);
    
    await logAudit('CREATE', 'appointment', result.insertId, req.user.id, { title: safeTitle });
    res.status(201).json({ id: result.insertId, message: 'Termin erstellt' });

    // fire-and-forget: send notification email to admin users (or assigned admin)
    (async () => {
      try {
        const [rows] = await pool.query('SELECT a.*, p.name as patient_name, u.firstname as assigned_firstname, u.lastname as assigned_lastname, u.email as assigned_email FROM appointments a LEFT JOIN patients p ON a.patient_id = p.id LEFT JOIN users u ON a.assigned_to = u.id WHERE a.id = ?', [result.insertId]);
        const appointmentFull = (rows && rows.length) ? rows[0] : null;
        if (appointmentFull) {
          // gather admin emails
          const [adminRows] = await pool.query("SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL");
          const adminEmails = (adminRows || []).map(r => r.email).filter(Boolean);
          const recipients = new Set(adminEmails);
          // also include assigned user email if present
          if (appointmentFull.assigned_email) recipients.add(appointmentFull.assigned_email);
          const recipList = Array.from(recipients);
          if (recipList.length > 0) {
            await sendAppointmentEmail(appointmentFull, recipList);
            console.log('Appointment email sent for id', result.insertId, 'to', recipList);
          } else {
            console.log('No admin recipients configured for appointment email');
          }
        }
      } catch (err) {
        console.error('Error sending appointment email (non-fatal):', err);
      }
    })();
  } catch (err) {
    console.error('Fehler beim Erstellen des Termins:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Termins' });
  }
});

// PUT Termin bearbeiten
app.put('/api/appointments/:id', authenticateToken, requireStaff, async (req, res) => {
  const { id } = req.params;
  const { 
    title, description, appointment_date, appointment_time, end_time,
    category, priority, status, patient_id, assigned_to,
    recurring, recurring_interval, notes 
  } = req.body;

  // Sanitize
  const safeTitle = sanitizeInput(title);
  const safeDescription = description ? sanitizeInput(description) : null;
  const safeNotes = notes ? sanitizeInput(notes) : null;

  try {
    const [result] = await pool.query(`
      UPDATE appointments SET
        title = ?, description = ?, appointment_date = ?, appointment_time = ?, end_time = ?,
        category = ?, priority = ?, status = ?, patient_id = ?, assigned_to = ?,
        recurring = ?, recurring_interval = ?, notes = ?
      WHERE id = ?
    `, [
      safeTitle, safeDescription, appointment_date, appointment_time, end_time,
      category, priority, status, patient_id || null, assigned_to || null,
      recurring, recurring_interval, safeNotes, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    await logAudit('UPDATE', 'appointment', id, req.user.id, { title: safeTitle });
    res.json({ message: 'Termin aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Termins:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Termins' });
  }
});

// DELETE Termin löschen (Soft-Delete)
app.delete('/api/appointments/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    await logAudit('DELETE', 'appointment', req.params.id, req.user.id);
    res.json({ message: 'Termin gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Termins:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Termins' });
  }
});

// GET Statistiken für Dashboard
app.get('/api/appointments/stats/overview', authenticateToken, requireStaff, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[todayCount]] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [today]
    );
    const [[pendingCount]] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE status = 'geplant'"
    );
    const [[urgentCount]] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE priority = 'dringend' AND status = 'geplant'"
    );
    
    res.json({
      today: todayCount.count,
      pending: pendingCount.count,
      urgent: urgentCount.count
    });
  } catch (err) {
    console.error('Fehler beim Laden der Statistiken:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});

// GET Staff-Mitarbeiter für Zuweisung
app.get('/api/staff-users', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT id, username, firstname, lastname FROM users WHERE role IN ('admin', 'staff')"
    );
    res.json(results);
  } catch (err) {
    console.error('Fehler beim Laden der Mitarbeiter:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Mitarbeiter' });
  }
});

// CSV Export
app.get('/api/appointments/export/csv', authenticateToken, async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  
  const { start_date, end_date } = req.query;
  let query = `
    SELECT a.id, a.title, a.description, a.appointment_date, a.appointment_time, 
           a.end_time, a.category, a.priority, a.status, 
           p.name as patient_name, u.firstname as assigned_firstname, u.lastname as assigned_lastname,
           a.recurring, a.notes
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    query += ' AND a.appointment_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND a.appointment_date <= ?';
    params.push(end_date);
  }
  query += ' ORDER BY a.appointment_date, a.appointment_time';

  try {
    const [results] = await pool.query(query, params);
    
    const headers = ['ID', 'Titel', 'Beschreibung', 'Datum', 'Startzeit', 'Endzeit', 
                     'Kategorie', 'Priorität', 'Status', 'Patient', 'Zugewiesen an', 
                     'Wiederkehrend', 'Notizen'];
    
    let csv = headers.join(';') + '\n';
    results.forEach(row => {
      csv += [
        row.id,
        `"${(row.title || '').replace(/"/g, '""')}"`,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        row.appointment_date,
        row.appointment_time,
        row.end_time || '',
        row.category,
        row.priority,
        row.status,
        row.patient_name || '',
        `${row.assigned_firstname || ''} ${row.assigned_lastname || ''}`.trim(),
        row.recurring ? 'Ja' : 'Nein',
        `"${(row.notes || '').replace(/"/g, '""')}"`
      ].join(';') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=termine.csv');
    res.send('\ufeff' + csv); // BOM für Excel
  } catch (err) {
    console.error('Fehler beim CSV-Export:', err);
    res.status(500).json({ error: 'Fehler beim CSV-Export' });
  }
});

// ============================================
// AUDIT-LOG API (nur Admin)
// ============================================

app.get('/api/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const { entity_type, user_id, action, start_date, end_date } = req.query;

  let query = `
    SELECT al.*, u.username 
    FROM audit_logs al 
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (entity_type) {
    query += ' AND al.entity_type = ?';
    params.push(entity_type);
  }
  if (user_id) {
    query += ' AND al.user_id = ?';
    params.push(user_id);
  }
  if (action) {
    query += ' AND al.action = ?';
    params.push(action);
  }
  if (start_date) {
    query += ' AND al.created_at >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND al.created_at <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [results] = await pool.query(query, params);
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    res.json({ results, count, page, limit });
  } catch (err) {
    console.error('Fehler beim Laden der Audit-Logs:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Audit-Logs' });
  }
});

// Gelöschte Elemente wiederherstellen (Admin only)
app.post('/api/restore/:entity/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { entity, id } = req.params;
  const validEntities = ['products', 'blog_posts', 'appointments', 'patients'];
  
  if (!validEntities.includes(entity)) {
    return res.status(400).json({ error: 'Ungültiger Entity-Typ' });
  }

  const idColumn = entity === 'products' ? 'idproducts' : 'id';
  
  try {
    const [result] = await pool.query(
      `UPDATE ${entity} SET deleted_at = NULL WHERE ${idColumn} = ? AND deleted_at IS NOT NULL`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Element nicht gefunden oder nicht gelöscht' });
    }
    await logAudit('RESTORE', entity, id, req.user.id);
    res.json({ message: 'Element wiederhergestellt' });
  } catch (err) {
    console.error('Fehler beim Wiederherstellen:', err);
    res.status(500).json({ error: 'Fehler beim Wiederherstellen' });
  }
});
