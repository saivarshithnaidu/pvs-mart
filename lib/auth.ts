import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'dependency-install-default-secret';
const key = new TextEncoder().encode(SECRET_KEY);

// -- Password Handling --

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// -- JWT Handling --

interface UserPayload {
    id: number;
    email: string;
    role: 'OWNER' | 'CUSTOMER';
    name: string;
}

export async function signToken(payload: UserPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // Token expires in 24 hours
        .sign(key);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as unknown as UserPayload;
    } catch (error) {
        return null;
    }
}

// -- Session Management --

export async function getSession(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;
    return await verifyToken(token);
}

export async function loginUser(payload: UserPayload) {
    const token = await signToken(payload);
    const cookieStore = await cookies();

    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
}
