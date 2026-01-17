const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function makeOwner() {
    try {
        const client = await pool.connect();
        await client.query("UPDATE users SET role = 'OWNER' WHERE phone = '9988776655'");
        console.log('Updated user 9988776655 to OWNER');
        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

makeOwner();
