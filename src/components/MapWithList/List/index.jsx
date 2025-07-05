import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 20;

// Capitalize first letter of each name part
const formatName = (profile) => {
  if (!profile?.data?.hits?.hits?.[0]?._source?.content)
    return "Unnamed Profile";

  try {
    const parsed = JSON.parse(profile.data.hits.hits[0]._source.content);
    const basicInfo = parsed.basicInformation || {};
    const first = basicInfo.firstName?.toLowerCase() || "";
    const middle = basicInfo.middleName?.toLowerCase() || "";
    const last = basicInfo.lastName?.toLowerCase() || "";
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return [first, middle, last].filter(Boolean).map(cap).join(" ");
  } catch (e) {
    console.error("Name parse error:", e);
    return "Unnamed Profile";
  }
};

const List = ({ points, selectedState }) => {
  const [page, setPage] = useState(1);
  const [profiles, setProfiles] = useState([]);
  const totalPages = Math.ceil(points.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
    if (totalPages === 0 && page !== 1) {
      setPage(1);
    }
  }, [totalPages, page]);

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

  /*
  // Function to build LinkedIn search URL
  const openLinkedInSearch = (name, selectedState) => {
    // URL encode name and state for safe URLs
    const query = encodeURIComponent(`${name} ${selectedState || ""}`.trim());
    const url = `https://www.linkedin.com/search/results/all/?keywords=${query}`;
    window.open(url, "_blank");
  };
  */

  const openProfilePage = (id) => {
    window.open(`/profiles?id=${id}`, "_blank");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Profiles (Page {page})</h2>
      <ul className="mb-4">
        {profiles.length > 0 ? (
          profiles.map((profile) => {
            const name = formatName(profile);
            return (
              <li
                key={profile._id}
                className="border-b py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => openProfilePage(profile._id)}
                title={`Open details for ${name}`}
              >
                {name}
                {/*
                <button
                  className="ml-4 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => openLinkedInSearch(name, selectedState)}
                  title={`Search LinkedIn for ${name} in ${selectedState}`}
                >
                  LinkedIn Search
                </button>
                */}
              </li>
            );
          })
        ) : (
          <li>No profiles found.</li>
        )}
      </ul>

      <div className="flex justify-between">
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
