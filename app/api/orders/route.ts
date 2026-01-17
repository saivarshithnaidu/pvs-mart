import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

// GET: Fetch all orders (Owner) or My Orders (Customer) - For now Admin only based on path usage
export async function GET(request: Request) {
    try {
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let sql = '';
        let params: any[] = [];

        if (user.role === 'OWNER') {
            // Admin sees all
            sql = 'SELECT * FROM orders ORDER BY created_at DESC';
        } else {
            // Customer sees own
            sql = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
            params = [user.id];
        }

        const result = await query(sql, params);
        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Orders GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update Order Status (Owner Only)
export async function PUT(request: Request) {
    try {
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id, status } = await request.json();

        const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled', 'PAYMENT_SUBMITTED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Orders PUT Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
