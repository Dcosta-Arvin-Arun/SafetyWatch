"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  User,
  Tag,
  FileText,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { getCrimeReport } from "@/lib/reports";
import { CrimeReport } from "@/types";
import dynamic from "next/dynamic";
import { formatReportDateTime } from "@/lib/utils";

const MapPickerReadOnly = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-md" />
});

// Helper to get badge color classes like admin dashboard
const getBadgeClass = (status: CrimeReport["status"]) => {
  switch (status) {
    case "verified":
      return "bg-purple-100 text-purple-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewing":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper to check if a date string is a valid ISO date
function isValidDateString(dateString?: string) {
  if (!dateString) return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
}

export default function ReportDetailsPage() {
  const [report, setReport] = useState<CrimeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;

  const getStatusBadge = (status: string) => {
    const variants = {
      solved: {
        text: "Solved",
        variant: "default" as const,
        icon: "✅"
      },
      reviewing: {
        text: "Under Review",
        variant: "secondary" as const,
        icon: "🔍"
      },
      identified: {
        text: "Suspect Identified",
        variant: "secondary" as const,
        icon: "🕵️"
      },
      rejected: {
        text: "Rejected",
        variant: "destructive" as const,
        icon: "❌"
      },
      pending: {
        text: "Pending Review",
        variant: "outline" as const,
        icon: "⏳"
      }
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        const reportData = await getCrimeReport(reportId);
        if (!reportData) {
          setReport(null);
          setIsLoading(false);
          return;
        }
        setReport(reportData);
      } catch (error) {
        console.error("Error loading report:", error);
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [reportId]); // Only depend on reportId

  if (isLoading) {
    return (
      <>
        <MainNav />
        <div className="py-10 mx-auto max-w-[95%]">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[350px]" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <MainNav />
        <div className="py-10 mx-auto max-w-[95%] text-center">
          <h2 className="text-2xl font-semibold mb-4">Report Not Found</h2>
          <p className="text-gray-500">The requested crime report does not exist or is no longer available.</p>
        </div>
      </>
    );
  }

  // Use the same logic as the track page for incident date/time
  const { date: incidentDateStr, time: incidentTimeStr } = report ? formatReportDateTime(report) : { date: '-', time: '-' };

  const statusBadge = getStatusBadge(report.status);

  return (
    <>
      <MainNav />
      <div className="container py-10 mx-auto max-w-[95%]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6"
        >

          {/* Header Section */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col md:flex-row justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                <Badge className={getBadgeClass(report.status)}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Reported on {incidentDateStr !== '-' ? `${incidentDateStr}${incidentTimeStr !== '-' ? ' ' + incidentTimeStr : ''}` : '-'}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Incident Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                        Description
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-justify">
                        {report.description}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-1">
                        <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                          <Tag className="h-4 w-4" /> Crime Type
                        </h3>
                        <p className="text-sm">
                          {report.crimeType
                            ? report.crimeType.charAt(0).toUpperCase() + report.crimeType.slice(1)
                            : ""}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" /> Date Occurred
                        </h3>
                        <p className="text-sm">
                          {incidentDateStr !== '-' ? `${incidentDateStr}${incidentTimeStr !== '-' ? ' ' + incidentTimeStr : ''}` : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Location Card */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Incident Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">{report.location || "N/A"}</p>
                    </div>
                    {report.geoPoint ? (
                      <div className="h-[300px] rounded-md overflow-hidden border">
                        <MapPickerReadOnly
                          initialCoordinates={[
                            report.geoPoint.latitude,
                            report.geoPoint.longitude,
                          ]}
                          readOnly={true}
                        />
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-gray-100 rounded-md border">
                        Location not available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Evidence Images */}
              {Array.isArray(report.images) && report.images.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" /> Evidence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {report.images.map((image, index) => {
                          const url = typeof image === "string" ? image : image?.url;
                          if (!url) return null;
                          return (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="relative aspect-square rounded-md overflow-hidden border cursor-pointer"
                              onClick={() => setActiveImage(url)}
                            >
                              <img
                                src={url}
                                alt={`Evidence ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Case Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Current Status
                      </h3>
                      <Badge className={getBadgeClass(report.status) + " mt-1"}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </div>

                    {report.actionDetails && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Investigator Notes
                        </h3>
                        <p className="text-sm mt-1 whitespace-pre-line">
                          {report.actionDetails}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </h3>
                      <p className="text-sm">
                        {(() => {
                          const d = new Date(report.updatedAt);
                          function pad(n: number) { return n < 10 ? '0' + n : n; }
                          return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reporter Information */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Reporter Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.isAnonymous ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Anonymous Report</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{report.reporterName || "Anonymous"}</span>
                        </div>
                        {report.reporterContact && (
                          <div className="text-sm text-muted-foreground">
                            Contact: {report.reporterContact}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl w-full max-h-[90vh]"
            >
              <img
                src={activeImage}
                alt="Enlarged evidence"
                className="w-full h-full object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(null);
                }}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}