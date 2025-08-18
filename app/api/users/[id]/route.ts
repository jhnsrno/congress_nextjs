import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

// Initialize MySQL connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const { username, email, password, role, first_name, last_name } = await request.json();

    // Validate required fields (password is optional for updates)
    if (!username || !email || !role || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Username, email, role, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username or email already exists for other users
    const [duplicateCheck] = await connection.execute(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId]
    );

    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Username or email already exists for another user' },
        { status: 409 }
      );
    }

    if (password && password.trim() !== '') {
      // Update with new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      await connection.execute(`
        UPDATE users 
        SET username = ?, email = ?, password = ?, role = ?, 
            first_name = ?, last_name = ?, updated_at = NOW()
        WHERE id = ?
      `, [username, email, hashedPassword, role, first_name, last_name, userId]);
    } else {
      // Update without changing password
      await connection.execute(`
        UPDATE users 
        SET username = ?, email = ?, role = ?, 
            first_name = ?, last_name = ?, updated_at = NOW()
        WHERE id = ?
      `, [username, email, role, first_name, last_name, userId]);
    }

    // Get updated user
    const [updatedUser] = await connection.execute(`
      SELECT id, username, email, role, first_name, last_name, created_at, updated_at
      FROM users WHERE id = ?
    `, [userId]);

    await connection.end();

    return NextResponse.json(Array.isArray(updatedUser) ? updatedUser[0] : null);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const connection = await mysql.createConnection(dbConfig);

    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    await connection.end();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT id, username, email, role, first_name, last_name, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `, [userId]);
    
    await connection.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0] as User);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}