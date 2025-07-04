import { useState, useEffect, useRef } from "react";
import Map from "./Map";
import ProfileList from "./List";
import StateDropdown from "./StateDropdown";
import statePolygons from "../../data/state_polygons_lowres_dict.json";

const MapWithList = () => {
  const [bounds, setBounds] = useState({
    sw: { lat: 24.396308, lng: -125.0 },
    ne: { lat: 49.384358, lng: -66.93457 },
  });
  const [selectedState, setSelectedState] = useState(null);
  const [points, setPoints] = useState([]);
  const skipNextRef = useRef(false); // 🧭 used to avoid zoom loop

  useEffect(() => {
    const fetchPointsByState = async () => {
      if (!selectedState) return;

      try {
        const res = await fetch(
          `http://localhost:8000/api/map/${selectedState}`
        );
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setPoints(data);
      } catch (err) {
        console.error("Error fetching state map data:", err);
      }
    };

    fetchPointsByState();
  }, [selectedState]);

  // 🧭 Update bounds when state changes
  useEffect(() => {
    if (!selectedState || !statePolygons[selectedState]) return;

    const polygons = statePolygons[selectedState];
    let minLat = Infinity,
      minLng = Infinity,
      maxLat = -Infinity,
      maxLng = -Infinity;

    polygons.forEach((polygon) => {
      polygon.forEach(([lat, lng]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });
    });

    const newBounds = {
      sw: { lat: minLat, lng: minLng },
      ne: { lat: maxLat, lng: maxLng },
    };

    setBounds(newBounds);
    skipNextRef.current = true; // prevent triggering zoom reset
  }, [selectedState]);

  const handleViewportChange = (newBounds) => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    setBounds(newBounds);
  };

  return (
    <div>
      <StateDropdown
        selectedState={selectedState}
        updateSelectedState={setSelectedState}
      />
      <div className="flex h-screen">
        <div className="w-1/2 h-full">
          <Map
            points={points}
            bounds={bounds}
            onViewportChange={handleViewportChange}
            skipNextRef={skipNextRef}
          />
        </div>
        <div className="w-1/2 h-full overflow-y-auto">
          <ProfileList points={points} />
        </div>
      </div>
    </div>
  );
};

export default MapWithList;
