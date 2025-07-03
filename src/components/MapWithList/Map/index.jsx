import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";

// === Marker Cluster Layer ===
const MarkerClusterGroup = ({ points }) => {
  const map = useMap();
  const markerClusterGroupRef = useRef(null);

  useEffect(() => {
    if (!markerClusterGroupRef.current) {
      markerClusterGroupRef.current = L.markerClusterGroup();
      map.addLayer(markerClusterGroupRef.current);
    }

    // Clear previous markers
    markerClusterGroupRef.current.clearLayers();

    // Add new markers
    points.forEach(({ lat, lng }) => {
      const marker = L.marker([lat, lng]);
      markerClusterGroupRef.current.addLayer(marker);
    });

    return () => {
      if (markerClusterGroupRef.current) {
        map.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }
    };
  }, [map, points]);

  return null;
};

// === Listen for map move/zoom and report bounds ===
const MapBoundsListener = ({ onBoundsChange }) => {
  useMapEvent("moveend", function () {
    const map = this; // ✅ 'this' is the map instance

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    onBoundsChange({
      sw: { lat: sw.lat, lng: sw.lng },
      ne: { lat: ne.lat, lng: ne.lng },
    });
  });

  return null;
};

// === Main Map Component ===
export default function MyMap({ points, onBoundsChange }) {
  return (
    <MapContainer
      center={[38.03598414183243, -95.14190792741904]}
      zoom={4}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MarkerClusterGroup points={points} />
      <MapBoundsListener onBoundsChange={onBoundsChange} />
    </MapContainer>
  );
}
