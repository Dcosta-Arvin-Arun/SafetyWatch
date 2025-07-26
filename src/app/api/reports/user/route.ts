import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function GET(req: NextRequest) {
  try {
    // Get user from JWT cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ reports: [], total: 0 });
    }
    const decoded = verify(token, JWT_SECRET) as any;
    if (!decoded?.id) {
      return NextResponse.json({ reports: [], total: 0 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;
    const where = { userId: decoded.id };
    const [reports, total] = await Promise.all([
      prisma.crimeReport.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.crimeReport.count({ where }),
    ]);
    return NextResponse.json({ reports, total });
  } catch (error) {
    return NextResponse.json({ reports: [], total: 0, error: error?.toString() }, { status: 500 });
  }
}
