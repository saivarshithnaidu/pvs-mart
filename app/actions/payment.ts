'use server';

import { query } from '@/lib/db';
import QRCode from 'qrcode';
import { getSession } from '@/lib/auth';

// PVS Mart UPI Configuration
const MERCHANT_UPI_ID = 'saivarshith8284@oksbi';
const MERCHANT_NAME = 'PVS Mart';

export async function generateUPILinks(orderId: number, amountOverride: number = 0) {
    try {
        let amount = amountOverride;

        // Securely fetch amount from DB if not provided or valid
        if (amount <= 0) {
            const res = await query('SELECT total_amount FROM orders WHERE id = $1', [orderId]);
            if (res.rows.length === 0) {
                return { success: false, error: 'Order not found' };
            }
            amount = parseFloat(res.rows[0].total_amount);
        }

        const transactionRef = `ORD${orderId}`; // Unique Order Reference
        const currency = 'INR';

        // Base UPI Intent string params
        const baseParams = `pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=${currency}&tn=${transactionRef}`;

        // 1. Generic UPI Link (Fallback)
        const genericLink = `upi://pay?${baseParams}`;

        // 2. Specific App Links (Deep Links)
        const googlePayLink = `tez://upi/pay?${baseParams}`;
        const phonePeLink = `phonepe://pay?${baseParams}`;
        const paytmLink = `paytmmp://pay?${baseParams}`;

        // 3. Generate QR Code Data URL (Standard UPI URL)
        const qrCodeDataUrl = await QRCode.toDataURL(genericLink, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });

        return {
            success: true,
            qrCodeDataUrl,
            amount, // Return amount to frontend
            links: {
                generic: genericLink,
                googlePay: googlePayLink,
                phonePe: phonePeLink,
                paytm: paytmLink
            }
        };
    } catch (error) {
        console.error('QR Gen Error:', error);
        return { success: false, error: 'Failed to generate QR Code' };
    }
}

export async function createPaymentRecord(orderId: number, amount: number) {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await query(
            `INSERT INTO upi_transactions (order_id, upi_id, amount, status) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [orderId, MERCHANT_UPI_ID, amount, 'PENDING']
        );
        return { success: true };
    } catch (error) {
        console.error('Payment Record Error:', error);
        return { success: false, error: 'Database error' };
    }
}
