const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting PVS Mart V1 Migration...');

        // 1. Users Table Updates
        console.log('Updating users table...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE,
            ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT '+91',
            ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255); -- Ensure this exists if not already
        `);

        // 2. Sessions Table (for manual session management)
        console.log('Creating sessions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(500) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            );
        `);

        // 3. Khata Book Table
        console.log('Creating khata_book table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS khata_book (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL, -- Optional link to an order
                amount DECIMAL(10, 2) NOT NULL,
                entry_type VARCHAR(10) CHECK (entry_type IN ('CREDIT', 'DEBIT')) NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Recently Viewed Table
        console.log('Creating recently_viewed table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS recently_viewed (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL, -- Assuming product_id usually links to products table, but foreign key might fail if products table name varies. Let's assume 'products'.
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add FK constraint if products table exists (it should based on previous context)
        // We wrap in try/catch in case products table has different schema or name, though standard is 'products'
        try {
            await client.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recently_viewed_product_id_fkey') THEN 
                        ALTER TABLE recently_viewed 
                        ADD CONSTRAINT recently_viewed_product_id_fkey 
                        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE; 
                    END IF; 
                END $$;
            `);
        } catch (err) {
            console.warn('Could not add FK to products table. Proceeding without it for now.', err.message);
        }

        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
