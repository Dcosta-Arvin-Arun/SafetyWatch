"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { CrimeReport } from "@/types";
import { formatReportDateTime } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";

const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true)
  });
};

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const createMapIcon = (color = "red", size = 32) =>
  L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: "marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

interface CrimeMapProps {
  reports: CrimeReport[];
  isLoading?: boolean;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function HeatmapLayer({ reports }: { reports: CrimeReport[] }) {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const heatLayer = L.heatLayer(
      reports
        .filter(r => r.geoPoint)
        .map(r => [
          r.geoPoint!.latitude,
          r.geoPoint!.longitude,
          1
        ]),
      {
        radius: 40,
        blur: 30,
        maxZoom: 1,
        gradient: {
          0.1: "#2b83ba",
          0.3: "#abdda4",
          0.5: "#ffffbf",
          0.7: "#fdae61",
          1.0: "#b91c1c",
        }
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, reports]);
  return null;
}

function ClusterLayer({
  reports,
  markerSize,
  getIconColor,
  createMapIcon,
}: {
  reports: CrimeReport[];
  markerSize: number;
  getIconColor: (type: string) => string;
  createMapIcon: (color: string, size: number) => any;
}) {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const clusterGroup = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      iconCreateFunction: createClusterCustomIcon,
    });

    reports.filter(report => report.geoPoint).forEach((report) => {
      const marker = L.marker(
        [report.geoPoint!.latitude, report.geoPoint!.longitude],
        { icon: createMapIcon(getIconColor(report.crimeType), markerSize) }
      ).bindPopup(`
        <div class="max-w-[250px] space-y-1">
          <h3 class="font-bold text-base">${report.title}</h3>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="font-medium capitalize">${report.crimeType.toLowerCase()}</span>
            <span>•</span>
            <span>${formatReportDateTime(report).combined}</span>
          </div>
          <p class="text-sm line-clamp-2 my-2">${report.description}</p>
          <a href="/reports/${report.id}" class="text-primary hover:underline text-sm font-medium">
            View Details →
          </a>
        </div>
      `);
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, reports, markerSize, getIconColor, createMapIcon]);
  return null;
}

// Utility to get the correct incident date for a report
function getIncidentDate(report: CrimeReport): Date | null {
  if (report.incidentDateTime && !isNaN(new Date(report.incidentDateTime).getTime())) {
    return new Date(report.incidentDateTime);
  }
  return null;
}

export default function CrimeMap({ reports, isLoading }: CrimeMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCrimeType, setSelectedCrimeType] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [markerSize, setMarkerSize] = useState(32);
  const [mapMode, setMapMode] = useState<"standard" | "satellite">("standard");

  const crimeTypes = useMemo(() => {
    const types = new Set<string>();
    reports.forEach((report) => types.add(report.crimeType));
    // Always put 'other' last if present
    const sorted = Array.from(types).filter(t => t.toLowerCase() !== 'other').sort();
    if (types.has('other')) sorted.push('other');
    return sorted;
  }, [reports]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Silently fail if user denies location
        }
      );
    }
  }, []);

  const filteredReports = useMemo(() => {
    if (selectedCrimeType === "all") return reports;
    return reports.filter((report) => report.crimeType === selectedCrimeType);
  }, [reports, selectedCrimeType]);

  const center = useMemo(() => {
    if (userLocation) return userLocation;
    const reportsWithGeoPoint = filteredReports.filter(r => r.geoPoint);
    if (reportsWithGeoPoint.length > 0) {
      return [
        reportsWithGeoPoint[0].geoPoint!.latitude,
        reportsWithGeoPoint[0].geoPoint!.longitude,
      ] as [number, number];
    }
    return INDIA_CENTER;
  }, [userLocation, filteredReports]);

  const getIconColor = (crimeType: string) => {
    const type = crimeType.toLowerCase();
    if (type.includes("theft")) return "#3b82f6";
    if (type.includes("assault")) return "#ef4444";
    if (type.includes("fraud")) return "#f59e0b";
    if (type.includes("vandalism")) return "#10b981";
    if (type.includes("burglary")) return "#8b5cf6";
    return "#ec4899";
  };

  const handleToggleHeatmap = () => {
    setShowHeatmap((prev) => !prev);
    if (!showHeatmap) setShowClusters(false);
  };

  const handleToggleClusters = () => {
    setShowClusters((prev) => !prev);
    if (!showClusters) setShowHeatmap(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] space-y-3 bg-background/90 p-4 rounded-lg shadow-lg border">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Crime Type</h3>
          <ToggleGroup
            type="single"
            value={selectedCrimeType}
            onValueChange={(value) => {
              if (Array.isArray(value)) {
                setSelectedCrimeType(value[0] || "all");
              } else {
                setSelectedCrimeType(value || "all");
              }
            }}
            className="flex flex-wrap justify-start gap-1"
          >
            <ToggleGroupItem value="all" className="text-xs h-8 px-2">
              All Types
            </ToggleGroupItem>
            {crimeTypes.map((type) => (
              <ToggleGroupItem
                key={type}
                value={type}
                className="text-xs h-8 px-2 capitalize"
              >
                {type.toLowerCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Map Mode</h3>
          <ToggleGroup
            type="single"
            value={mapMode}
            onValueChange={(value) => setMapMode(value as any)}
            className="flex gap-1"
          >
            <ToggleGroupItem value="standard" className="text-xs h-8">
              Standard
            </ToggleGroupItem>
            <ToggleGroupItem value="satellite" className="text-xs h-8">
              Satellite
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">View Options</h3>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={handleToggleHeatmap}
              className="text-xs h-8"
            >
              {showHeatmap ? "Hide" : "Heatmap"}
            </Button>
            <Button
              variant={showClusters ? "default" : "outline"}
              size="sm"
              onClick={handleToggleClusters}
              className="text-xs h-8"
            >
              {showClusters ? "Hide" : "Clusters"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">Marker Size</h3>
            <span className="text-xs text-muted-foreground">{markerSize}px</span>
          </div>
          <Slider
            value={[markerSize]}
            onValueChange={([value]) => setMarkerSize(value)}
            min={20}
            max={50}
            step={2}
            className="w-full"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-background/90 p-3 rounded-lg shadow-lg border">
        <h3 className="font-medium text-sm mb-2">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#3b82f6] border border-white shadow-sm" />
            <span className="text-xs">Theft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] border border-white shadow-sm" />
            <span className="text-xs">Assault</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] border border-white shadow-sm" />
            <span className="text-xs">Fraud</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10b981] border border-white shadow-sm" />
            <span className="text-xs">Vandalism</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#8b5cf6] border border-white shadow-sm" />
            <span className="text-xs">Burglary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ec4899] border border-white shadow-sm" />
            <span className="text-xs">Other</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {mapMode === "standard" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {showHeatmap && (
          <HeatmapLayer reports={filteredReports} />
        )}

        {!showHeatmap && showClusters && (
          <ClusterLayer
            reports={filteredReports}
            markerSize={markerSize}
            getIconColor={getIconColor}
            createMapIcon={createMapIcon}
          />
        )}

        {!showHeatmap && !showClusters && filteredReports.filter(report => report.geoPoint).map((report) => {
          return (
            <Marker
              key={report.id}
              position={[
                report.geoPoint!.latitude,
                report.geoPoint!.longitude,
              ]}
              icon={createMapIcon(getIconColor(report.crimeType), markerSize)}
            >
              <Popup>
                <div className="max-w-[250px] space-y-1">
                  <h3 className="font-bold text-base">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium capitalize">{report.crimeType.toLowerCase()}</span>
                    <span>•</span>
                    <span>{formatReportDateTime(report).combined}</span>
                  </div>
                  <p className="text-sm line-clamp-2 my-2">{report.description}</p>
                  <Link
                    href={`/reports/${report.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                    prefetch={false}
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <RecenterMap lat={center[0]} lng={center[1]} />
      </MapContainer>
    </div>
  );
}