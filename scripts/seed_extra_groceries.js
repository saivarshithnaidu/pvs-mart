const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const groceries = [
    // Staples
    { name: 'Atta (10kg)', category: 'Grocery', price: 450, stock: 50, description: 'Premium whole wheat flour.' },
    { name: 'Moong Dal (1kg)', category: 'Grocery', price: 130, stock: 40, description: 'Yellow split lentils.' },
    { name: 'Chana Dal (1kg)', category: 'Grocery', price: 90, stock: 40, description: 'Split chickpeas.' },
    { name: 'Urad Dal (1kg)', category: 'Grocery', price: 160, stock: 40, description: 'Black gram lentils.' },
    { name: 'Poha (1kg)', category: 'Grocery', price: 60, stock: 30, description: 'Flattened rice flakes.' },
    { name: 'Rava / Sooji (1kg)', category: 'Grocery', price: 55, stock: 30, description: 'Semolina for upma and halwa.' },
    { name: 'Vermicelli (Seviyan) (500g)', category: 'Grocery', price: 40, stock: 50, description: 'Roasted vermicelli.' },

    // Spices & Condiments
    { name: 'Cumin Seeds (Jeera) (100g)', category: 'Grocery', price: 80, stock: 60, description: 'Whole cumin seeds.' },
    { name: 'Mustard Seeds (Rai) (100g)', category: 'Grocery', price: 40, stock: 60, description: 'Small black mustard seeds.' },
    { name: 'Black Pepper (100g)', category: 'Grocery', price: 120, stock: 40, description: 'Whole black peppercorns.' },
    { name: 'Dhaniya Powder (200g)', category: 'Grocery', price: 70, stock: 50, description: 'Coriander powder.' },
    { name: 'Garam Masala (100g)', category: 'Grocery', price: 95, stock: 50, description: 'Blend of aromatic spices.' },

    // Oil & Ghee
    { name: 'Groundnut Oil (1L)', category: 'Grocery', price: 180, stock: 50, description: 'Pure peanut oil.' },
    { name: 'Mustard Oil (1L)', category: 'Grocery', price: 160, stock: 40, description: 'Kachi Ghani mustard oil.' },
    { name: 'Ghee (500ml)', category: 'Grocery', price: 350, stock: 30, description: 'Pure cow ghee.' },

    // Beverages & Snacks
    { name: 'Instant Coffee (50g)', category: 'Grocery', price: 190, stock: 40, description: 'Rich aromatic instant coffee.' },
    { name: 'Green Tea (Pack of 25)', category: 'Grocery', price: 160, stock: 30, description: 'Healthy green tea bags.' },
    { name: 'Maggi Noodles (Pack of 12)', category: 'Snacks', price: 168, stock: 100, description: 'Instant noodles family pack.' },
    { name: 'Ketchup (500g)', category: 'Grocery', price: 120, stock: 40, description: 'Tomato ketchup.' },
    { name: 'Jam (500g)', category: 'Grocery', price: 150, stock: 30, description: 'Mixed fruit jam.' },
];

async function seed() {
    try {
        const client = await pool.connect();
        console.log('Seeding extra groceries...');

        for (const p of groceries) {
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

        console.log('Extra groceries added!');
        client.release();
    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        pool.end();
    }
}

seed();
