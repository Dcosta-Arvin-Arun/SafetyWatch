"use client";
import { MainNav } from "@/components/main-nav";
import { ReportCrimeForm } from "@/components/report-crime-form";

export default function AnonymousReportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-2xl">
          <ReportCrimeForm isAnonymousMode />
        </div>
      </div>
    </div>
  );
}
