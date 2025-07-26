import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/area?lat=...&lng=...&radius=...&page=...&pageSize=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '5');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    // Calculate bounding box for initial DB filter
    const R = 6371; // Earth radius in km
    const dLat = radius / R * (180 / Math.PI);
    const dLng = radius / (R * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);
    const minLat = lat - dLat;
    const maxLat = lat + dLat;
    const minLng = lng - dLng;
    const maxLng = lng + dLng;
    // Fetch reports in bounding box using Prisma JSON filtering (dot notation for path)
    const allReports = await prisma.crimeReport.findMany({
      where: {
        geoPoint: {
          path: 'latitude',
          gte: minLat,
          lte: maxLat,
        },
        AND: [
          {
            geoPoint: {
              path: 'longitude',
              gte: minLng,
              lte: maxLng,
            },
          },
        ],
      },
    });
    // Haversine filter
    function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    // Type guard for geoPoint
    function isGeoPoint(obj: any): obj is { latitude: number; longitude: number } {
      return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.latitude === 'number' &&
        typeof obj.longitude === 'number'
      );
    }
    const filtered = allReports.filter(r => {
      let geoPoint: { latitude: number; longitude: number } | undefined;
      if (typeof r.geoPoint === 'string') {
        try {
          const parsed = JSON.parse(r.geoPoint);
          if (isGeoPoint(parsed)) geoPoint = parsed;
        } catch {
          return false;
        }
      } else if (isGeoPoint(r.geoPoint)) {
        geoPoint = r.geoPoint;
      }
      if (!geoPoint) return false;
      const { latitude, longitude } = geoPoint;
      return haversine(lat, lng, latitude, longitude) <= radius;
    });
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    return NextResponse.json({ reports: paginated, total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch area reports' }, { status: 500 });
  }
}
