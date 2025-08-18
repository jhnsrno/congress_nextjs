import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const user = await getUserById(payload.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Remove password field safely without assigning it
  const { password: _, ...userWithoutPassword } = user;

  return NextResponse.json({ user: userWithoutPassword });
}
