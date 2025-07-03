import { useState, useEffect } from "react";
import Map from "./Map";
import ProfileList from "./List";

const MapWithList = () => {
  const [bounds, setBounds] = useState({
    sw: { lat: 24.396308, lng: -125.0 },
    ne: { lat: 49.384358, lng: -66.93457 },
  });
  const [zoom, setZoom] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const fetchPointsByState = async () => {
      const stateCode = "California"; // 🔁 Later: derive from user selection or bounds

      try {
        const res = await fetch(`http://localhost:8000/api/map/${stateCode}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setPoints(data);
      } catch (err) {
        console.error("Error fetching state map data:", err);
      }
    };

    fetchPointsByState();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 h-full">
        <Map
          bounds={bounds}
          points={points}
          onBoundsChange={setBounds}
          zoom={zoom}
          setZoom={setZoom}
          selectedProfile={selectedProfile}
          onSelectProfile={setSelectedProfile}
        />
      </div>
      <div className="w-1/2 h-full overflow-y-auto">
        <ProfileList
          bounds={bounds}
          selectedProfile={selectedProfile}
          onSelectProfile={setSelectedProfile}
        />
      </div>
    </div>
  );
};

export default MapWithList;
