require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shop',
  });

  const connection = await pool.getConnection();
  try {
    console.log('Scanning for duplicate appointments...');

    const [groups] = await connection.query(`
      SELECT title, appointment_date, appointment_time, COALESCE(room, '') as room, COUNT(*) as cnt
      FROM appointments
      GROUP BY title, appointment_date, appointment_time, COALESCE(room, '')
      HAVING cnt > 1
    `);

    console.log(`Found ${groups.length} duplicate groups.`);
    let totalDeleted = 0;

    for (const g of groups) {
      const title = g.title;
      const date = g.appointment_date;
      const time = g.appointment_time;
      const room = g.room === '' ? null : g.room;

      // fetch ids ordered by created_at (keep the earliest)
      const params = [title, date, time];
      let whereRoom = '';
      if (room === null) {
        whereRoom = 'AND room IS NULL';
      } else {
        whereRoom = 'AND room = ?';
        params.push(room);
      }

      const [rows] = await connection.query(
        `SELECT id, created_at FROM appointments WHERE title = ? AND appointment_date = ? AND appointment_time = ? ${whereRoom} ORDER BY created_at ASC`,
        params
      );

      if (rows.length <= 1) continue;

      const keepId = rows[0].id;
      const deleteIds = rows.slice(1).map(r => r.id);

      // delete duplicates
      const [delRes] = await connection.query(`DELETE FROM appointments WHERE id IN (${deleteIds.map(() => '?').join(',')})`, deleteIds);
      console.log(`Group '${title}' ${date} ${time} room=${room || ''}: kept ${keepId}, deleted ${deleteIds.length}`);
      totalDeleted += deleteIds.length;
    }

    console.log(`Done. Total deleted: ${totalDeleted}`);
  } catch (err) {
    console.error('Error during dedupe:', err);
  } finally {
    try { await connection.release(); } catch {};
    try { await pool.end(); } catch {};
  }
}

run().catch(e => { console.error(e); process.exit(1); });
