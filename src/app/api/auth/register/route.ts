import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@/generated/prisma';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; 

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();
    if (!email || !password || !name || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        displayName: name, 
        password: hashedPassword,
        role
      },
    });// Create JWT
    const token = sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    // Set cookie
    const res = NextResponse.json({ user: { uid: user.id, email: user.email, displayName: user.name, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    return NextResponse.json({ message: 'Registration failed', error: error?.toString() }, { status: 500 });
  }
}
