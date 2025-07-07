import { useState, useEffect, useRef, useMemo } from "react";
import Map from "./Map";
import ProfileList from "./List";
import StateDropdown from "./StateDropdown";
import statePolygons from "../../data/state_polygons_lowres_dict.json";

const employmentOptions = [
  { label: "Current Employment", value: "employmentState" },
  { label: "Current IA Employment", value: "iaEmploymentState" },
];

const MapWithList = () => {
  const [controlledBounds, setControlledBounds] = useState({
    sw: { lat: 24.396308, lng: -125.0 },
    ne: { lat: 49.384358, lng: -66.93457 },
    isAlaska: false,
  });
  const [liveBounds, setLiveBounds] = useState(null);

  const [loadingPoints, setLoadingPoints] = useState(false);
  const [points, setPoints] = useState([]);

  const [selectedEmploymentFilter, setSelectedEmploymentFilter] = useState({
    type: "",
    state: "",
  });

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
    const { type, state } = selectedEmploymentFilter;
    if (!type || !state) return;

    const fetchPointsByState = async () => {
      setLoadingPoints(true);
      const params = new URLSearchParams();
      params.append(type, state);

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
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchPointsByState();
  }, [selectedEmploymentFilter]);

  useEffect(() => {
    const { state } = selectedEmploymentFilter;
    if (!state) return;

    const polygons = statePolygons[state];
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

    const isAlaska = state === "AK";

    setControlledBounds({
      sw: { lat: minLat, lng: minLng },
      ne: { lat: maxLat, lng: maxLng },
      isAlaska,
    });
    skipNextRef.current = true;
  }, [selectedEmploymentFilter]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedEmploymentFilter((prev) => ({
      type: newType,
      state: "",
    }));
  };

  const handleStateChange = (newState) => {
    setSelectedEmploymentFilter((prev) => ({
      ...prev,
      state: newState,
    }));
  };

  return (
    <div>
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <select
            value={selectedEmploymentFilter.type}
            onChange={handleTypeChange}
            className="border p-2 rounded"
          >
            <option value="">Employment Type</option>
            {employmentOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <StateDropdown
            label=""
            selectedState={selectedEmploymentFilter.state}
            updateSelectedState={handleStateChange}
            disabled={!selectedEmploymentFilter.type}
          />
        </div>
      </div>

      <div className="flex h-screen">
        <div className="w-1/2 h-[65vh]">
          <Map
            points={points}
            forceBounds={controlledBounds}
            onLiveBoundsChange={setLiveBounds}
            loading={loadingPoints}
          />
        </div>
        <div className="w-1/2 h-full overflow-y-auto">
          {loadingPoints ? (
            <div>Loading...</div>
          ) : (
            <ProfileList points={livePoints} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapWithList;
