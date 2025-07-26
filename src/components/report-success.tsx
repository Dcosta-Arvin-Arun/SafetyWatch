import React from "react";
import Link from "next/link";

interface ReportSuccessProps {
  trackingId: string; // 16-character hex code, not UUID
  user?: { email?: string | null } | null;
}

export const ReportSuccess: React.FC<ReportSuccessProps> = ({ trackingId, user }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="relative w-full max-w-md p-8 bg-white/90 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600 opacity-20 rounded-full blur-3xl animate-blob1" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl animate-blob2" />
        <div className="relative z-10 flex flex-col items-center">
          <svg className="w-16 h-16 text-green-500 mb-4 animate-bounce-in" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M8 12l2 2l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-700 mb-4 text-center">Thank you for helping keep our community safe.</p>
          <div className="w-full flex flex-col items-center bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 animate-fade-in">
            <span className="text-xs text-blue-800 font-semibold uppercase tracking-wider">Tracking ID</span>
            <span className="text-lg font-mono text-blue-900 select-all mt-1 break-all">{trackingId}</span>
          </div>
          <p className="text-sm text-gray-500 mb-2 text-center">
              Please save your Tracking ID to check the status of your report later.
          </p>
          <Link
            href="/track"
            className="mt-4 inline-block px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-blue-700 transition-colors animate-fade-in"
          >
            Track Report
          </Link>
        </div>
      </div>
    </div>
  );
};