import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orderId = parseInt(id);

        // Auth Check
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Fetch Order
        const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderRes.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        const order = orderRes.rows[0];

        // 2. Permission Check: Owner OR Customer who owns the order
        if (user.role !== 'OWNER' && order.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Items (Join with products for names/images)
        // Assuming table 'order_items' has order_id, product_id, quantity, price
        const itemsRes = await query(
            `SELECT oi.id, oi.quantity, oi.price_at_time as price, p.name, p.image_url, p.sku 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1`,
            [orderId]
        );

        // 3. (Optional) Fetch User details if needed beyond ID
        const userRes = await query('SELECT name, email FROM users WHERE id = $1', [order.user_id]);
        const customer = userRes.rows[0];

        return NextResponse.json({
            ...order,
            customer,
            items: itemsRes.rows
        });

    } catch (error) {
        console.error('Order Details API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
