const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function inspect() {
    try {
        const client = await pool.connect();

        console.log('USERS_TABLE_COLUMNS:');
        const usersRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        usersRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\nOrders_TABLE_COLUMNS:');
        const ordersRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders';
        `);
        ordersRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

inspect();
