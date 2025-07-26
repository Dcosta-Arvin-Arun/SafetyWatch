import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats a report's date and time for display, using incidentDate/incidentTime if present,
 * else falling back to incidentDateTime. Always returns in 'dd/mm/yyyy' and 'hh:mm' (24-hour) format.
 * Returns { date: string, time: string, combined: string }
 */
export function formatReportDateTime(report: { incidentDateTime?: string, incidentDate?: string, incidentTime?: string }): { date: string, time: string, combined: string } {
  let date = '-';
  let time = '-';
  if (report.incidentDate && report.incidentTime) {
    // incidentDate is dd/mm/yyyy, incidentTime is hh:mm
    date = report.incidentDate;
    time = report.incidentTime;
  } else if (report.incidentDateTime && !isNaN(new Date(report.incidentDateTime).getTime())) {
    const d = new Date(report.incidentDateTime);
    date = d.toLocaleDateString('en-GB');
    time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return {
    date,
    time,
    combined: date !== '-' && time !== '-' ? `${date} • ${time}` : date !== '-' ? date : '-',
  };
}
