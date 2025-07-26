"use client";
import { MainNav } from "@/components/main-nav";
import { ReportCrimeForm } from "@/components/report-crime-form";
import { useAuth } from "@/context/auth-context";
import { formatReportDateTime } from "@/lib/utils";

export default function ReportCrimePage() {
  const { user } = useAuth();
  // Always render the form; admin blocking is handled inside ReportCrimeForm
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-2xl">
          <ReportCrimeForm isAnonymousMode={!user} />
        </div>
      </div>
    </div>
  );
}
