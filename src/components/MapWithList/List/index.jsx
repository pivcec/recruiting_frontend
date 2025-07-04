import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 30;

const List = ({ points }) => {
  const [page, setPage] = useState(1);
  const [profiles, setProfiles] = useState([]);
  const totalPages = Math.ceil(points.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (!points || points.length === 0) {
      setProfiles([]);
      return;
    }

    const fetchProfiles = async () => {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const idsToFetch = points.slice(start, end).map((p) => p.id);

      try {
        const res = await fetch("http://localhost:8000/api/profiles-by-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: idsToFetch }),
        });

        if (!res.ok) throw new Error("Failed to fetch profiles");

        const data = await res.json();
        setProfiles(data.profiles || []);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setProfiles([]);
      }
    };

    fetchProfiles();
  }, [page, points]);

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const formatName = (profile) => {
    try {
      const hits = profile?.data?.hits?.hits;
      const content = hits?.[0]?._source?.content;
      if (!content) return "Unnamed Profile";

      const parsed = JSON.parse(content);
      const info = parsed?.basicInformation;
      if (!info) return "Unnamed Profile";

      const { firstName = "", middleName = "", lastName = "" } = info;
      return [firstName, middleName, lastName].filter(Boolean).join(" ");
    } catch (err) {
      console.error("Error parsing profile name:", err);
      return "Unnamed Profile";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Profiles (Page {page})</h2>
      <ul className="mb-4">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <li key={profile._id} className="border-b py-2">
              {formatName(profile)}
            </li>
          ))
        ) : (
          <li>No profiles found.</li>
        )}
      </ul>

      <div className="flex justify-between items-center">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={handlePrev}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="px-4">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default List;
