import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/reports/[id]/status - Update only the status of a report
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { status } = await req.json();
    const report = await prisma.crimeReport.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
