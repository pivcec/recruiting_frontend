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

    markerClusterGroupRef.current.clearLayers();

    points.forEach(({ id, lat, lng }) => {
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

const MapBoundsListener = ({ onViewportChange, skipNextRef }) => {
  useMapEvent("moveend", () => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    const bounds = useMap().getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    onViewportChange({
      sw: { lat: sw.lat, lng: sw.lng },
      ne: { lat: ne.lat, lng: ne.lng },
    });
  });

  return null;
};

const MapBoundsUpdater = ({ bounds, onInternalViewportChange }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds?.sw && bounds?.ne) {
      const leafletBounds = L.latLngBounds(
        [bounds.sw.lat, bounds.sw.lng],
        [bounds.ne.lat, bounds.ne.lng]
      );
      onInternalViewportChange?.();
      map.fitBounds(leafletBounds, { padding: [20, 20] });
    }
  }, [bounds, map, onInternalViewportChange]);

  return null;
};

export default function Map({ points, onViewportChange, bounds, skipNextRef }) {
  const handleInternalViewportChange = () => {
    skipNextRef.current = true;
  };

  return (
    <MapContainer
      center={[38.03598414183243, -95.14190792741904]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MarkerClusterGroup points={points} />
      <MapBoundsListener
        onViewportChange={onViewportChange}
        skipNextRef={skipNextRef}
      />
      <MapBoundsUpdater
        bounds={bounds}
        onInternalViewportChange={handleInternalViewportChange}
      />
    </MapContainer>
  );
}
