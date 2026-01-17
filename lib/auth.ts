import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

// -- Password Handling --

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// -- Session Management --

interface UserPayload {
    id: number;
    name: string;
    email?: string;
    role: 'OWNER' | 'CUSTOMER';
    phone?: string;
}

export async function createSession(user: UserPayload) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in DB
    await query(
        `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
    );

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt,
        path: '/',
    });
}

export async function getSession(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    // Verify session from DB
    const res = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, s.expires_at 
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = $1`,
        [token]
    );

    if (res.rows.length === 0) {
        return null;
    }

    const session = res.rows[0];

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
        await query('DELETE FROM sessions WHERE token = $1', [token]);
        return null;
    }

    return {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role || 'CUSTOMER', // Default to customer if null
        phone: session.phone
    };
}

export async function logoutUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
        await query('DELETE FROM sessions WHERE token = $1', [token]);
    }
    cookieStore.delete('token');
}

// Helper for middleware (lighter check if needed, but DB check is safest)
export async function verifyToken(token: string): Promise<UserPayload | null> {
    // Reuses getSession logic but implies we already have the token string
    const res = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, s.expires_at 
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = $1`,
        [token]
    );

    if (res.rows.length === 0) return null;

    if (new Date(res.rows[0].expires_at) < new Date()) {
        await query('DELETE FROM sessions WHERE token = $1', [token]);
        return null;
    }

    return {
        id: res.rows[0].id,
        name: res.rows[0].name,
        email: res.rows[0].email,
        role: res.rows[0].role || 'CUSTOMER',
        phone: res.rows[0].phone
    };
}
