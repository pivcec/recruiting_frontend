// components/ManageDomains/index.tsx
import React, { useState, ChangeEvent } from "react";
import { Container } from "./styles";
import ExamFilterPanel from "./ExamFilterPanel";
import ResultsPanel from "./ResultsPanel";

import type {
  Exam,
  SelectedExam,
  ResultItem,
  FirmWithDomains,
  ProfilesByDomain,
} from "./types";

import { exams } from "../../consts.ts";

const ManageDomains: React.FC = () => {
  // --- State ---
  const [selectedExams, setSelectedExams] = useState<
    Record<string, SelectedExam>
  >({});
  const [employmentType, setEmploymentType] =
    useState<string>("employmentState");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [expandedFirmId, setExpandedFirmId] = useState<number | null>(null);
  const [firmDomains, setFirmDomains] = useState<FirmWithDomains>({});
  const [domainLoadingIds, setDomainLoadingIds] = useState<number[]>([]);
  const [profilesByDomain, setProfilesByDomain] = useState<ProfilesByDomain>(
    {}
  );
  const [expandedDomainId, setExpandedDomainId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Handlers ---
  const handleCheckboxChange = (examCode: string, scope: string) => {
    const key = `${scope}:${examCode}`;
    setSelectedExams((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = {
          examCategory: examCode,
          examScope: scope,
          latestExamDate: "",
        };
      }
      return updated;
    });
  };

  const handleEmploymentTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEmploymentType(e.target.value);
  };

  const getSelectedExamIds = (): number[] => {
    return Object.keys(selectedExams)
      .map((key) => {
        const [, code] = key.split(":");
        const examObj = exams.find((e) => e.code === code);
        return examObj ? examObj.id : null;
      })
      .filter((id): id is number => id !== null);
  };

  // You can move these async fetch handlers to api.ts later
  const handleSearch = async () => {
    setLoading(true);
    const exam_ids = getSelectedExamIds();

    try {
      const response = await fetch("http://localhost:8000/api/firms-by-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_ids }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFirmDomains = async (firm_id: number) => {
    if (expandedFirmId === firm_id) {
      setExpandedFirmId(null);
      return;
    }
    setExpandedFirmId(firm_id);

    if (!firmDomains[firm_id]) {
      setDomainLoadingIds((prev) => [...prev, firm_id]);

      try {
        const res = await fetch(`http://localhost:8000/api/firm-domains`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firm_id }),
        });

        if (!res.ok) throw new Error("Failed to fetch domains");

        const data = await res.json();
        setFirmDomains((prev) => ({ ...prev, [firm_id]: data.results || [] }));
      } catch (error) {
        console.error("Failed to fetch domains", error);
      } finally {
        setDomainLoadingIds((prev) => prev.filter((id) => id !== firm_id));
      }
    }
  };

  const handleDomainClick = async (
    exam_ids: number[],
    domain_ids: number[]
  ) => {
    const domainId = domain_ids[0];

    // Toggle open/close behavior
    if (expandedDomainId === domainId) {
      setExpandedDomainId(null); // close submenu if already open
      return;
    } else {
      setExpandedDomainId(domainId); // open the clicked domain submenu
    }

    try {
      const res = await fetch(
        "http://localhost:8000/api/profiles-by-exams-domains",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exam_ids, domain_ids }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profiles");

      const data = await res.json();
      setProfilesByDomain((prev) => ({
        ...prev,
        [domainId]: data.results || [],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button onClick={() => setIsSidebarOpen((open) => !open)}>
        {isSidebarOpen ? "Close Filters" : "Open Filters"}
      </button>
      <Container>
        {isSidebarOpen && (
          <ExamFilterPanel
            selectedExams={selectedExams}
            onCheckboxChange={handleCheckboxChange}
            employmentType={employmentType}
            onEmploymentTypeChange={handleEmploymentTypeChange}
            onSearch={handleSearch}
            loading={loading}
          />
        )}
        <ResultsPanel
          results={results}
          expandedFirmId={expandedFirmId}
          toggleFirmDomains={toggleFirmDomains}
          firmDomains={firmDomains}
          domainLoadingIds={domainLoadingIds}
          profilesByDomain={profilesByDomain}
          handleDomainClick={handleDomainClick}
          getSelectedExamIds={getSelectedExamIds}
          expandedDomainId={expandedDomainId}
        />
      </Container>
    </>
  );
};

export default ManageDomains;
