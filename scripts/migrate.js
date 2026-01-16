const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load environment variables manually if dotenv fails or path is weird
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.log('.env.local not found at:', envPath);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing from environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'CUSTOMER')),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked/Created "users" table.');

    // 2. Products Table
    await pool.query(`
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
    console.log('Checked/Created "products" table.');

    // 3. Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
        payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked/Created "orders" table.');

    // 4. Order Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10, 2) NOT NULL
      );
    `);
    console.log('Checked/Created "order_items" table.');

    // 5. Offline Bills Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offline_bills (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255),
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked/Created "offline_bills" table.');

    // 6. Search Logs (For Analytics, NO AI)
    await pool.query(`
       CREATE TABLE IF NOT EXISTS search_logs (
         id SERIAL PRIMARY KEY,
         user_id INTEGER REFERENCES users(id),
         keyword TEXT NOT NULL,
         result_count INTEGER DEFAULT 0,
         timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );
    `);
    console.log('Checked/Created "search_logs" table.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
