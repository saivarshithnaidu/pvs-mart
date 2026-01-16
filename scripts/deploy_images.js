const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Paths
const ARTIFACT_DIR = 'C:/Users/LENOVO/.gemini/antigravity/brain/4699d700-6c21-4f78-bfe7-23f464fb8125';
const PUBLIC_DIR = 'c:/Pvs Mart V/sv-mart/public/products';

// Mapping: Category -> Image Filename (that we generated)
// Note: We need to find the exact filenames from the artifact directory or I will just copy them by their known generation names if I can't guess the timestamp. 
// Since I can't list the artifact dir easily with a script relying on external props, I will rely on the agent (me) knowing the names or using a wildcard copy if possible. 
// Actually, I (the agent) know the approximate names but not the exact timestamps. 
// Wait, I can see the timestamps in the tool output:
// grocery_staples_vibrant_1768554757652.png
// beverages_display_1768554782990.png
// stationery_set_1768554823056.png
// snacks_party_pack_1768554856480.png
// personal_care_products_1768554882322.png

const IMAGE_MAP = {
    'Grocery': 'grocery_staples_vibrant_1768554757652.png',
    'Beverages': 'beverages_display_1768554782990.png',
    'Dairy': 'beverages_display_1768554782990.png', // Reuse bev for now or generate/map better
    'Stationery': 'stationery_set_1768554823056.png',
    'Fancy': 'stationery_set_1768554823056.png',
    'Snacks': 'snacks_party_pack_1768554856480.png',
    'Bakery': 'snacks_party_pack_1768554856480.png',
    'Personal Care': 'personal_care_products_1768554882322.png',
    'Household': 'personal_care_products_1768554882322.png', // Fallback
    'Electrical': 'personal_care_products_1768554882322.png', // Fallback
    'Essentials': 'grocery_staples_vibrant_1768554757652.png'
};

async function setupImages() {
    // 1. Create public/products dir
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // 2. Copy files
    for (const [cat, filename] of Object.entries(IMAGE_MAP)) {
        const srcPath = path.join(ARTIFACT_DIR, filename);
        // Clean target name: grocery.png, beverages.png etc.
        const targetName = cat.toLowerCase().replace(/\s+/g, '_') + '.png';
        const destPath = path.join(PUBLIC_DIR, targetName);

        try {
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`Copied ${filename} to ${targetName}`);
            } else {
                console.warn(`Source image not found: ${srcPath}`);
            }
        } catch (e) {
            console.error(`Error copying ${filename}:`, e);
        }
    }

    // 3. Update Database
    const client = await pool.connect();
    try {
        console.log('Updating product images in DB...');
        for (const [cat, filename] of Object.entries(IMAGE_MAP)) {
            const targetName = cat.toLowerCase().replace(/\s+/g, '_') + '.png';
            const publicUrl = `/products/${targetName}`;

            // Update all products in this category to have this image
            // Only update if image_url is null or empty? Or overwrite all for consistency as per user request "create images for each product"
            await client.query(
                `UPDATE products SET image_url = $1 WHERE category = $2`,
                [publicUrl, cat]
            );
        }
        console.log('Database updated successfully.');
    } catch (e) {
        console.error('DB Update failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

setupImages();
