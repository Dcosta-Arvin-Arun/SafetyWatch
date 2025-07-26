"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
import { useAuth } from "@/context/auth-context";
import { getUserCrimeReports, deleteCrimeReport } from "@/lib/reports";
import { CrimeReport } from "@/types";
import { FaTrash } from "react-icons/fa"; // Add this import for the bin icon

export default function DashboardPage() {
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const router = useRouter();

  useEffect(() => {
    // Only redirect to login if the user is not logged in AND they navigated here directly
    // If redirected here from another page (like /reports/[id]), do not redirect
    if (!loading && !user && window.location.pathname === "/dashboard") {
      router.replace("/login");
    }
    if (user) {
      const loadReports = async () => {
        try {
          setIsLoading(true);
          const userReports = await getUserCrimeReports(user.uid);
          setReports(userReports);
        } catch (error) {
          console.error("Error loading reports:", error);
          toast.error("Failed to load your reports.");
        } finally {
          setIsLoading(false);
        }
      };
      loadReports();
    }
  }, [user, loading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteCrimeReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Report deleted.");
    } catch (error) {
      toast.error("Failed to delete report.");
    }
  };

  if (loading || (!user && loading)) {
    return (
      <>
        <MainNav />
        <div className="py-10">
          <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
          <div className="flex justify-center items-center min-h-[300px]">
            <p>Loading your reports...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainNav />
      <div className="mx-auto mt-10 max-w-[95%] px-4 mb-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Dashboard</h1>
          <Link href="/reports/new">
            <Button>Report New Incident</Button>
          </Link>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <p className="text-muted-foreground">
                You haven not submitted any reports yet.
              </p>
              <Link href="/reports/new">
                <Button className="mt-4">Create Your First Report</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 px-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="group transition-all duration-200"
              >
                <Card className="flex flex-col h-full border border-blue-900/60 shadow-md px-6 py-6 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:border-blue-900 transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{report.title}</CardTitle>
                    <CardDescription>
                      <span>
                        {report.incidentDate && report.incidentTime
                          ? `${report.incidentDate} • ${report.incidentTime}`
                          : report.incidentDateTime
                          ? `${new Date(report.incidentDateTime).toLocaleDateString(
                              "en-GB"
                            )} • ${new Date(
                              report.incidentDateTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}`
                          : "-"}
                      </span>
                      <span className="block mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : report.status === "rejected"
                              ? "bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20"
                              : report.status === "reviewing"
                              ? "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                              : report.status === "verified"
                              ? "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-600/20"
                              : "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                          }`}
                        >
                          {report.status.charAt(0).toUpperCase() +
                            report.status.slice(1)}
                        </span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-4 pb-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    <p className="mt-4 text-sm">
                      <strong>Location:</strong> {report.location || "N/A"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-4">
                    <Link href={`/reports/${report.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-blue-700 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:border-blue-900 transition-colors"
                        style={{ flex: "0 1 80%" }}
                      >
                        View Details
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="flex items-center justify-center border-red-700 bg-red-50 text-red-900 hover:bg-red-100 hover:border-red-900 transition-colors"
                        style={{ flex: "0 1 48px", minWidth: 0, padding: "0 0.75rem" }}
                        onClick={() => handleDelete(report.id)}
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
