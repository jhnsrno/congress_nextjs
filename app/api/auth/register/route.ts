import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { hashPassword, getUserByEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, firstName, lastName, role = 'user' } = await request.json();

    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const connection = await getDbConnection();
    try {
      await connection.execute(
        'INSERT INTO users (username, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, firstName, lastName]
      );

      return NextResponse.json(
        { message: 'User registered successfully' },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}