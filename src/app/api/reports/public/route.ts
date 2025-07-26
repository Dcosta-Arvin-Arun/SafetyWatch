import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/public - Get all public (non-anonymous or verified/resolved anonymous) reports with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;
    const where = {
      OR: [
        { isAnonymous: false },
        {
          AND: [
            { isAnonymous: true },
            { status: { in: ['verified', 'resolved'] } },
          ],
        },
      ],
    };
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
    return NextResponse.json({ error: 'Failed to fetch public reports' }, { status: 500 });
  }
}
