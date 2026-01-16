import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login Attempt:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('Login Failed: User not found for', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login: User found, Verifying password...');
    const isValid = await verifyPassword(password, user.password_hash);
    console.log('Login: Password valid?', isValid);

    if (!isValid) {
      console.log('Login Failed: Invalid password for', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    await loginUser({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    console.log('Login Successful for', email);
    return NextResponse.json({ success: true, role: user.role }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
