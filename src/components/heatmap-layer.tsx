"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapLayerProps {
  points: Array<{ lat: number; lng: number; intensity?: number }>;
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

export default function HeatmapLayer({
  points,
  radius = 25,
  blur = 15,
  maxZoom = 17,
}: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatData = points.map((point) => [
      point.lat,
      point.lng,
      point.intensity ?? 1,
    ]);

    // @ts-ignore
    const heatLayer = L.heatLayer(heatData, {
      radius,
      blur,
      maxZoom,
      gradient: {
        0.1: "#2b83ba",
        0.3: "#abdda4",
        0.5: "#ffffbf",
        0.7: "#fdae61",
        1.0: "#d7191c",
      },
    }).addTo(map);

    return () => {
      heatLayer.remove();
    };
  }, [map, points, radius, blur, maxZoom]);

  return null;
}