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
    console.log('Counting appointments without room...');
    const [countRes] = await conn.query("SELECT COUNT(*) as cnt FROM appointments WHERE room IS NULL OR room = ''");
    const toDelete = (countRes && countRes[0] && countRes[0].cnt) ? countRes[0].cnt : 0;
    if (!toDelete) {
      console.log('No appointments without room found. Nothing to delete.');
      return;
    }
    console.log(`Found ${toDelete} appointments without room. Deleting...`);
    const [delRes] = await conn.query("DELETE FROM appointments WHERE room IS NULL OR room = ''");
    console.log(`Deleted ${delRes.affectedRows} rows.`);
  } catch (err) {
    console.error('Error deleting appointments without room:', err);
  } finally {
    try { await conn.release(); } catch (e) {}
    try { await pool.end(); } catch (e) {}
  }
}

run().catch(e => { console.error(e); process.exit(1); });
