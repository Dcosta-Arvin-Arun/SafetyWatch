import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/all - Get all crime reports with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;
    const [reports, total] = await Promise.all([
      prisma.crimeReport.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.crimeReport.count(),
    ]);
    return NextResponse.json({ reports, total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST not allowed
export function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
