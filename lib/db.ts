import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon DB usually, or strict depending on certs
  },
});

// Helper to query the database
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount }); // Remove logging for production privacy if needed
    return res;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
};

export default pool;
