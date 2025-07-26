"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { CrimeReport } from "@/types";
import { getAllCrimeReports, updateCrimeReportStatus } from "@/lib/reports";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Search, Filter, Archive, AlertCircle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatusBadge = ({ status }: { status: CrimeReport["status"] }) => {
  const statusClasses = {
    verified: "bg-purple-100 text-purple-800 border-purple-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    reviewing: "bg-blue-100 text-blue-800 border-blue-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusClasses[status as keyof typeof statusClasses] || ""}`}>
      {typeof status === "string" && status.length > 0
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "-"}
    </span>
  );
};

type SortField = "date" | "type" | "status";
type SortDirection = "asc" | "desc";

export default function AdminDashboardPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CrimeReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'authenticated' | 'anonymous'>('all');
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/login");
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchReports = async () => {
        try {
          setIsLoadingReports(true);
          const fetchedReports = await getAllCrimeReports();
          setReports(fetchedReports);
          setFilteredReports(fetchedReports);
        } catch (error) {
          console.error("Error fetching reports:", error);
          toast.error("Failed to load crime reports.");
        } finally {
          setIsLoadingReports(false);
        }
      };
      fetchReports();
    }
  }, [isAdmin]);

  useEffect(() => {
    let results = reports;
    
    if (searchQuery) {
      results = reports.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.crimeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...results].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date": {
          // Only use incidentDateTime for sorting (non-nullable, always set)
          const aDate = new Date(a.incidentDateTime ?? 0);
          const bDate = new Date(b.incidentDateTime ?? 0);
          comparison = aDate.getTime() - bDate.getTime();
          break;
        }
        case "type":
          comparison = a.crimeType.localeCompare(b.crimeType);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredReports(sorted);
  }, [reports, searchQuery, sortField, sortDirection]);

  const handleStatusChange = async (
    reportId: string,
    newStatus: "pending" | "reviewing" | "verified" | "resolved" | "rejected"
  ) => {
    try {
      await updateCrimeReportStatus(reportId, newStatus);
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update status");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleLocationExpansion = (reportId: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const handleViewDetails = (reportId: string) => {
    router.push(`/reports/${reportId}`);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  // Filter reports based on type
  const filteredByType = filteredReports.filter(r => {
    if (reportFilter === 'all') return true;
    if (reportFilter === 'anonymous') return r.isAnonymous;
    if (reportFilter === 'authenticated') return !r.isAnonymous;
    return true;
  });

  // Split into active and archived
  const activeReports = filteredByType.filter(r => r.status !== 'rejected' && r.status !== 'resolved');
  const archivedReports = filteredByType.filter(r => r.status === 'rejected' || r.status === 'resolved');

  // Helper to format date as dd/mm/yyyy and time as hh:mm
  function formatDateTimeGB(date: Date) {
    return `${date.toLocaleDateString("en-GB")} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }

  if (loading || isLoadingReports) {
    return (
      <>
        <MainNav />
        <div className="flex justify-center items-center h-screen">
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Skeleton for header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-10 w-56" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
            {/* Skeleton for table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50">
                <div className="flex">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-24 m-2" />
                  ))}
                </div>
              </div>
              <div>
                {Array.from({ length: 5 }).map((_, rowIdx) => (
                  <div key={rowIdx} className="flex border-b last:border-b-0">
                    {Array.from({ length: 8 }).map((_, colIdx) => (
                      <Skeleton key={colIdx} className="h-8 w-24 m-2" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Create a motion-enabled TableRow
  const MotionTableRow = motion(TableRow);

  return (
    <>
      <MainNav />
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Manage and review submitted crime reports
              </p>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={reportFilter}
                  onChange={e => setReportFilter(e.target.value as any)}
                >
                  <option value="all">All Reports</option>
                  <option value="authenticated">Authenticated</option>
                  <option value="anonymous">Anonymous</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Reports Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Active Reports
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({activeReports.length})
                </span>
              </h2>
            </div>

            {activeReports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl"
              >
                <AlertCircle className="h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">No active reports found</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium min-w-[100px] max-w-[110px] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("type")}> 
                        <div className="flex items-center">Type<SortIcon field="type" /></div>
                      </TableHead>
                      <TableHead className="font-medium min-w-[180px]">Title</TableHead>
                      <TableHead className="font-medium min-w-[260px]">Location</TableHead>
                      <TableHead className="font-medium min-w-[110px] max-w-[130px]">Tracking ID</TableHead>
                      {reportFilter === 'authenticated' && (
                        <TableHead className="font-medium min-w-[180px]">Reporter Email</TableHead>
                      )}
                      <TableHead className="font-medium cursor-pointer hover:bg-gray-100 transition-colors min-w-[180px]" onClick={() => handleSort("date")}> 
                        <div className="flex items-center">
                          Date and Time Occurred
                          <SortIcon field="date" />
                        </div>
                      </TableHead>
                      <TableHead className="font-medium cursor-pointer hover:bg-gray-100 transition-colors min-w-[140px]" onClick={() => handleSort("status")}>
                        <div className="flex items-center">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </TableHead>
                      <TableHead className="font-medium min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {activeReports.map((report) => (
                        <MotionTableRow
                          key={report.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-gray-50 group"
                        >
                          <TableCell className="capitalize min-w-[100px] max-w-[110px] truncate">
                            {report.crimeType.toLowerCase()}
                          </TableCell>
                          <TableCell 
                            className={`font-medium truncate max-w-[180px] cursor-pointer ${expandedLocations[report.id + '-title'] ? 'whitespace-normal' : ''}`}
                            onClick={() => toggleLocationExpansion(report.id + '-title')}
                          >
                            {report.title}
                          </TableCell>
                          <TableCell 
                            className={`max-w-[260px] ${expandedLocations[report.id] ? 'whitespace-normal' : 'truncate'} cursor-pointer`}
                            onClick={() => toggleLocationExpansion(report.id)}
                          >
                            {report.location || 'N/A'}
                          </TableCell>
                          <TableCell className="font-mono text-sm cursor-pointer truncate min-w-[110px] max-w-[130px]" onClick={() => toggleLocationExpansion(report.id + '-tracking')}>
                            <span className={expandedLocations[report.id + '-tracking'] ? 'whitespace-normal break-all' : ''}>
                              {report.trackingId}
                            </span>
                          </TableCell>
                          {reportFilter === 'authenticated' && (
                            <TableCell className="truncate max-w-[180px] cursor-pointer" onClick={() => toggleLocationExpansion(report.id + '-email')}>
                              <span className={expandedLocations[report.id + '-email'] ? 'whitespace-normal break-all' : ''}>
                                {report.reporterContact || "-"}
                              </span>
                            </TableCell>
                          )}
                          <TableCell>
                            {/* Only use incidentDateTime for display */}
                            {(() => {
                              if (report.incidentDateTime && !isNaN(new Date(report.incidentDateTime).getTime())) {
                                const d = new Date(report.incidentDateTime);
                                return formatDateTimeGB(d);
                              }
                              return <span className="text-gray-400">-</span>;
                            })()}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={report.status} 
                              onValueChange={(newStatus: CrimeReport["status"]) => 
                                handleStatusChange(report.id, newStatus as "pending" | "reviewing" | "verified" | "resolved" | "rejected")
                              }
                            >
                              <SelectTrigger className="w-[140px] border-none bg-transparent group-hover:bg-gray-100 transition-colors">
                                <SelectValue>
                                  <StatusBadge status={report.status} />
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {report.status === 'pending' && (
                                  <SelectItem value="reviewing">
                                    <StatusBadge status="reviewing" />
                                  </SelectItem>
                                )}
                                {report.status === 'reviewing' && (
                                  <>
                                    <SelectItem value="verified">
                                      <StatusBadge status="verified" />
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                      <StatusBadge status="rejected" />
                                    </SelectItem>
                                  </>
                                )}
                                {report.status === 'verified' && (
                                  <SelectItem value="resolved">
                                    <StatusBadge status="resolved" />
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div 
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                              onClick={() => handleViewDetails(report.id)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </div>
                          </TableCell>
                        </MotionTableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </div>

          {/* Archived Reports Section */}
          {archivedReports.length > 0 && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                onClick={() => setShowArchived(!showArchived)}
              >
                <Archive className="h-4 w-4" />
                {showArchived ? "Hide" : "Show"} Archived Reports ({archivedReports.length})
                <ChevronDown className={`h-4 w-4 transition-transform ${showArchived ? "rotate-180" : ""}`} />
              </div>

              <AnimatePresence>
                {showArchived && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-medium min-w-[120px]">Type</TableHead>
                          <TableHead className="font-medium min-w-[180px]">Title</TableHead>
                          <TableHead className="font-medium min-w-[260px]">Location</TableHead>
                          <TableHead className="font-medium min-w-[120px]">Tracking ID</TableHead>
                          {reportFilter === 'authenticated' && <TableHead className="font-medium min-w-[180px]">Reporter Email</TableHead>}
                          <TableHead className="font-medium min-w-[150px]">Date and Time Occurred</TableHead>
                          <TableHead className="font-medium min-w-[140px]">Status</TableHead>
                          <TableHead className="font-medium min-w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedReports.map((report) => (
                          <MotionTableRow
                            key={report.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="capitalize">
                              {report.crimeType.toLowerCase()}
                            </TableCell>
                            <TableCell 
                              className={`font-medium truncate max-w-[180px] cursor-pointer ${expandedLocations[report.id + '-title'] ? 'whitespace-normal' : ''}`}
                              onClick={() => toggleLocationExpansion(report.id + '-title')}
                            >
                              {report.title}
                            </TableCell>                          
                            <TableCell 
                              className={`max-w-[260px] ${expandedLocations[report.id] ? 'whitespace-normal' : 'truncate'} cursor-pointer`}
                              onClick={() => toggleLocationExpansion(report.id)}
                            >
                              {report.location || 'N/A'}
                            </TableCell>
                            <TableCell className="font-mono text-sm cursor-pointer truncate max-w-[180px]" onClick={() => toggleLocationExpansion(report.id + '-tracking')}>
                              <span className={expandedLocations[report.id + '-tracking'] ? 'whitespace-normal break-all' : ''}>
                                {report.trackingId}
                              </span>
                            </TableCell>
                            {reportFilter === 'authenticated' && (
                              <TableCell className="truncate max-w-[180px] cursor-pointer" onClick={() => toggleLocationExpansion(report.id + '-email')}>
                                <span className={expandedLocations[report.id + '-email'] ? 'whitespace-normal break-all' : ''}>
                                  {report.reporterContact || "-"}
                                </span>
                              </TableCell>
                            )}
                            <TableCell>
                              {/* Only use incidentDateTime for display */}
                              {(() => {
                                if (report.incidentDateTime && !isNaN(new Date(report.incidentDateTime).getTime())) {
                                  return new Date(report.incidentDateTime).toLocaleString("en-US", {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                }
                                return <span className="text-gray-400">-</span>;
                              })()}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={report.status} />
                            </TableCell>
                            <TableCell>
                              <div 
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => handleViewDetails(report.id)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </div>
                            </TableCell>
                          </MotionTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}