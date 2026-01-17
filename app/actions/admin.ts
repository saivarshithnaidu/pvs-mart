'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function verifyPayment(orderId: number) {
    const session = await getSession();
    if (!session || session.role !== 'OWNER') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await query('BEGIN');

        // 1. Update Order Status
        await query(
            `UPDATE orders SET payment_status = 'PAID' WHERE id = $1`,
            [orderId]
        );

        // 2. Update UPI Payment Status
        await query(
            `UPDATE upi_transactions 
             SET status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP 
             WHERE order_id = $2`,
            [session.id, orderId]
        );

        // 3. Log Audit
        await query(
            `INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details)
             VALUES ($1, $2, $3, $4, $5)`,
            ['PAYMENT_VERIFIED', 'ORDER', String(orderId), session.id, JSON.stringify({ old_status: 'PENDING', new_status: 'PAID' })]
        );

        await query('COMMIT');
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        await query('ROLLBACK');
        console.error('Verify Payment Error:', error);
        return { success: false, error: 'Database error' };
    }
}
