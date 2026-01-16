const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Adding SKU and Invoice Number columns...');

        // 1. Products: Add SKU (Unique)
        // We'll generate a default SKU for existing products first
        await client.query(`
       ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50);
    `);

        // Update existing products with a temporary SKU
        const res = await client.query('SELECT id FROM products WHERE sku IS NULL');
        for (const row of res.rows) {
            const tempSku = 'PVS-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            await client.query('UPDATE products SET sku = $1 WHERE id = $2', [tempSku, row.id]);
        }

        // Now enforce uniqueness
        await client.query(`
       ALTER TABLE products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
    `);
        console.log('Product SKU column added.');

        // 2. Orders: Add Invoice Number
        await client.query(`
       ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE;
    `);
        console.log('Order Invoice column added.');

        // 3. Offline Bills: Add Invoice Number
        await client.query(`
       ALTER TABLE offline_bills ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE;
    `);
        console.log('Offline Bill Invoice column added.');

        client.release();
        console.log('Migration complete.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        pool.end();
    }
}

migrate();
