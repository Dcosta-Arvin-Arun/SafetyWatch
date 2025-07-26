// TODO: Implement all report CRUD using Prisma and Next.js API routes.

import { CrimeReport, GeoPoint } from "@/types";
import { uploadImage, checkImagesSize } from "./storageLocal"; // Using local Base64 storage instead of external services

// Create a new crime report (client-side: fetch from API route)
export async function createCrimeReport(
  reportData: Omit<CrimeReport, "id">,
  imageFiles?: File[]
) {
  try {
    // Upload images if provided (local logic)
    const images = [];
    if (imageFiles && imageFiles.length > 0) {
      const filesToProcess = imageFiles.slice(0, 3);
      for (const file of filesToProcess) {
        const uploadedImage = await uploadImage(file);
        images.push(uploadedImage);
      }
      if (!checkImagesSize(images)) {
        throw new Error("Images are too large. Please use smaller or fewer images.");
      }
    }
    // Send report to API
    const res = await fetch('/api/reports/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reportData: { ...reportData, images } }),
    });
    if (!res.ok) throw new Error('Failed to create report');
    const data = await res.json();
    return data.report;
  } catch (error) {
    console.error('Error creating crime report:', error);
    throw error;
  }
}

// Get a specific crime report by ID
export async function getCrimeReport(reportId: string): Promise<CrimeReport | null> {
  try {
    const res = await fetch(`/api/reports/${reportId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.report || null;
  } catch (error) {
    console.error("Error fetching crime report:", error);
    throw error;
  }
}

// Get all crime reports
export async function getAllCrimeReports(): Promise<CrimeReport[]> {
  try {
    const res = await fetch('/api/reports/all');
    if (!res.ok) throw new Error('Failed to fetch reports');
    const data = await res.json();
    return data.reports || [];
  } catch (error) {
    console.error("Error fetching all crime reports:", error);
    throw error;
  }
}

// Utility to get all public (non-anonymous) reports
export async function getPublicCrimeReports() {
  const all = await getAllCrimeReports();
  // Show non-anonymous reports, and anonymous reports that are verified or resolved
  return all.filter(
    (r) =>
      !r.isAnonymous ||
      (r.isAnonymous && (r.status === "verified" || r.status === "resolved"))
    // trackingId is always a 16-character hex code, not a UUID
  );
}

// Get reports by user ID (client-side: fetch from API route)
export async function getUserCrimeReports(userId?: string): Promise<CrimeReport[]> {
  try {
    // Always fetch from API route, ignore userId param (use JWT on server)
    const res = await fetch('/api/reports/user', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch user reports');
    const data = await res.json();
    return data.reports || [];
  } catch (error) {
    console.error('Error fetching user crime reports:', error);
    throw error;
  }
}

// Update a crime report
export async function updateCrimeReport(
  reportId: string,
  reportData: Partial<Omit<CrimeReport, "id">>,
  imageFiles?: File[]
): Promise<CrimeReport> {
  try {
    let images = reportData.images || [];
    if (imageFiles && imageFiles.length > 0) {
      const filesToProcess = imageFiles.slice(0, 3);
      for (const file of filesToProcess) {
        const uploadedImage = await uploadImage(file);
        images.push(uploadedImage);
      }
      if (!checkImagesSize(images)) {
        throw new Error("Images are too large. Please use smaller or fewer images.");
      }
    }
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...reportData, images }),
    });
    if (!res.ok) throw new Error('Failed to update report');
    const data = await res.json();
    return data.report;
  } catch (error) {
    console.error("Error updating crime report:", error);
    throw error;
  }
}

// Delete a crime report
export async function deleteCrimeReport(reportId: string): Promise<void> {
  try {
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete report');
  } catch (error) {
    console.error("Error deleting crime report:", error);
    throw error;
  }
}

// Mark a report status
export async function updateReportStatus(
  id: string,
  status: "pending" | "reviewing" | "verified" | "resolved" | "rejected"
) {
  try {
    const res = await fetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return (await res.json()).report;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
}

// Update a crime report status (Admin only)
export async function updateCrimeReportStatus(
  id: string,
  status: "pending" | "reviewing" | "verified" | "resolved" | "rejected"
) {
  // Alias for updateReportStatus
  return updateReportStatus(id, status);
}

// Get reports by area (based on geo proximity)
export async function getReportsByArea(center: GeoPoint, radiusKm: number): Promise<CrimeReport[]> {
  try {
    const res = await fetch(`/api/reports/area?lat=${center.latitude}&lng=${center.longitude}&radius=${radiusKm}`);
    if (!res.ok) throw new Error('Failed to fetch area reports');
    const data = await res.json();
    return data.reports || [];
  } catch (error) {
    console.error("Error fetching reports by area:", error);
    throw error;
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
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
