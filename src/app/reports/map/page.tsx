"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/main-nav";
import dynamic from "next/dynamic";
import { getPublicCrimeReports } from "@/lib/reports";
import { CrimeReport } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context"; 
import { formatReportDateTime } from "@/lib/utils";

const CrimeMap = dynamic(() => import("@/components/crime-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">Loading map...</p>
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
});

export default function CrimeMapPage() {
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        setError(null);
        const allReports = await getPublicCrimeReports();
        // Only show reports that are verified or resolved
        const validReports = allReports.filter(
          (report) =>
            (report.status === "verified" || report.status === "resolved") &&
            report.geoPoint?.latitude &&
            report.geoPoint?.longitude
        );
        
        if (validReports.length === 0) {
          setError("No reports with valid location data found");
        }
        
        setReports(validReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError("Failed to load crime reports");
        toast.error("Failed to load crime reports");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []);

  return (
    <div className="flex min-h-screen flex-col max-w-[95%] mx-auto">
      <MainNav />
      <main className="flex-1 py-8 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Crime Report Map</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              View the geographic distribution of reported incidents
            </p>
          </div>
          {/* Report buttons removed for all users */}
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0 overflow-hidden">
            {error ? (
              <div className="h-[600px] flex flex-col items-center justify-center gap-4 bg-muted rounded-lg">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="h-[600px] md:h-[700px]">
                <CrimeMap reports={reports} isLoading={isLoading} />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}