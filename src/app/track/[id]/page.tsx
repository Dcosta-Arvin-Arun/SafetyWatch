"use client";
  import { useEffect, useState } from "react";
  import { useRouter, useParams } from "next/navigation";
  import { getAllCrimeReports } from "@/lib/reports";
  import { MainNav } from "@/components/main-nav";
  import { motion } from "framer-motion";
  import type { CrimeReport as BaseCrimeReport } from "@/types";
  import { formatReportDateTime } from "@/lib/utils";

  interface CrimeReportWithTracking extends BaseCrimeReport {
    trackingId: string;
  }

  // Helper to check if a date string is a valid ISO date
  function isValidDateString(dateString?: string) {
    if (!dateString) return false;
    const d = new Date(dateString);
    return !isNaN(d.getTime());
  }
  // Helper to get the best available incident date (incidentDateTime)
  function getIncidentDate(report: CrimeReportWithTracking): Date | null {
    if (isValidDateString(report.incidentDateTime)) {
      return new Date(report.incidentDateTime!);
    }
    return null;
  }

  export default function TrackReportPage() {
    const params = useParams();
    const id = params?.id ? String(params.id) : null;
    const [report, setReport] = useState<CrimeReportWithTracking | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputId, setInputId] = useState("");
    const [submittedId, setSubmittedId] = useState<string | null>(id);
    const [inputFocused, setInputFocused] = useState(false);
    const router = useRouter();

    useEffect(() => {
      if (!submittedId) return;
      async function fetchReport() {
        setLoading(true);
        setNotFound(false);
        setError(null);
        try {
          if (!submittedId) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          if (typeof getAllCrimeReports !== "function") {
            setError("Report lookup is not available. Please contact support.");
            setLoading(false);
            return;
          }
          const reports = await getAllCrimeReports();
          if (!Array.isArray(reports)) {
            setError("Unexpected data format from server.");
            setLoading(false);
            return;
          }
          const found = (reports as CrimeReportWithTracking[]).find(r => r.trackingId === submittedId);
          if (found) setReport(found);
          else setNotFound(true);
        } catch (e: any) {
          setError(e?.message || "An error occurred while fetching the report.");
          setNotFound(true);
        } finally {
          setLoading(false);
        }
      }
      fetchReport();
    }, [submittedId]);

    const getStatusBadge = (status: string) => {
      const baseClasses = "px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors duration-200";
      
      switch (status) {
        case "resolved":
          return `${baseClasses} bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-200`;
        case "rejected":
          return `${baseClasses} bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-200`;
        case "reviewing":
          return `${baseClasses} bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-200`;
        case "verified":
          return `${baseClasses} bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-200`;
        default:
          return `${baseClasses} bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-200`;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <MainNav />
        
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 30, 0],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
              animate={{
                scale: [1, 1.1, 1],
                x: [0, -20, 0],
                y: [0, 20, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            <motion.div 
              className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 20, 0],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>
          
          <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl p-8 space-y-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl dark:bg-gray-900/90 dark:shadow-none border border-gray-200/50 dark:border-gray-700/50"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 mb-8"
              >
                <svg 
                  className="h-8 w-8 text-primary transition-transform hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 3l8 4v5c0 5.25-3.5 9.75-8 11-4.5-1.25-8-5.75-8-11V7l8-4z" 
                  />
                </svg>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-400">
                  Track Your Report
                </h1>
              </motion.div>

              {!submittedId ? (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputId.trim()) setSubmittedId(inputId.trim());
                  }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <motion.input
                      type="text"
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      className={`peer w-full px-5 py-3.5 border ${
                        inputFocused ? "border-primary" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white/90 dark:bg-gray-900/80 placeholder-transparent text-gray-700 dark:text-gray-100`}
                      placeholder="Tracking ID"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                    <motion.label
                      className={`absolute left-5 transition-all duration-200 pointer-events-none ${
                        inputFocused || inputId
                          ? "-top-2.5 text-xs bg-white/90 dark:bg-gray-900/80 px-1 text-primary"
                          : "top-3.5 text-gray-400"
                      }`}
                      layout
                    >
                      Tracking ID
                    </motion.label>
                    <span className="absolute right-4 top-3.5 text-blue-400 transition-colors duration-200 peer-focus:text-primary">
                      <svg 
                        className="h-5 w-5" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                        />
                      </svg>
                    </span>
                  </div>
                  
                  <motion.button 
                    type="submit" 
                    className="w-full px-4 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 active:scale-[0.98]"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Track Report
                  </motion.button>
                  
                  <motion.p 
                    className="text-center text-sm text-primary animate-pulse dark:text-blue-400"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Enter your 16-character tracking ID
                  </motion.p>
                </motion.form>
              ) : loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center py-10 space-y-4"
                >
                  <div
                    className="border-4 border-blue-100 border-t-primary rounded-full h-12 w-12"
                  />
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-primary font-medium"
                  >
                    Searching for your report...
                  </motion.p>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center py-8 space-y-4"
                >
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"
                  >
                    <svg 
                      className="h-8 w-8 text-red-500 dark:text-red-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{error}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Please verify your tracking ID and try again
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-lg transition-colors duration-200"
                    onClick={() => { setSubmittedId(null); setInputId(""); }}
                  >
                    ← Try another ID
                  </motion.button>
                </motion.div>
              ) : notFound ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center py-8 space-y-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"
                  >
                    <svg 
                      className="h-8 w-8 text-yellow-500 dark:text-yellow-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                      />
                    </svg>
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Report Not Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      No report found with ID: {submittedId}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-lg transition-colors duration-200"
                    onClick={() => { setSubmittedId(null); setInputId(""); }}
                  >
                    ← Try another ID
                  </motion.button>
                </motion.div>
              ) : report ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 pr-2">
                          {report.title}
                        </h2>
                        <span className={getStatusBadge(report.status)}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-3">
                        <span className="flex items-center">
                          <svg 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" 
                            />
                          </svg>
                          {/* Date Occurred */}
                          {(() => {
                            return report ? formatReportDateTime(report).date : "-";
                          })()}
                        </span>
                        <span className="flex items-center">
                          <svg 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                          {/* Time Occurred */}
                          {(() => {
                            return report ? formatReportDateTime(report).time : "-";
                          })()}
                        </span>
                      </div>

                      <div className="pt-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                          {report.description}
                        </p>
                      </div>                      {report.location && (
                        <div className="pt-2">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                            <svg 
                              className="h-4 w-4 mr-1.5 flex-shrink-0" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" 
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" 
                              />
                            </svg>
                            <span>{report.location}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30">
                      <div className="flex flex-col space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
                          onClick={() => window.location.assign(`/reports/${report.id}`)}
                        >
                          View Full Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-center text-primary hover:text-primary/90 text-base font-bold transition-colors duration-200"
                          onClick={() => { setSubmittedId(null); setInputId(""); }}
                        >
                          Track another report
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <div className="flex items-start">
                      <svg 
                        className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Report Status Information
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Your report is currently being processed. You will receive updates on the status as it progresses through our system.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }