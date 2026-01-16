const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const DEFAULT_PASS = 'password123';
const EMAILS = ['saivarshith8284@gmail.com', 'psvmart@mart.com'];

async function reset() {
    try {
        const client = await pool.connect();
        console.log(`Resetting passwords for ${EMAILS.join(', ')} to '${DEFAULT_PASS}'...`);

        const hashedParams = await bcrypt.hash(DEFAULT_PASS, 10);

        for (const email of EMAILS) {
            // Upsert user just in case
            // Check if exists first
            const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);

            if (res.rows.length === 0) {
                console.log(`User ${email} not found. Creating...`);
                await client.query(
                    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'OWNER')`,
                    [email, hashedParams, 'Admin User']
                );
            } else {
                console.log(`User ${email} found. Updating password...`);
                await client.query(
                    `UPDATE users SET password_hash = $1, role = 'OWNER' WHERE email = $2`,
                    [hashedParams, email]
                );
            }
        }

        console.log('Password reset complete!');
        client.release();
    } catch (e) {
        console.error('Reset failed:', e);
    } finally {
        pool.end();
    }
}

reset();
