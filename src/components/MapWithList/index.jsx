import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import MapComponent from "./Map";
import ProfileList from "./List";
import StateDropdown from "./StateDropdown";
import statePolygons from "../../data/state_polygons_lowres_dict.json";

const ITEMS_PER_PAGE = 20;

const employmentOptions = [
  { label: "Current Employment", value: "employmentState" },
  { label: "Current IA Employment", value: "iaEmploymentState" },
];

const Container = styled.div`
  padding: 1rem;
`;
const FiltersWrapper = styled.div`
  margin-bottom: 1rem;
`;
const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;
const Label = styled.label`
  margin-right: 0.5rem;
  font-weight: 600;
`;
const Select = styled.select`
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 4px;
  min-width: 180px;
  background: white;
  font-size: 1rem;
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;
const ContentWrapper = styled.div`
  display: flex;
  height: 65vh;
`;
const MapWrapper = styled.div`
  flex: 1;
  height: 100%;
`;
const ListWrapper = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding-left: 1rem;
`;
const Message = styled.div`
  font-style: italic;
  color: #666;
  margin-top: 1rem;
`;

const MapWithList = () => {
  const [selectedEmploymentFilter, setSelectedEmploymentFilter] = useState({
    type: "",
    state: "",
  });
  const [registeredState, setRegisteredState] = useState("");
  const [points, setPoints] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [page, setPage] = useState(1);
  const [controlledBounds, setControlledBounds] = useState({
    sw: { lat: 24.396308, lng: -125.0 },
    ne: { lat: 49.384358, lng: -66.93457 },
    isAlaska: false,
  });
  const [liveBounds, setLiveBounds] = useState(null);

  const selectedFilter = useMemo(() => {
    if (registeredState) {
      return { type: "registeredState", state: registeredState };
    } else if (
      selectedEmploymentFilter.type &&
      selectedEmploymentFilter.state
    ) {
      return selectedEmploymentFilter;
    }
    return { type: "", state: "" };
  }, [registeredState, selectedEmploymentFilter]);

  useEffect(() => {
    const { type, state } = selectedFilter;
    if (!type || !state) {
      setPoints([]);
      setProfiles([]);
      setPage(1);
      return;
    }

    const fetchPoints = async () => {
      setLoadingPoints(true);
      try {
        const params = new URLSearchParams();
        if (type === "registeredState") {
          params.append("registeredState", state);
        } else {
          params.append(type, state);
        }

        const resPoints = await fetch(
          `http://localhost:8000/api/map?${params}`
        );
        if (!resPoints.ok) throw new Error("Failed to fetch points");

        const rawResponse = await resPoints.json();
        const rawPoints = rawResponse.profiles || [];

        const uniquePoints = rawPoints.filter(
          (v, i, self) =>
            self.findIndex((p) => String(p.id) === String(v.id)) === i
        );

        setPoints(uniquePoints);
        setPage(1);

        const polygons = statePolygons[state];
        if (polygons) {
          let minLat = Infinity,
            minLng = Infinity,
            maxLat = -Infinity,
            maxLng = -Infinity;

          polygons.forEach((polygon) => {
            polygon.forEach(([lat, lng]) => {
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
            });
          });

          const bounds = {
            sw: { lat: minLat, lng: minLng },
            ne: { lat: maxLat, lng: maxLng },
            isAlaska: state === "AK",
          };

          setControlledBounds(bounds);
          setLiveBounds({ sw: bounds.sw, ne: bounds.ne });
        }
      } catch (err) {
        console.error("[fetchPoints] Error:", err);
        setPoints([]);
        setProfiles([]);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchPoints();
  }, [selectedFilter]);

  // ✅ Filter all points by live map bounds BEFORE paginating
  const filteredPoints = useMemo(() => {
    if (!liveBounds || !points.length) return [];

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
    if (!filteredPoints.length) {
      setProfiles([]);
      return;
    }

    const start = (page - 1) * ITEMS_PER_PAGE;
    const pagePoints = filteredPoints.slice(start, start + ITEMS_PER_PAGE);
    const ids = pagePoints.map((p) => String(p.id));

    if (ids.length === 0) {
      setProfiles([]);
      return;
    }

    console.log("ids", ids);

    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const resProfiles = await fetch(
          "http://localhost:8000/api/profiles-by-id",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          }
        );
        if (!resProfiles.ok) throw new Error("Failed to fetch profiles");

        const dataProfiles = await resProfiles.json();
        const pointMap = new Map(pagePoints.map((p) => [String(p.id), p]));

        const mergedProfiles = (dataProfiles.profiles || [])
          .map((profile) => {
            const point = pointMap.get(String(profile._id));
            return point
              ? {
                  ...profile,
                  lat: point.lat,
                  lng: point.lng,
                }
              : null;
          })
          .filter(Boolean);

        setProfiles(mergedProfiles);
      } catch (err) {
        console.error("[fetchProfiles] Error:", err);
        setProfiles([]);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [filteredPoints, page]);

  const handleTypeChange = useCallback((e) => {
    setRegisteredState("");
    setSelectedEmploymentFilter({ type: e.target.value, state: "" });
  }, []);

  const handleEmploymentStateChange = useCallback(
    (newState) => {
      setSelectedEmploymentFilter((prev) => ({ ...prev, state: newState }));
      if (registeredState) setRegisteredState("");
    },
    [registeredState]
  );

  /*
  const handleRegisteredStateChange = useCallback((newState) => {
    setSelectedEmploymentFilter({ type: "", state: "" });
    setRegisteredState(newState);
  }, []);
  */

  return (
    <Container>
      <FiltersWrapper>
        <FiltersRow>
          <Label htmlFor="employment-type-select">Employment Type:</Label>
          <Select
            id="employment-type-select"
            value={selectedEmploymentFilter.type}
            onChange={handleTypeChange}
          >
            <option value="">Select Type</option>
            {employmentOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <StateDropdown
            label="Employment State"
            option="Select State"
            selectedState={selectedEmploymentFilter.state}
            updateSelectedState={handleEmploymentStateChange}
            disabled={!selectedEmploymentFilter.type}
          />
        </FiltersRow>
      </FiltersWrapper>

      <ContentWrapper>
        <MapWrapper>
          <MapComponent
            points={points}
            forceBounds={controlledBounds}
            onLiveBoundsChange={setLiveBounds}
            loading={loadingPoints}
          />
        </MapWrapper>
        <ListWrapper>
          <ProfileList
            profiles={profiles}
            total={filteredPoints.length}
            page={page}
            setPage={setPage}
            loading={loadingProfiles}
          />
        </ListWrapper>
      </ContentWrapper>
    </Container>
  );
};

export default MapWithList;
