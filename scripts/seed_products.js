const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const products = [
    // Kirana / Grocery
    { name: 'Toor Dal (1kg)', category: 'Grocery', price: 160, stock: 50, description: 'Premium quality Toor Dal.' },
    { name: 'Basmati Rice (5kg)', category: 'Grocery', price: 550, stock: 30, description: 'Long grain aromatic Basmati Rice.' },
    { name: 'Sunflower Oil (1L)', category: 'Grocery', price: 140, stock: 100, description: 'Refined sunflower oil for cooking.' },
    { name: 'Sugar (1kg)', category: 'Grocery', price: 45, stock: 100, description: 'Refined white sugar.' },
    { name: 'Salt (1kg)', category: 'Grocery', price: 25, stock: 150, description: 'Iodized table salt.' },
    { name: 'Red Chilli Powder (200g)', category: 'Grocery', price: 60, stock: 40, description: 'Spicy red chilli powder.' },
    { name: 'Turmeric Powder (100g)', category: 'Grocery', price: 35, stock: 40, description: 'Pure turmeric powder.' },
    { name: 'Wheat Flour (5kg)', category: 'Grocery', price: 220, stock: 25, description: 'Whole wheat atta.' },
    { name: 'Tea Powder (250g)', category: 'Grocery', price: 120, stock: 60, description: 'Strong dust tea.' },
    { name: 'Biscuits (Pack)', category: 'Snacks', price: 20, stock: 200, description: 'Glucose biscuits.' },

    // Fancy / General
    { name: 'Notebook (Long size)', category: 'Stationery', price: 50, stock: 100, description: '180 pages ruled notebook.' },
    { name: 'Ball Pen (Blue)', category: 'Stationery', price: 10, stock: 500, description: 'Smooth writing ball pen.' },
    { name: 'Pencil Box', category: 'Stationery', price: 40, stock: 50, description: 'Set of 10 pencils.' },
    { name: 'Shampoo (100ml)', category: 'Personal Care', price: 85, stock: 40, description: 'Anti-dandruff shampoo.' },
    { name: 'Toothpaste (150g)', category: 'Personal Care', price: 95, stock: 50, description: 'Herbal toothpaste.' },
    { name: 'Soap (Pack of 3)', category: 'Personal Care', price: 120, stock: 30, description: 'Bathing soap trio pack.' },
    { name: 'Detergent Powder (1kg)', category: 'Household', price: 110, stock: 40, description: 'Washing powder for clothes.' },
    { name: 'LED Bulb (9W)', category: 'Electrical', price: 99, stock: 100, description: 'Bright white LED bulb.' },
    { name: 'AA Batteries (Pair)', category: 'Electrical', price: 30, stock: 50, description: 'Alkaline batteries.' },
    { name: 'Gift Wrapper', category: 'Fancy', price: 15, stock: 100, description: 'Colorful gift wrapping paper.' }
];

async function seed() {
    try {
        const client = await pool.connect();
        console.log('Seeding products...');

        for (const p of products) {
            await client.query(
                `INSERT INTO products (name, category, price, stock, description, is_active) 
             VALUES ($1, $2, $3, $4, $5, true)`,
                [p.name, p.category, p.price, p.stock, p.description]
            );
        }

        console.log('Seeding complete!');
        client.release();
    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        pool.end();
    }
}

seed();
