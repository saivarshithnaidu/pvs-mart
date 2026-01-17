import { query } from '@/lib/db';
import KhataDashboard from './KhataDashboard';

export default async function KhataPage() {
    // Fetch all transactions
    const transactionsRes = await query(`
        SELECT k.*, u.name as customer_name, u.phone as customer_phone 
        FROM khata_book k
        JOIN users u ON k.user_id = u.id
        ORDER BY k.created_at DESC
    `);

    // Fetch customer balances
    // Sum DEBIT - Sum CREDIT
    const balancesRes = await query(`
        SELECT 
            u.id, 
            u.name, 
            u.phone,
            COALESCE(SUM(CASE WHEN k.entry_type = 'DEBIT' THEN k.amount ELSE 0 END), 0) as total_debit,
            COALESCE(SUM(CASE WHEN k.entry_type = 'CREDIT' THEN k.amount ELSE 0 END), 0) as total_credit
        FROM users u
        LEFT JOIN khata_book k ON u.id = k.user_id
        GROUP BY u.id, u.name, u.phone
        HAVING COUNT(k.id) > 0
    `);

    // Fetch all customers for the "Add Entry" dropdown
    const customersRes = await query('SELECT id, name, phone FROM users WHERE role = \'CUSTOMER\' ORDER BY name');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Khata Book (Ledger)</h2>
            <KhataDashboard
                transactions={transactionsRes.rows}
                balances={balancesRes.rows}
                customers={customersRes.rows}
            />
        </div>
    );
}
