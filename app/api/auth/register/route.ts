import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Role handling: Only specific emails can be OWNER. Everyone else is CUSTOMER.
    const allowedOwners = ['saivarshith8284@gmail.com', 'psvmart@mart.com'];
    const userRole = allowedOwners.includes(email) ? 'OWNER' : 'CUSTOMER';

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name',
      [email, hashedPassword, name, userRole]
    );

    const newUser = result.rows[0];

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
