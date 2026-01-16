const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        // Add subcategory column
        await client.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255),
            ADD COLUMN IF NOT EXISTS weight VARCHAR(50);
        `);

        console.log('Added subcategory and weight columns.');

        // Create indexes for faster filtering
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_product_category ON products(category);
            CREATE INDEX IF NOT EXISTS idx_product_subcategory ON products(subcategory);
        `);
        console.log('Indexes created.');

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
