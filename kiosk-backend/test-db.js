const { pool } = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('✅ Tables:', rows);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
