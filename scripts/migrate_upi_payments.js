const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Starting migration for UPI Payments...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create UPI Payments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS upi_payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id INTEGER REFERENCES orders(id),
                upi_id VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                verified_by INTEGER REFERENCES users(id),
                verified_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created upi_payments table.');

        // 2. Create Audit Logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id VARCHAR(50) NOT NULL,
                performed_by INTEGER REFERENCES users(id),
                details JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created audit_logs table.');

        // 3. Add columns to orders table
        // Check if columns exist first to avoid errors on re-run
        const checkColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name IN ('payment_method', 'payment_status');
        `);

        const columns = checkColumns.rows.map(r => r.column_name);

        if (!columns.includes('payment_method')) {
            await client.query(`ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);`);
            console.log('Added payment_method to orders.');
        }

        if (!columns.includes('payment_status')) {
            await client.query(`ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING';`);
            console.log('Added payment_status to orders.');
        }

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
