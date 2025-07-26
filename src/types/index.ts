export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CrimeReport {
  id: string;
  title: string;
  description: string;
  crimeType: string;
  location: string;
  geoPoint: any;
  images?: any;
  status: string;
  isAnonymous: boolean;
  reporterId?: string;
  reporterName?: string;
  reporterContact?: string;
  actionDetails?: string;
  trackingId: string; // 16-character hex code
  incidentDate: string;
  incidentTime: string;
  incidentDateTime: string; // ISO string
  userId?: string;
  updatedAt: string;
}
