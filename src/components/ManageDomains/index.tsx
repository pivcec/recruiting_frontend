// components/ManageDomains/index.tsx
import React, { useState, ChangeEvent, useEffect } from "react";
import styled from "styled-components";
import ExamFilterPanel from "./ExamFilterPanel";
import DomainDetailPanel from "../DomainDetailPanel";
import ResultsPanel from "./ResultsPanel";

import type {
  SelectedExam,
  ResultItem,
  FirmWithDomains,
  ProfilesByDomain,
} from "./types";

import { exams } from "../../consts.ts";

const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const ToggleButton = styled.button`
  top: 8px;
  left: 8px;
  z-index: 1000;
  padding: 8px 12px;
  font-size: 14px;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const TopPanel = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  overflow: auto;
`;

const ResizeHandle = styled.div`
  height: 6px;
  background: #ccc;
  cursor: row-resize;
  z-index: 10;
`;

const BottomPanel = styled.div`
  flex: 1;
  overflow: auto;
`;

const Sidebar = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) =>
    isOpen ? "300px" : "40px"}; // adjust 300px or 40px as needed
  transition: width 0.3s ease;
  background: #f5f5f5;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
`;

const ChevronIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {direction === "left" ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 18 15 12 9 6" />
    )}
  </svg>
);

const ManageDomains: React.FC = () => {
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
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  const [selectedDomainName, setSelectedDomainName] = useState<string | null>(
    null
  );
  const [topPanelHeight, setTopPanelHeight] = useState<number>(400);
  const [isResizing, setIsResizing] = useState(false);
  const [hasUserResized, setHasUserResized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (selectedDomainId) {
      if (!hasUserResized) {
        setTopPanelHeight(400);
      }
    } else {
      setTopPanelHeight(window.innerHeight);
      setHasUserResized(false);
    }
  }, [loading, selectedDomainId, hasUserResized]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setTopPanelHeight(e.clientY);
      setHasUserResized(true);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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

  const handleSelectDomain = (name, id) => {
    setSelectedDomainName(name);
    setSelectedDomainId(id);
  };

  return (
    <>
      <Container style={{ userSelect: isResizing ? "none" : "auto" }}>
        <Sidebar isOpen={isSidebarOpen}>
          <ToggleButton onClick={() => setIsSidebarOpen((open) => !open)}>
            <ChevronIcon direction={isSidebarOpen ? "left" : "right"} />
          </ToggleButton>

          {isSidebarOpen && (
            <ExamFilterPanel
              selectedExams={selectedExams}
              onCheckboxChange={handleCheckboxChange}
              employmentType={employmentType}
              onEmploymentTypeChange={handleEmploymentTypeChange}
              onSearch={handleSearch}
              loading={loading}
              results={results}
            />
          )}
        </Sidebar>
        <MainColumn>
          <TopPanel height={topPanelHeight}>
            <ResultsPanel
              results={results}
              expandedFirmId={expandedFirmId}
              toggleFirmDomains={toggleFirmDomains}
              firmDomains={firmDomains}
              domainLoadingIds={domainLoadingIds}
              profilesByDomain={profilesByDomain}
              getSelectedExamIds={getSelectedExamIds}
              expandedDomainId={expandedDomainId}
              handleSelectDomain={handleSelectDomain}
            />
          </TopPanel>

          {selectedDomainId && (
            <>
              <ResizeHandle onMouseDown={() => setIsResizing(true)} />

              <BottomPanel>
                <DomainDetailPanel
                  domainName={selectedDomainName}
                  domainId={selectedDomainId}
                  examIds={getSelectedExamIds()}
                />
              </BottomPanel>
            </>
          )}
        </MainColumn>
      </Container>
    </>
  );
};

export default ManageDomains;
