import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q'); // query

        if (!q) {
            return NextResponse.json([]);
        }

        // 1. Perform Search (Simple DB ILIKE)
        const searchRes = await query(
            `SELECT * FROM products 
         WHERE is_active = true AND (name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)`,
            [`%${q}%`]
        );
        const results = searchRes.rows;

        // 2. Log Search (Async, don't block response)
        const headersList = await headers();
        const token = (await headersList.get('cookie'))?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let userId = null;
        if (token) {
            const userPayload = await verifyToken(token);
            if (userPayload) userId = userPayload.id;
        }

        // Fire and forget logging
        (async () => {
            try {
                await query(
                    `INSERT INTO search_logs (user_id, keyword, result_count) VALUES ($1, $2, $3)`,
                    [userId, q, results.length]
                );
            } catch (err) {
                console.error('Search Log Error', err);
            }
        })();

        return NextResponse.json(results);

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
