require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wildvogelreha',
  });

  const conn = await pool.getConnection();
  try {
    console.log('Looking for appointments without room that have a matching appointment with a room...');
    const [rows] = await conn.query(`
      SELECT DISTINCT a.id, a.title, a.appointment_date, a.appointment_time, a.room
      FROM appointments a
      JOIN appointments b ON a.title = b.title
        AND a.appointment_date = b.appointment_date
        AND a.appointment_time = b.appointment_time
      WHERE (a.room IS NULL OR a.room = '')
        AND (b.room IS NOT NULL AND b.room <> '')
        AND a.id <> b.id
      ORDER BY a.appointment_date, a.appointment_time, a.title
    `);

    if (!rows || rows.length === 0) {
      console.log('No matching rows found. Nothing to delete.');
      return;
    }

    console.log(`Found ${rows.length} rows to delete. IDs: ${rows.map(r => r.id).join(', ')}`);

    const ids = rows.map(r => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const [delRes] = await conn.query(`DELETE FROM appointments WHERE id IN (${placeholders})`, ids);
    console.log(`Deleted ${delRes.affectedRows} rows.`);
  } catch (err) {
    console.error('Error while removing no-room duplicates:', err);
  } finally {
    try { await conn.release(); } catch (e) {}
    try { await pool.end(); } catch (e) {}
  }
}

run().catch(e => { console.error(e); process.exit(1); });
