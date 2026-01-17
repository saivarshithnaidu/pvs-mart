import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    console.log('Login Attempt:', identifier);

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Check if identifier is phone or email
    const isEmail = identifier.includes('@');
    let userQuery = 'SELECT * FROM users WHERE phone = $1';

    if (isEmail) {
      userQuery = 'SELECT * FROM users WHERE email = $1';
    }

    const result = await query(userQuery, [identifier]);
    const user = result.rows[0];

    if (!user) {
      console.log('Login Failed: User not found for', identifier);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login: User found, Verifying password...');
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      console.log('Login Failed: Invalid password for', identifier);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last_login_at
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });

    console.log('Login Successful for', identifier);
    return NextResponse.json({ success: true, role: user.role }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
