import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

// GET: List all products with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const isActive = searchParams.get('active') === 'true';
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const sort = searchParams.get('sort'); // price_asc, price_desc
        const minPrice = searchParams.get('min_price');
        const maxPrice = searchParams.get('max_price');

        let sql = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (isActive) {
            sql += ` AND is_active = true`;
        }

        if (category) {
            sql += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (subcategory) {
            sql += ` AND subcategory = $${paramIndex}`;
            params.push(subcategory);
            paramIndex++;
        }

        if (minPrice) {
            sql += ` AND price >= $${paramIndex}`;
            params.push(minPrice);
            paramIndex++;
        }

        if (maxPrice) {
            sql += ` AND price <= $${paramIndex}`;
            params.push(maxPrice);
            paramIndex++;
        }

        // Sorting
        if (sort === 'price_asc') {
            sql += ' ORDER BY price::numeric ASC';
        } else if (sort === 'price_desc') {
            sql += ' ORDER BY price::numeric DESC';
        } else {
            sql += ' ORDER BY created_at DESC';
        }

        const result = await query(sql, params);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Products GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new product (Owner only)
export async function POST(request: Request) {
    try {
        // Auth Check
        const headersList = await headers();
        const token = (await ((await headersList).get('cookie')))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userPayload = await verifyToken(token);
        if (!userPayload || userPayload.role !== 'OWNER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { name, category, price, stock, description, image_url } = await request.json();

        // Generate SKU: PVS-{CAT}-{RANDOM}
        // E.g. Grocery -> GRO
        const catCode = category ? category.substring(0, 3).toUpperCase() : 'GEN';
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const sku = `PVS-${catCode}-${uniqueSuffix}`;

        if (!name || !price || stock === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO products (name, category, price, stock, description, image_url, sku)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [name, category, price, stock, description, image_url, sku]
        );

        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error) {
        console.error('Products API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update Product
export async function PUT(request: Request) {
    try {
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id, name, category, price, stock, description, image_url } = await request.json();

        const result = await query(
            `UPDATE products 
             SET name = $1, category = $2, price = $3, stock = $4, description = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [name, category, price, stock, description, image_url, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error('Products PUT Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
