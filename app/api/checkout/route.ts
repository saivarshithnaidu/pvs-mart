import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
        // 1. Auth Check (Required for placing order?)
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        // Privacy First: We track orders by User ID if logged in.
        let userId = null;
        if (token) {
            const userPayload = await verifyToken(token);
            if (userPayload) userId = userPayload.id;
        }

        // If we require login to checkout, enforce it here:
        if (!userId) {
            return NextResponse.json({ error: 'Please login to place an order' }, { status: 401 });
        }

        const { items, paymentMethod = 'CASH' } = await request.json(); // Default to CASH if not specified

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total amount from items payload (or ideally DB)
        // Ensure items have price. If not, this will be NaN. Assuming frontend sends price.
        const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);

        const client = await import('@/lib/db').then(mod => mod.default);
        const clientConn = await client.connect();

        try {
            await clientConn.query('BEGIN');

            // Generate Invoice Number: ORD-{Date}-{Random}
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `ORD-${dateStr}-${random}`;

            // 1. Create Order
            // Status: 'Pending' for all initially.
            // Payment Status: 'Pending' for COD and UPI (until verified).
            const orderRes = await clientConn.query(
                `INSERT INTO orders (user_id, total_amount, status, payment_status, payment_method, invoice_number) 
             VALUES ($1, $2, 'Pending', 'PENDING', $3, $4) 
             RETURNING id`,
                [userId, totalAmount, paymentMethod, invoiceNumber]
            );
            const orderId = orderRes.rows[0].id;

            // 2. Create Order Items & Update Stock
            for (const item of items) {
                // Verify price/stock again ideally
                await clientConn.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
                    [orderId, item.productId, item.quantity, item.price]
                );

                await clientConn.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.productId]
                );
            }

            await clientConn.query('COMMIT');
            return NextResponse.json({ success: true, orderId }, { status: 201 });

        } catch (e) {
            await clientConn.query('ROLLBACK');
            console.error('Checkout Transaction Error', e);
            return NextResponse.json({ error: 'Order processing failed' }, { status: 500 });
        } finally {
            clientConn.release();
        }

    } catch (error) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
