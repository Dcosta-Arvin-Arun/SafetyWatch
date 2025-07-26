import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verify } from 'jsonwebtoken';
import crypto from "crypto";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Helper to convert dd/mm/yyyy to yyyy-mm-dd
function parseDDMMYYYYtoISO(dateStr: string) {
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Helper to generate a 16-character hex tracking ID
function generateHexTrackingId(length = 16) {
  const bytes = new Uint8Array(length / 2);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    require('crypto').randomFillSync(bytes);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    // Get user from JWT cookie (optional for anonymous reports)
    const token = req.cookies.get('token')?.value;
    let userId = null;
    
    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as any;
        if (decoded?.id) {
          userId = decoded.id;
        }
      } catch (error) {
        // Invalid token, but allow anonymous submission
        console.log('Invalid token, proceeding as anonymous');
      }
    }
    
    const { reportData } = await req.json();
    // Map frontend reportData to DB fields
    let {
      title,
      description,
      crimeType,
      location,
      incidentDate,
      incidentTime,
      images,
      status = 'pending',
      isAnonymous = false,
      reporterId,
      reporterName,
      reporterContact,
      actionDetails,
      trackingId,
      incidentDateTime,
      geoPoint,
    } = reportData;
    // Flatten location to string (address)
    const locationString = typeof location === 'string' ? location : (location?.address || '');
    // Parse geoPoint if present
    const geoPointJson = location?.geoPoint ? location.geoPoint : geoPoint ? geoPoint : null;

    if ((!incidentDate || !incidentTime) && incidentDateTime) {
      const dt = new Date(incidentDateTime);
      if (!isNaN(dt.getTime())) {
        incidentDate = dt.toISOString().split('T')[0];
        incidentTime = dt.toTimeString().slice(0, 5);
      }
    }
    if (!incidentDateTime && incidentDate && incidentTime) {
      incidentDateTime = `${incidentDate}T${incidentTime}`;
    }
    let incidentDateObj: Date | undefined = undefined;
    if (incidentDate) {
      incidentDateObj = new Date(incidentDate);
      if (isNaN(incidentDateObj.getTime())) {
        return NextResponse.json({ error: 'Invalid incidentDate provided.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'incidentDate is required.' }, { status: 400 });
    }
    if (!incidentTime || typeof incidentTime !== 'string' || !/^\d{2}:\d{2}$/.test(incidentTime)) {
      return NextResponse.json({ error: 'incidentTime is required and must be in HH:MM format.' }, { status: 400 });
    }
    let incidentDateTimeObj: Date | undefined = undefined;
    if (incidentDateTime) {
      incidentDateTimeObj = new Date(incidentDateTime);
      if (isNaN(incidentDateTimeObj.getTime())) {
        return NextResponse.json({ error: 'Invalid incidentDateTime provided.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'incidentDateTime is required.' }, { status: 400 });
    }
    // Ensure trackingId is set as a 16-character hex code
    if (!trackingId) {
      trackingId = crypto.randomBytes(8).toString("hex"); // 16-char hex
    } else if (!/^[a-fA-F0-9]{16}$/.test(trackingId)) {
      // If trackingId is provided but not valid, generate a new one
      trackingId = crypto.randomBytes(8).toString("hex");
    }
    // Convert to ISO for DB
    const isoDate = parseDDMMYYYYtoISO(incidentDate);
    const isoDateTime = isoDate && incidentTime ? `${isoDate}T${incidentTime}:00` : null;

    // Compose the data for Prisma
    const report = await prisma.crimeReport.create({
      data: {
        title,
        description,
        crimeType,
        location,
        geoPoint,
        images,
        status,
        isAnonymous,
        reporterId,
        reporterName,
        reporterContact,
        actionDetails,
        trackingId,
        incidentDate,      
        incidentTime,     
        incidentDateTime,  
        userId,
      }
    });
    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('CREATE REPORT ERROR', error);
    return NextResponse.json({ error: error?.message || error?.toString() || 'Unknown error' }, { status: 500 });
  }
}
