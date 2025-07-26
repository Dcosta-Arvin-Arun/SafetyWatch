"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getPublicCrimeReports } from "@/lib/reports";
import { CrimeReport } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/ui/footer";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatReportDateTime } from "@/lib/utils";

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
];

interface CrimeStatsData {
  name: string;
  count: number;
}

interface LocationStatsData {
  city: string;
  count: number;
}

const processDataForCharts = (reports: CrimeReport[]) => {
  const crimeTypeCounts: { [key: string]: number } = {};
  const locationCounts: { [key: string]: number } = {};
  const monthlyCounts: { [key: string]: number } = {};
  const hourlyCounts: { [key: string]: number } = {};

  reports.forEach((report) => {
    // Defensive: skip if no location
    if (!report.location) return;

    // Crime Type
    crimeTypeCounts[report.crimeType] =
      (crimeTypeCounts[report.crimeType] || 0) + 1;

    // Location
    const addressParts = report.location.split(",");
    const city =
      addressParts.length > 1
        ? addressParts[addressParts.length - 2]?.trim()
        : "Unknown";
    if (city && city !== "Unknown") {
      locationCounts[city] = (locationCounts[city] || 0) + 1;
    }

    // Use incidentDate and incidentTime if present, else incidentDateTime
    let dateObj: Date | null = null;
    if (report.incidentDate && report.incidentTime) {
      // Always convert to ISO format for parsing
      let isoDate = report.incidentDate.replace(/\//g, "-");
      dateObj = new Date(`${isoDate}T${report.incidentTime}`);
    } else if (report.incidentDateTime) {
      dateObj = new Date(report.incidentDateTime);
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      // Monthly: yyyy/mm
      const month = `${dateObj.getFullYear()}/${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;

      // Hourly: hh
      const hour = dateObj.getHours().toString().padStart(2, "0");
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    }
  });

  const crimeTypeData: CrimeStatsData[] = Object.entries(crimeTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const locationData: LocationStatsData[] = Object.entries(locationCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const monthlyData: CrimeStatsData[] = Object.entries(monthlyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const hourlyData: CrimeStatsData[] = Object.entries(hourlyCounts)
    .map(([name, count]) => ({ name: `${name}:00`, count }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  return { crimeTypeData, locationData, monthlyData, hourlyData };
};

const ChartCard = ({ 
  title, 
  children,
  loading 
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function CrimeStatsPage() {
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [crimeTypeData, setCrimeTypeData] = useState<CrimeStatsData[]>([]);
  const [locationData, setLocationData] = useState<LocationStatsData[]>([]);
  const [monthlyData, setMonthlyData] = useState<CrimeStatsData[]>([]);
  const [hourlyData, setHourlyData] = useState<CrimeStatsData[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const fetchedReports = await getPublicCrimeReports();
        // Only use reports that are verified or resolved for statistics
        const verifiedOrResolvedReports = Array.isArray(fetchedReports)
          ? fetchedReports.filter(r => r.status === "verified" || r.status === "resolved")
          : [];
        setReports(verifiedOrResolvedReports);
        const { crimeTypeData, locationData, monthlyData, hourlyData } =
          processDataForCharts(verifiedOrResolvedReports);
        setCrimeTypeData(crimeTypeData);
        setLocationData(locationData);
        setMonthlyData(monthlyData);
        setHourlyData(hourlyData);
        setError(null);
      } catch (err) {
        console.error("Error fetching crime reports for stats:", err);
        setReports([]); // Ensure reports is always an array
        setCrimeTypeData([]);
        setLocationData([]);
        setMonthlyData([]);
        setHourlyData([]);
        setError("Failed to load crime statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-grow flex items-center justify-center p-6">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl text-muted-foreground"
          >
            Loading statistics...
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-grow flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-xl text-red-500"
          >
            {error}
          </motion.div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-grow flex items-center justify-center p-6">
          <p className="text-xl text-muted-foreground">
            No crime reports available to generate statistics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav />
      <main className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-aptos text-navy-900">
            Crime Statistics
          </h2>
          <p className="text-lg text-gray-600">
            Visualizing crime trends and patterns
          </p>
        </motion.header>

        {/* Optionally show the most recent report date/time for context */}
        {reports.length > 0 && (
          <div className="text-right text-xs text-muted-foreground mb-2">
            Latest report: {formatReportDateTime(reports[0]).combined}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Crime Types Distribution" loading={loading}>
            {crimeTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={crimeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {crimeTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No data available for crime types.
              </p>
            )}
          </ChartCard>

          <ChartCard title="Top 10 Crime Locations" loading={loading}>
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={locationData}
                  layout="vertical"
                  margin={{ left: 20, right: 20, bottom: 5, top: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis
                    dataKey="city"
                    type="category"
                    width={100}
                    interval={0}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS[3]} 
                    name="Reports"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No data available for locations.
              </p>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Monthly Crime Trends" loading={loading}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS[1]} 
                    name="Reports"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No data available for monthly trends.
              </p>
            )}
          </ChartCard>

          <ChartCard title="Crime Reports by Hour of Day" loading={loading}>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS[2]} 
                    name="Reports"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No data available for hourly trends.
              </p>
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  );
}