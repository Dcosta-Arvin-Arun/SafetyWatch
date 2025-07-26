import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST() {
  // Clear the JWT cookie
  const res = NextResponse.json({ user: null });
  res.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
