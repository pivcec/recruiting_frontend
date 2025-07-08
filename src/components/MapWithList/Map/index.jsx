import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import CircularProgress from "@mui/material/CircularProgress";
import L from "leaflet";
import "leaflet.markercluster";
import styled from "styled-components";

const ALASKA_CENTER = [64.2008, -149.4937];
const ALASKA_ZOOM = 4;
const MAX_POINTS_THRESHOLD = 1000;

// Styled Components
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255 255 255 / 0.7);
  z-index: 1000;
`;

// === Marker Cluster Layer ===
const MarkerClusterGroup = ({ points }) => {
  const map = useMap();
  const markerClusterGroupRef = useRef(null);

  useEffect(() => {
    // Clear previous cluster group
    if (markerClusterGroupRef.current) {
      map.removeLayer(markerClusterGroupRef.current);
      markerClusterGroupRef.current = null;
    }

    // Don't render if no points
    if (!points.length) return;

    // Create cluster group with default behavior
    markerClusterGroupRef.current = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
    });

    // Add markers to the cluster group
    points.forEach(({ id, lat, lng }) => {
      const marker = L.marker([lat, lng]);
      markerClusterGroupRef.current.addLayer(marker);
    });

    // Add the cluster group to the map
    map.addLayer(markerClusterGroupRef.current);

    // Cleanup on unmount/update
    return () => {
      if (markerClusterGroupRef.current) {
        map.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }
    };
  }, [map, points]);

  return null;
};

// === Passive Bounds Observer (Live Tracker) ===
const MapBoundsObserver = ({ onLiveBoundsChange }) => {
  const map = useMap();
  const lastBoundsRef = useRef(null);
  const TOLERANCE = 0.0001;

  useMapEvent("moveend", () => {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const current = {
      sw: { lat: sw.lat, lng: sw.lng },
      ne: { lat: ne.lat, lng: ne.lng },
    };

    const prev = lastBoundsRef.current;
    const changed =
      !prev ||
      Math.abs(prev.sw.lat - current.sw.lat) > TOLERANCE ||
      Math.abs(prev.sw.lng - current.sw.lng) > TOLERANCE ||
      Math.abs(prev.ne.lat - current.ne.lat) > TOLERANCE ||
      Math.abs(prev.ne.lng - current.ne.lng) > TOLERANCE;

    if (changed) {
      lastBoundsRef.current = current;
      onLiveBoundsChange?.(current);
    }
  });

  return null;
};

// === Controlled Bounds Setter (from parent state) ===
const MapBoundsSetter = ({ forceBounds }) => {
  const map = useMap();
  const prevBoundsRef = useRef(null);

  useEffect(() => {
    if (!forceBounds?.sw || !forceBounds?.ne) return;

    const prev = prevBoundsRef.current;
    const changed =
      !prev ||
      prev.sw.lat !== forceBounds.sw.lat ||
      prev.sw.lng !== forceBounds.sw.lng ||
      prev.ne.lat !== forceBounds.ne.lat ||
      prev.ne.lng !== forceBounds.ne.lng ||
      prev.isAlaska !== forceBounds.isAlaska;

    if (changed) {
      if (forceBounds.isAlaska) {
        map.setView(ALASKA_CENTER, ALASKA_ZOOM);
      } else {
        const leafletBounds = L.latLngBounds(
          [forceBounds.sw.lat, forceBounds.sw.lng],
          [forceBounds.ne.lat, forceBounds.ne.lng]
        );
        map.fitBounds(leafletBounds, { padding: [20, 20] });
      }
      prevBoundsRef.current = forceBounds;
    }
  }, [forceBounds, map]);

  return null;
};

// === Main Exported Map ===
export default function Map({
  points,
  forceBounds,
  onLiveBoundsChange,
  loading,
}) {
  return (
    <Wrapper>
      {loading && (
        <LoadingOverlay>
          <CircularProgress size={48} color="primary" />
        </LoadingOverlay>
      )}
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
        <MapBoundsObserver onLiveBoundsChange={onLiveBoundsChange} />
        <MapBoundsSetter forceBounds={forceBounds} />
      </MapContainer>
    </Wrapper>
  );
}
