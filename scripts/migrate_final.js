const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Try to load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
            if (key && !process.env[key]) {
                process.env[key] = val;
            }
        }
    });
}

console.log('DB URL Present:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL missing. Please create .env.local");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();

        console.log('Creating tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'CUSTOMER')),
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
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

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                total_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                payment_status VARCHAR(50) DEFAULT 'Pending',
                payment_method VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                price_at_time DECIMAL(10, 2) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS offline_bills (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255),
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
             CREATE TABLE IF NOT EXISTS search_logs (
                 id SERIAL PRIMARY KEY,
                 user_id INTEGER REFERENCES users(id),
                 keyword TEXT NOT NULL,
                 result_count INTEGER DEFAULT 0,
                 timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             );
        `);
        console.log('Tables created successfully.');
        client.release();
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await pool.end();
    }
}

run();
