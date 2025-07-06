import { useState, useEffect, useRef, useMemo } from "react";
import Map from "./Map";
import ProfileList from "./List";
import StateDropdown from "./StateDropdown";
import statePolygons from "../../data/state_polygons_lowres_dict.json";

const MapWithList = () => {
  const [controlledBounds, setControlledBounds] = useState({
    sw: { lat: 24.396308, lng: -125.0 },
    ne: { lat: 49.384358, lng: -66.93457 },
    isAlaska: false,
  });
  const [liveBounds, setLiveBounds] = useState(null);

  const [selectedStateType, setSelectedStateType] = useState("");
  const [selectedEmploymentState, setSelectedEmploymentState] = useState("");
  const [points, setPoints] = useState([]);
  const skipNextRef = useRef(false);

  const livePoints = useMemo(() => {
    if (!liveBounds) return [];
    return points.filter(({ lat, lng }) => {
      return (
        lat >= liveBounds.sw.lat &&
        lat <= liveBounds.ne.lat &&
        lng >= liveBounds.sw.lng &&
        lng <= liveBounds.ne.lng
      );
    });
  }, [points, liveBounds]);

  useEffect(() => {
    if (!selectedEmploymentState || !selectedStateType) return;

    const fetchPointsByState = async () => {
      const params = new URLSearchParams();
      params.append(
        selectedStateType === "employment"
          ? "employmentState"
          : "iaEmploymentState",
        selectedEmploymentState
      );

      try {
        const res = await fetch(
          `http://localhost:8000/api/map?${params.toString()}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const uniqueProfiles = data.filter(
          (value, index, self) =>
            self.findIndex((v) => v.id === value.id) === index
        );

        setPoints(uniqueProfiles);
      } catch (err) {
        console.error("Error fetching state map data:", err);
      }
    };

    fetchPointsByState();
  }, [selectedEmploymentState, selectedStateType]);

  useEffect(() => {
    if (!selectedEmploymentState) return;

    const polygons = statePolygons[selectedEmploymentState];
    if (!polygons) return;

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

    // Special handling for Alaska to prevent zooming out too far
    const isAlaska = selectedEmploymentState === "AK";

    // Optionally, if Alaska polygons are sparse and cause weird bounds,
    // you can expand or restrict bounds here.
    // Example: clamp min/max lat/lng or add padding for Alaska specifically.

    const newControlledBounds = {
      sw: { lat: minLat, lng: minLng },
      ne: { lat: maxLat, lng: maxLng },
      isAlaska,
    };

    setControlledBounds(newControlledBounds);
    skipNextRef.current = true;
  }, [selectedEmploymentState]);

  const handleStateChange = (stateType) => (stateCode) => {
    setSelectedStateType(stateType);
    setSelectedEmploymentState(stateCode);
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <StateDropdown
          label="Employment State"
          selectedState={
            selectedStateType === "employment" ? selectedEmploymentState : ""
          }
          updateSelectedState={handleStateChange("employment")}
        />
        <StateDropdown
          label="IA Employment State"
          selectedState={
            selectedStateType === "iaEmployment" ? selectedEmploymentState : ""
          }
          updateSelectedState={handleStateChange("iaEmployment")}
        />
      </div>

      <div className="flex h-screen">
        <div className="w-1/2 h-[65vh]">
          <Map
            points={points}
            forceBounds={controlledBounds}
            onLiveBoundsChange={setLiveBounds}
          />
        </div>
        <div className="w-1/2 h-full overflow-y-auto">
          <ProfileList points={livePoints} />
        </div>
      </div>
    </div>
  );
};

export default MapWithList;
