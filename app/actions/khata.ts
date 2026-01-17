'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addKhataEntry(formData: FormData) {
    const userId = formData.get('userId');
    const amount = formData.get('amount');
    const type = formData.get('type');
    const note = formData.get('note');

    if (!userId || !amount || !type) {
        throw new Error('Missing required fields');
    }

    try {
        await query(
            'INSERT INTO khata_book (user_id, amount, entry_type, note) VALUES ($1, $2, $3, $4)',
            [userId, amount, type, note]
        );
        revalidatePath('/admin/khata');
        return { success: true };
    } catch (error) {
        console.error('Failed to add khata entry:', error);
        return { success: false, error: 'Database error' };
    }
}
