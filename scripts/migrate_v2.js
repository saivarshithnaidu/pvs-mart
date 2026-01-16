require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not defined in environment.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    console.log("Connecting to database...");
    try {
        const client = await pool.connect();
        console.log("Connected. Creating tables...");

        await client.query('BEGIN');

        // Users
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'CUSTOMER')),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Products
        await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(100),
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Orders
        await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(50) DEFAULT 'Pending',
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Order Items
        await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10, 2) NOT NULL
      );
    `);

        // Offline Bills
        await client.query(`
      CREATE TABLE IF NOT EXISTS offline_bills (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255),
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Search Logs
        await client.query(`
       CREATE TABLE IF NOT EXISTS search_logs (
         id SERIAL PRIMARY KEY,
         user_id INTEGER REFERENCES users(id),
         keyword TEXT NOT NULL,
         result_count INTEGER DEFAULT 0,
         timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );
    `);

        await client.query('COMMIT');
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
