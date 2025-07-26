"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Default location - Thane, India
const DEFAULT_LOCATION: [number, number] = [19.2183, 72.9781];
const DEFAULT_ZOOM = 12;

// Fix for default marker icons
const markerIcon = new L.Icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Memoized LocationMarker
const LocationMarker = ({
  position,
  setPosition,
  onLocationSelect,
  readOnly = false,
}: {
  position: [number, number] | null;
  setPosition: (position: [number, number] | null) => void;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  readOnly?: boolean;
}) => {
  const map = useMap();

  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (readOnly) return;
      
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      const fallbackAddress = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng, fallbackAddress);
        
        setTimeout(() => {
          reverseGeocode(lat, lng).then((address) => {
            if (address !== fallbackAddress) {
              onLocationSelect(lat, lng, address);
            }
          });
        }, 0);
      }
    },
    [readOnly, setPosition, onLocationSelect]
  );

  useEffect(() => {
    if (!readOnly) {
      map.on("click", handleClick);
      return () => {
        map.off("click", handleClick);
      };
    }
  }, [map, readOnly, handleClick]);

  return position ? <Marker position={position} icon={markerIcon} /> : null;
};

// Fast location panning with reduced animation quality
const AutoPanToLocation = ({ location }: { location: [number, number] | null }) => {
  const map = useMap();
  const hasPannedRef = useRef(false);

  useEffect(() => {
    if (location && !hasPannedRef.current && map) {
      map.flyTo(location, 16, {
        duration: 0.5,
        easeLinearity: 0.1,
        noMoveStart: true,
      });
      hasPannedRef.current = true;
    }
  }, [location, map]);

  return null;
};

// Fast reverse geocoding with timeout
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "CrimeReportWebApp/1.0",
        },
      }
    );
    
    clearTimeout(timeout);
    const data = await response.json();
    return data?.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Fast forward geocoding with reduced accuracy
export async function forwardGeocode(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1&addressdetails=0`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "CrimeReportWebApp/1.0",
        },
      }
    );
    
    clearTimeout(timeout);
    const data = await response.json();
    return data?.length > 0
      ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      : null;
  } catch (error) {
    return null;
  }
}

interface MapPickerProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  initialAddress?: string;
  initialCoordinates?: [number, number];
  readOnly?: boolean;
}

export function MapPicker({
  onLocationSelect,
  initialAddress,
  initialCoordinates,
  readOnly = false,
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialCoordinates || null
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Fast geolocation with reduced accuracy options
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {},
        {
          enableHighAccuracy: false,
          maximumAge: 30000,
          timeout: 5000,
        }
      );
    }
  }, []);

  // Fast initial address geocoding
  useEffect(() => {
    if (initialAddress && initialAddress.length > 2 && !position) {
      forwardGeocode(initialAddress).then((location) => {
        if (location && mapRef.current) {
          setPosition([location.lat, location.lng]);
          mapRef.current.flyTo([location.lat, location.lng], 16, {
            duration: 0.5,
          });
        }
      });
    }
  }, [initialAddress, position]);

  // Sync marker position with parent when initialCoordinates changes
  useEffect(() => {
    if (
      initialCoordinates &&
      (!position ||
        position[0] !== initialCoordinates[0] ||
        position[1] !== initialCoordinates[1])
    ) {
      setPosition(initialCoordinates);
      if (mapRef.current) {
        mapRef.current.flyTo(initialCoordinates, 16, { duration: 0.5 });
      }
    }
  }, [initialCoordinates]); // <-- add this effect

  return (
    <div className="relative">
      <MapContainer
        center={DEFAULT_LOCATION}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={!readOnly}
        style={{ height: "400px", width: "100%", zIndex: 1 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
          readOnly={readOnly}
        />
        <AutoPanToLocation location={userLocation} />
      </MapContainer>
    </div>
  );
}

export default MapPicker;