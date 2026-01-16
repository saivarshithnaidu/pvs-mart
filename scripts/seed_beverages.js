const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const beverages = [
    // Soft Drinks
    { name: 'Coca Cola (750ml)', category: 'Beverages', price: 40, stock: 100, description: 'Carbonated soft drink.' },
    { name: 'Sprite (750ml)', category: 'Beverages', price: 40, stock: 100, description: 'Lemon-lime flavored soft drink.' },
    { name: 'Thums Up (750ml)', category: 'Beverages', price: 40, stock: 100, description: 'Strong cola drink.' },
    { name: 'Fanta (750ml)', category: 'Beverages', price: 40, stock: 100, description: 'Orange flavored soft drink.' },
    { name: 'Maaza (600ml)', category: 'Beverages', price: 38, stock: 80, description: 'Mango fruit drink.' },
    { name: 'Frooti (600ml)', category: 'Beverages', price: 35, stock: 80, description: 'Fresh mango juice drink.' },

    // Water & Energy
    { name: 'Bisleri Water (1L)', category: 'Beverages', price: 20, stock: 200, description: 'Packaged drinking water.' },
    { name: 'Kinley Soda (750ml)', category: 'Beverages', price: 20, stock: 150, description: 'Carbonated water soda.' },
    { name: 'Red Bull (250ml)', category: 'Beverages', price: 125, stock: 50, description: 'Energy drink.' },
    { name: 'Gatorade (500ml)', category: 'Beverages', price: 50, stock: 60, description: 'Sports energy drink.' },

    // Healthy
    { name: 'Amul Lassi (200ml)', category: 'Dairy', price: 20, stock: 100, description: 'Refreshing buttermilk.' },
    { name: 'Amul Kool (180ml)', category: 'Dairy', price: 25, stock: 100, description: 'Flavored milk.' },
    { name: 'Real Juice Mixed Fruit (1L)', category: 'Beverages', price: 110, stock: 40, description: 'Mixed fruit juice.' },

    // More Grocery
    { name: 'Paneer (200g)', category: 'Dairy', price: 90, stock: 30, description: 'Fresh cottage cheese.' },
    { name: 'Curd (500g)', category: 'Dairy', price: 35, stock: 40, description: 'Fresh thick curd.' },
    { name: 'Bread (Milk) 400g', category: 'Bakery', price: 45, stock: 50, description: 'Soft milk bread.' },
    { name: 'Eggs (Tray - 30)', category: 'Essentials', price: 180, stock: 50, description: 'Fresh farm eggs.' },
];

async function seed() {
    try {
        const client = await pool.connect();
        console.log('Seeding beverages and more...');

        for (const p of beverages) {
            // Generate SKU
            const catCode = p.category.substring(0, 3).toUpperCase();
            const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
            const sku = `PVS-${catCode}-${uniqueSuffix}`;

            await client.query(
                `INSERT INTO products (name, category, price, stock, description, is_active, sku) 
             VALUES ($1, $2, $3, $4, $5, true, $6)`,
                [p.name, p.category, p.price, p.stock, p.description, sku]
            );
        }

        console.log('Beverages added!');
        client.release();
    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        pool.end();
    }
}

seed();
