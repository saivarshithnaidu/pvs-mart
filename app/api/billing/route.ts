import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
        // Auth Check
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userPayload = await verifyToken(token);
        if (!userPayload || userPayload.role !== 'OWNER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { customerName, items, paymentMethod } = await request.json();
        // items: { productId: number, quantity: number, price: number }[]

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in bill' }, { status: 400 });
        }

        const client = await import('@/lib/db').then(mod => mod.default); // Use pool for transaction
        const clientConn = await client.connect();

        try {
            await clientConn.query('BEGIN');

            // Calculate Total
            let total = 0;
            for (const item of items) {
                total += item.price * item.quantity;
            }

            // Generate Invoice Number: BILL-{Timestamp}-{Random}
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `BILL-${timestamp}-${random}`;

            // Create Bill Record
            const billRes = await clientConn.query(
                'INSERT INTO offline_bills (customer_name, total_amount, payment_method, invoice_number) VALUES ($1, $2, $3, $4) RETURNING id',
                [customerName || 'Walk-in', total, paymentMethod, invoiceNumber]
            );
            const billId = billRes.rows[0].id;

            // Update Stock & Check availability logic could be here
            for (const item of items) {
                await clientConn.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.productId]
                );
            }

            await clientConn.query('COMMIT');
            return NextResponse.json({ success: true, billId }, { status: 201 });

        } catch (e) {
            await clientConn.query('ROLLBACK');
            throw e;
        } finally {
            clientConn.release();
        }

    } catch (error) {
        console.error('Billing Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
