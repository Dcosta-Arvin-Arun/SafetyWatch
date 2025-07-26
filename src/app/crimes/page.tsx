"use client";

import { useState, useEffect, useCallback } from "react";
import { CrimeReport } from "@/types";
import { getPublicCrimeReports } from "@/lib/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDistance, formatReportDateTime } from "@/lib/utils";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/ui/footer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CrimesPage() {
  const [allReports, setAllReports] = useState<CrimeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CrimeReport[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<"nearby" | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);

  // --- NEW: Keep layout stable during loading ---
  const skeletonArray = Array(6).fill(0);

  const sortReports = useCallback((reports: CrimeReport[], sortType: "nearby" | "all") => {
    let reportsToProcess = [...reports];
    try {
      setIsSorting(true);

      if (sortType === "nearby" && userLocation) {
        // Only sort reports that have valid geoPoint
        return [...reportsToProcess]
          .filter(r => r.geoPoint)
          .sort((a, b) => {
            const distA = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              a.geoPoint!.latitude,
              a.geoPoint!.longitude
            );
            const distB = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              b.geoPoint!.latitude,
              b.geoPoint!.longitude
            );
            return distA - distB;
          });
      } else {
        return [...reportsToProcess].sort(
          (a, b) => new Date(b.incidentDateTime).getTime() - new Date(a.incidentDateTime).getTime()
        );
      }
    } catch (err) {
      console.error("Error sorting reports:", err);
      toast.error("Error sorting reports. Showing all reports by date.");
      return reportsToProcess.sort(
        (a, b) => new Date(b.incidentDateTime).getTime() - new Date(a.incidentDateTime).getTime()
      );
    } finally {
      setIsSorting(false);
    }
  }, [userLocation]);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const reports = await getPublicCrimeReports();
        const activeReports = reports.filter(
          (report) => report.status === "verified" || report.status === "resolved"
        );
        setAllReports(activeReports);
        setFilteredReports(sortReports(activeReports, "all"));
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load crime reports. Please try again later.");
        toast.error("Failed to load crime reports");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [sortReports]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Error getting user location:", err);
          toast.warning("Location access denied. Showing all reports by date.");
          setSortBy("all");
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    } else {
      toast.warning("Geolocation not supported. Showing all reports by date.");
      setSortBy("all");
    }
  }, []);

  useEffect(() => {
    if (allReports.length > 0) {
      const sorted = sortReports(allReports, sortBy);
      setFilteredReports(sorted);
    }
  }, [allReports, sortBy, sortReports]);

  const handleSortChange = (newSortBy: "nearby" | "all") => {
    if (newSortBy === "nearby" && !userLocation) {
      toast.warning("Location not available. Cannot sort by nearby.");
      return;
    }
    setSortBy(newSortBy);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen font-aptos">
        <MainNav />
        <div className="container mx-auto p-8 flex-grow">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight">Reported Crimes</h1>
            <p className="text-muted-foreground mt-2">
              Browse and view details of reported incidents.
            </p>
          </motion.header>
          <div className="flex justify-center space-x-4 mt-15 mb-1">
            <Button variant="outline" disabled>
              Sort by Nearby
            </Button>
            <Button variant="outline" disabled>
              Show All (Newest First)
            </Button>
          </div>
          <div className="my-10 border-t-2 border-[#3b5998]" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 my-10"
          >
            {skeletonArray.map((_, idx) => (
              <div
                key={idx}
                className="h-full flex flex-col border border-[#3b5998] shadow-lg rounded-xl bg-[#f5f8fa] p-6 animate-pulse"
                style={{ minHeight: 220 }}
              >
                <div className="h-6 bg-blue-100 rounded w-2/3 mb-2" />
                <div className="h-4 bg-blue-50 rounded w-1/3 mb-4" />
                <div className="h-4 bg-blue-50 rounded w-full mb-2" />
                <div className="h-4 bg-blue-50 rounded w-5/6 mb-2" />
                <div className="h-4 bg-blue-50 rounded w-1/2 mb-4" />
                <div className="h-8 bg-blue-100 rounded w-full mt-auto" />
              </div>
            ))}
          </motion.div>
          <div className="my-10 border-t-2 border-[#3b5998]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen font-aptos">
        <MainNav />
        <div className="container mx-auto p-4 text-center flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-red-500"
          >
            <p>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
              onClick={() => window.location.reload()}
              type="button"
            >
              <span className="block w-full">
                Try Again
              </span>
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-aptos">
      <MainNav />
      <div className="container mx-auto p-8 flex-grow">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight">Reported Crimes</h1>
          <p className="text-muted-foreground mt-2">
            Browse and view details of reported incidents.
          </p>
        </motion.header>

        <>
          {/* Sort buttons: more space above, close to the line below */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center space-x-4 mt-15 mb-1"
          >
            <Button
              onClick={() => handleSortChange("nearby")}
              variant={sortBy === "nearby" ? "default" : "outline"}
              disabled={!userLocation || isSorting}
              className="transition-all duration-200 hover:shadow-md"
            >
              {isSorting && sortBy === "nearby" ? "Sorting..." : "Sort by Nearby"}
            </Button>
            <Button
              onClick={() => handleSortChange("all")}
              variant={sortBy === "all" ? "default" : "outline"}
              disabled={isSorting}
              className="transition-all duration-200 hover:shadow-md"
            >
              {isSorting && sortBy === "all" ? "Sorting..." : "Show All (Newest First)"}
            </Button>
          </motion.div>
          <div className="my-10 border-t-2 border-[#3b5998]" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 my-10"
          >
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <a
                  href={`/reports/${report.id}`}
                  className="block h-full"
                  tabIndex={0}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    className="h-full flex flex-col transition-all duration-200 border border-[#3b5998] shadow-lg rounded-xl bg-[#f5f8fa] hover:bg-[#e4eaf3] cursor-pointer p-6"
                    style={{ fontFamily: 'Aptos, sans-serif' }}
                  >
                    <CardHeader className="p-0 mb-2">
  <CardTitle className="text-lg text-[#000040]">{report.title}</CardTitle>
  <p className="text-sm text-blue-900">
    {/* Capitalize first letter of crimeType */}
    {report.crimeType
      ? report.crimeType.charAt(0).toUpperCase() + report.crimeType.slice(1)
      : ""}
    {"  • "}{formatReportDateTime(report).combined}
  </p>
</CardHeader>
                    <CardContent className="flex-grow p-0">
                      <p className="text-sm mb-5 line-clamp-3 text-justify text-blue-900">
                        {report.description}
                      </p>
                      <p className="text-xs text-blue-700 mb-1 truncate">
                        Location: {report.location || "N/A"}
                      </p>
                      {userLocation && sortBy === "nearby" && report.geoPoint && (
                        <p className="text-xs text-blue-700">
                          Distance: {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            report.geoPoint!.latitude,
                            report.geoPoint!.longitude
                          ).toFixed(2)} km away
                        </p>
                      )}
                    </CardContent>
                    <div className="pt-2 pb-1">
                      <Button 
                        variant="link" 
                        className="w-full transition-colors duration-200 hover:text-primary"
                        asChild
                      >
                        <span>View Details</span>
                      </Button>
                    </div>
                  </Card>
                </a>
              </motion.div>
            ))}
          </motion.div>
          <div className="my-10 border-t-2 border-[#3b5998]" />
        </>
      </div>
    </div>
  );
}