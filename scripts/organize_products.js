const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Mapping Logic
const MAPPINGS = [
    // RICE & GRAINS
    { pattern: /basmati/i, cat: 'Rice & Grains', sub: 'Basmati Rice' },
    { pattern: /sona masuri/i, cat: 'Rice & Grains', sub: 'Sona Masuri Rice' },
    { pattern: /rice/i, cat: 'Rice & Grains', sub: 'Other Grains' }, // Fallback for rice
    { pattern: /flour|atta/i, cat: 'Rice & Grains', sub: 'Wheat Flour' },

    // GROCERIES (Detailed)
    { pattern: /dal|lentil/i, cat: 'Groceries', sub: 'Pulses & Dals' },
    { pattern: /oil/i, cat: 'Groceries', sub: 'Cooking Oils' },
    { pattern: /salt|sugar/i, cat: 'Groceries', sub: 'Sugar & Salt' },
    { pattern: /chilli|turmeric|spice|masala/i, cat: 'Groceries', sub: 'Spices' },
    { pattern: /tea|coffee/i, cat: 'Groceries', sub: 'Tea & Coffee' },

    // BEVERAGES
    { pattern: /coke|sprite|pepsi|thums|soda/i, cat: 'Beverages', sub: 'Soft Drinks' },
    { pattern: /juice|maaza|slice/i, cat: 'Beverages', sub: 'Fruit Juices' },
    { pattern: /water/i, cat: 'Beverages', sub: 'Water' },
    { pattern: /energy/i, cat: 'Beverages', sub: 'Energy Drinks' },

    // DAIRY
    { pattern: /milk/i, cat: 'Dairy Products', sub: 'Milk' },
    { pattern: /curd|yogurt/i, cat: 'Dairy Products', sub: 'Curd' },
    { pattern: /butter\s+milk/i, cat: 'Dairy Products', sub: 'Butter Milk' },
    { pattern: /butter/i, cat: 'Dairy Products', sub: 'Butter' },
    { pattern: /cheese/i, cat: 'Dairy Products', sub: 'Cheese' },
    { pattern: /paneer/i, cat: 'Dairy Products', sub: 'Cheese' }, // Close enough
];

async function organize() {
    const client = await pool.connect();
    try {
        console.log('Fetching products...');
        const res = await client.query('SELECT * FROM products');
        const products = res.rows;

        for (const p of products) {
            let newCat = p.category; // Default to existing
            let newSub = 'General';
            let newWeight = null;

            // 1. Determine Category & Subcategory based on Name
            for (const m of MAPPINGS) {
                if (m.pattern.test(p.name)) {
                    newCat = m.cat;
                    newSub = m.sub;
                    break;
                }
            }

            // 2. Extract Weight (e.g., 1kg, 500g, 1L, 250ml)
            const weightMatch = p.name.match(/(\d+\s*(kg|g|l|ml|pcs|pack))/i);
            if (weightMatch) {
                newWeight = weightMatch[0];
            }

            // Update DB
            await client.query(
                `UPDATE products SET category = $1, subcategory = $2, weight = $3 WHERE id = $4`,
                [newCat, newSub, newWeight, p.id]
            );
            console.log(`Updated: ${p.name} -> [${newCat} | ${newSub}] (${newWeight || 'N/A'})`);
        }
        console.log('Organization complete.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        client.release();
        pool.end();
    }
}

organize();
