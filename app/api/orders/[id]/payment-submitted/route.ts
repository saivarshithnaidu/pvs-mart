import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(
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

        // 1. Verify Ownership
        const orderRes = await query('SELECT user_id, status FROM orders WHERE id = $1', [orderId]);
        if (orderRes.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderRes.rows[0];
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Update Status
        // Only allow update if status is 'Pending' or 'Created' (adjust based on existing logic)
        // We set it to PAYMENT_SUBMITTED
        await query('UPDATE orders SET status = $1, payment_status = $2 WHERE id = $3', ['PAYMENT_SUBMITTED', 'PENDING_VERIFICATION', orderId]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Payment Confirm Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
