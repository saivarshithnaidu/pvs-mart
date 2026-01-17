const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Starting migration for Payment System V2...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Rename upi_payments to upi_transactions if it exists, or create new
        // We will just create upi_transactions to be clean and match the spec exactly

        await client.query(`
            CREATE TABLE IF NOT EXISTS upi_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id INTEGER REFERENCES orders(id),
                upi_id VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified_at TIMESTAMP,
                verified_by INTEGER REFERENCES users(id),
                status VARCHAR(50) DEFAULT 'PENDING' 
            );
        `);
        console.log('Created upi_transactions table.');

        // 2. Ensure orders table has keys
        // We already added payment_method and payment_status in V1, but let's double check defaults/constraints if needed
        // Just ensuring they exist is enough for now as they are VARCHARs.

        // We might want to migrate old data or just leave it.

        await client.query('COMMIT');
        console.log('Migration completed successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
