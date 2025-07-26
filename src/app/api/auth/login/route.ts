import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { PrismaClient } from '@/generated/prisma';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // Use a strong secret in production

export async function POST(req: NextRequest) {
  try {
    const { email, password, isAdminLogin } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    if (isAdminLogin && user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized as admin' }, { status: 403 });
    }    // Create JWT
    const token = sign({ id: user.id, email: user.email, role: user.role, name: user.displayName || user.name }, JWT_SECRET, { expiresIn: '7d' });
    // Set cookie
    const res = NextResponse.json({ user: { uid: user.id, email: user.email, displayName: user.displayName || user.name, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    return NextResponse.json({ message: 'Login failed', error: error?.toString() }, { status: 500 });
  }
}
