import React, { useState } from "react";

const PAGE_SIZE = 100;

const stateExamCategory = ["Series 66", "Series 63", "Series 65"];

const principalExamCategory = [
  "Series 24",
  "Series 10",
  "Series 9",
  "Series 26",
  "Series 8",
  "Series 27",
  "Series 51",
  "Series 53",
  "Series 4",
  "Series 23",
  "Series 14",
  "Series 28",
  "Series 30",
  "Series 12",
  "Series 54",
  "Series 40",
  "Series 39",
  "Series 00",
  "F04",
  "Series 54FN",
  "Series 14A",
];

const productExamCategory = [
  "SIE",
  "Series 7",
  "Series 7TO",
  "Series 6",
  "Series 3",
  "Series 31",
  "Series 6TO",
  "Series 55",
  "Series 62",
  "Series 22",
  "Series 99TO",
  "Series 52",
  "Series 11",
  "Series 57TO",
  "Series 79TO",
  "Series 87",
  "Series 16",
  "Series 79",
  "PC",
  "Series 1",
  "Series 82TO",
  "Series 52TO",
  "Series 22TO",
  "Series 57",
  "Series 99",
  "Series 34",
  "Series 2",
  "Series 50",
  "Series 5",
  "Series 15",
  "Series 18",
  "Series 17",
  "Series 82",
  "Series 86",
  "Series 41",
  "Series 72",
  "Series 42",
  "Series 000",
  "Series 33",
  "Series 25",
  "Series 56",
  "Series 19",
  "Series 7A",
  "Series 44",
  "Series 37",
  "Series 32",
  "Series 21",
  "Series 45",
  "Series 48",
  "V06",
  "Series 38",
  "Series 46",
  "Series 7B",
];

const SearchByCert = () => {
  const [selectedExams, setSelectedExams] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [employmentState, setEmploymentState] = useState("");
  const [employmentType, setEmploymentType] = useState("employmentState");
  const [idInput, setIdInput] = useState("");

  const handleCheckboxChange = (exam, scope) => {
    const key = `${scope}:${exam}`;
    setSelectedExams((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = {
          examCategory: exam,
          examScope: scope,
          latestExamDate: "",
        };
      }
      return updated;
    });
  };

  const handleDateChange = (key, date) => {
    setSelectedExams((prev) => ({
      ...prev,
      [key]: { ...prev[key], latestExamDate: date },
    }));
  };

  const fetchProfiles = async (pageNumber = 1) => {
    const filters = Object.values(selectedExams);
    const payload = {
      filters,
      ids: idInput ? idInput.split(",").map((id) => id.trim()) : undefined,
      [employmentType]: employmentState || undefined,
    };

    if (!filters.length && !idInput && !employmentState) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/profile-filters?page=${pageNumber}&page_size=${PAGE_SIZE}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setProfiles(data.results || []);
      setTotal(data.total || 0);
      setPage(data.page || pageNumber);
    } catch (err) {
      console.error(err);
      setProfiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProfiles(1);
  };

  const handlePrev = () => {
    if (page > 1) fetchProfiles(page - 1);
  };

  const handleNext = () => {
    if (page < Math.ceil(total / PAGE_SIZE)) fetchProfiles(page + 1);
  };

  const renderCheckboxGroup = (label, exams, scope) => (
    <div style={{ marginBottom: "1rem" }}>
      <h4>{label}</h4>
      {exams.map((exam) => {
        const key = `${scope}:${exam}`;
        const selected = !!selectedExams[key];
        return (
          <div key={key} style={{ marginBottom: "0.5rem" }}>
            <label>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleCheckboxChange(exam, scope)}
              />
              {exam}
            </label>
            {selected && (
              <input
                type="date"
                value={selectedExams[key].latestExamDate}
                onChange={(e) => handleDateChange(key, e.target.value)}
                style={{ marginLeft: "1rem" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          padding: "1rem",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
        }}
      >
        <h2>Search Filters</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Employment State</label>
          <input
            type="text"
            value={employmentState}
            onChange={(e) => setEmploymentState(e.target.value)}
            placeholder="e.g., NY"
            style={{ width: "100%" }}
          />
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            style={{ marginTop: "0.5rem", width: "100%" }}
          >
            <option value="employmentState">EMPLOYMENT</option>
            <option value="iaEmploymentState">IA EMPLOYMENT</option>
            <option value="previousEmploymentState">PREVIOUS EMPLOYMENT</option>
            <option value="previousIAEmploymentState">
              PREVIOUS IA EMPLOYMENT
            </option>
          </select>
        </div>

        {renderCheckboxGroup(
          "State Exams",
          stateExamCategory,
          "stateExamCategory"
        )}
        {renderCheckboxGroup(
          "Product Exams",
          productExamCategory,
          "productExamCategory"
        )}
        {renderCheckboxGroup(
          "Principal Exams",
          principalExamCategory,
          "principalExamCategory"
        )}

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ marginTop: "1rem", width: "100%", padding: "0.5rem" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <h2>Search Results</h2>
        {loading ? (
          <p>Loading...</p>
        ) : profiles.length ? (
          <>
            <p>
              Showing page {page} of {Math.ceil(total / PAGE_SIZE)} — Total:{" "}
              {total}
            </p>
            <div>
              {profiles.map((profile) => {
                const content =
                  profile?.data?.hits?.hits?.[0]?._source?.content;
                let name = "Unnamed";
                try {
                  const parsed = JSON.parse(content);
                  const basic = parsed.basicInformation;
                  if (basic) {
                    name = [basic.firstName, basic.middleName, basic.lastName]
                      .filter(Boolean)
                      .join(" ");
                  }
                } catch (err) {
                  console.warn("JSON parse failed");
                }

                return (
                  <div key={profile._id} style={{ marginBottom: "0.5rem" }}>
                    <a
                      href={`/profiles?id=${profile._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {name}
                    </a>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handlePrev} disabled={page === 1}>
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={page === Math.ceil(total / PAGE_SIZE)}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>No profiles found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchByCert;
