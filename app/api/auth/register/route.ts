import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, phone, email, password } = await request.json();

    if (!phone || !password || !name) {
      return NextResponse.json({ error: 'Name, Phone, and Password are required' }, { status: 400 });
    }

    // Role handling: Only specific emails can be OWNER. Everyone else is CUSTOMER.
    const allowedOwners = ['saivarshith8284@gmail.com', 'psvmart@mart.com'];
    const userRole = (email && allowedOwners.includes(email)) ? 'OWNER' : 'CUSTOMER';

    // Check if phone already exists
    const existingPhone = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingPhone.rows.length > 0) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingEmail.rows.length > 0) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      'INSERT INTO users (name, phone, email, password_hash, role, country_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, phone, email, role',
      [name, phone, email || null, hashedPassword, userRole, '+91']
    );

    const newUser = result.rows[0];

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
