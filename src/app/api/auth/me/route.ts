import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }
    const decoded = verify(token, JWT_SECRET) as any;
    // Fetch user from DB to ensure displayName is always up-to-date
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: { uid: user.id, email: user.email, displayName: user.displayName || user.name, role: user.role } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
