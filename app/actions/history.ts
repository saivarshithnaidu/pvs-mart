'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function addToHistory(productId: number) {
    const session = await getSession();
    if (!session) return; // Only track logged-in users

    try {
        // Remove existing entry for this product to keep only latest (pseudo-upsert without unique constraint)
        await query('DELETE FROM recently_viewed WHERE user_id = $1 AND product_id = $2', [session.id, productId]);

        // Add new entry
        await query('INSERT INTO recently_viewed (user_id, product_id) VALUES ($1, $2)', [session.id, productId]);

        // Cleanup: Keep only last 20 items per user
        // This is expensive on every view, maybe do it occasionally or just let it grow (it's metadata).
        // For production, maybe just delete old > 20.
        // DELETE FROM recently_viewed WHERE id IN (SELECT id FROM recently_viewed WHERE user_id = $1 ORDER BY viewed_at DESC OFFSET 20)
    } catch (e) {
        console.error('Failed to track view:', e);
    }
}

export async function getRecentViews(limit: number = 5) {
    const session = await getSession();
    if (!session) return [];

    try {
        const res = await query(`
            SELECT p.id, p.name, p.category, p.price, p.image_url, p.weight
            FROM recently_viewed rv
            JOIN products p ON rv.product_id = p.id
            WHERE rv.user_id = $1
            ORDER BY rv.viewed_at DESC
            LIMIT $2
        `, [session.id, limit]);
        return res.rows;
    } catch (e) {
        console.error('Failed to fetch history:', e);
        return [];
    }
}
