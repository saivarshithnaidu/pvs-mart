import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';
import { startOfDay, subDays, format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        // Strict Owner Only
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userPayload = await verifyToken(token);
        if (!userPayload || userPayload.role !== 'OWNER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Total Sales (Today) - Online + Offline
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Online Sales Today
        const onlineSalesRes = await query(
            `SELECT SUM(total_amount) as total FROM orders 
         WHERE created_at >= $1 AND payment_status = 'Paid'`,
            [today.toISOString()]
        );
        // Offline Sales Today
        const offlineSalesRes = await query(
            `SELECT SUM(total_amount) as total FROM offline_bills 
         WHERE created_at >= $1`,
            [today.toISOString()]
        );

        const totalSalesToday = (Number(onlineSalesRes.rows[0].total) || 0) + (Number(offlineSalesRes.rows[0].total) || 0);

        // 2. Total Orders (All Time)
        const totalOrdersRes = await query('SELECT COUNT(*) as count FROM orders');
        const totalOrders = Number(totalOrdersRes.rows[0].count);

        // 3. Products Stats
        const totalProductsRes = await query('SELECT COUNT(*) as count FROM products');
        const lowStockRes = await query('SELECT COUNT(*) as count FROM products WHERE stock < 10');

        const totalProducts = Number(totalProductsRes.rows[0].count);
        const lowStock = Number(lowStockRes.rows[0].count);

        // 4. Sales Chart Data (Last 7 Days)
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const start = new Date(date.setHours(0, 0, 0, 0)).toISOString();
            const end = new Date(date.setHours(23, 59, 59, 999)).toISOString();

            // Could optimize with a single GROUP BY query, but loop is readable for prototype
            const dayOnline = await query(
                `SELECT SUM(total_amount) as total FROM orders 
             WHERE created_at >= $1 AND created_at <= $2 AND payment_status = 'Paid'`,
                [start, end]
            );
            const dayOffline = await query(
                `SELECT SUM(total_amount) as total FROM offline_bills 
             WHERE created_at >= $1 AND created_at <= $2`,
                [start, end]
            );

            chartData.push({
                date: format(new Date(dateStr), 'MMM dd'),
                sales: (Number(dayOnline.rows[0].total) || 0) + (Number(dayOffline.rows[0].total) || 0)
            });
        }

        return NextResponse.json({
            totalSalesToday,
            totalOrders,
            totalProducts,
            lowStock,
            chartData
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
