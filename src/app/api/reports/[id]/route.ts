import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/[id] - Get a specific crime report by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const report = await prisma.crimeReport.findUnique({ where: { id } });
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Prefer user-filled incidentDate if available, otherwise fallback to updatedAt
    // Always return both date and time in ISO format
    let userDateTime = null;
    if (report.incidentDate) {
      userDateTime = new Date(report.incidentDate).toISOString();
    } else if (report.updatedAt) {
      userDateTime = new Date(report.updatedAt).toISOString();
    }
    return NextResponse.json({ report: { ...report, date: userDateTime } });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/reports/[id] - Update a crime report
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await req.json();
    const report = await prisma.crimeReport.update({ where: { id }, data });
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

// DELETE /api/reports/[id] - Delete a crime report
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.crimeReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
