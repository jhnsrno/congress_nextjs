import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbConnection, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log('Raw password:', password);
  console.log('Hashed password from DB:', hashedPassword);
  const result = await bcrypt.compare(password, hashedPassword);
  console.log('Password match result:', result);
  return result;
}

type TokenPayload = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export function generateToken(user: Omit<User, 'password'>): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const connection = await getDbConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  } finally {
    await connection.end();
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const connection = await getDbConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  } finally {
    await connection.end();
  }
}

/**
 * Update a user's profile (only selected fields).
 * Password is hashed if included.
 */
export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  const connection = await getDbConnection();

  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.username) {
      fields.push("username = ?");
      values.push(updates.username);
    }
    if (updates.email) {
      fields.push("email = ?");
      values.push(updates.email);
    }
    if (updates.password) {
      const hashed = await bcrypt.hash(updates.password, 10);
      fields.push("password = ?");
      values.push(hashed);
    }
    if (updates.first_name) {
      fields.push("first_name = ?");
      values.push(updates.first_name);
    }
    if (updates.last_name) {
      fields.push("last_name = ?");
      values.push(updates.last_name);
    }
    if (updates.role) {
      fields.push("role = ?");
      values.push(updates.role);
    }

    if (fields.length === 0) return null;

    values.push(id);
    await connection.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  } finally {
    await connection.end();
  }
}
