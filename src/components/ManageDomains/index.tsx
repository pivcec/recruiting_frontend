import React, { useState, ChangeEvent } from "react";
import styled from "styled-components";
import { exams } from "../../consts.ts";

type Exam = {
  id: number;
  code: string;
  name: string;
  category: string;
};

type SelectedExam = {
  examCategory: string;
  examScope: string;
  latestExamDate: string;
};

type ResultItem = {
  firm_id: number;
  firm_name: string;
};

type Domain = {
  id: number;
  domain: string;
};

type FirmWithDomains = {
  [firmId: number]: Domain[];
};

type ProfilesByDomain = {
  [domainId: number]: ResultItem[]; // or more precisely, ProfileResultItem[]
};

type ProfileResultItem = {
  id: number;
  full_name: string;
};

const Sidebar = styled.div`
  width: 300px;
  padding: 1rem;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  background-color: #f9f9f9;
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const GroupWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

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

  const handleDomainClick = async (
    exam_ids: number[],
    domain_ids: number[]
  ) => {
    const domainId = domain_ids[0]; // assuming one domain clicked at a time

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

  const toggleFirmDomains = async (firm_id: number) => {
    if (expandedFirmId === firm_id) {
      // Collapse if clicking the already open firm
      setExpandedFirmId(null);
      return;
    }

    // Expand new firm
    setExpandedFirmId(firm_id);

    if (!firmDomains[firm_id]) {
      setDomainLoadingIds((prev) => [...prev, firm_id]);

      try {
        const res = await fetch(`http://localhost:8000/api/firm-domains`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  const renderCheckboxGroup = (
    label: string,
    scope: string,
    examsSubset: Exam[]
  ) => (
    <GroupWrapper>
      <h4>{label}</h4>
      {examsSubset.map((exam) => {
        const key = `${scope}:${exam.code}`;
        const selected = !!selectedExams[key];
        return (
          <CheckboxWrapper key={key}>
            <Label>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleCheckboxChange(exam.code, scope)}
              />
              {exam.code} — {exam.name}
            </Label>
          </CheckboxWrapper>
        );
      })}
    </GroupWrapper>
  );

  const stateExams = exams.filter(
    (e) => e.category === "stateExamCategory"
  ) as Exam[];
  const productExams = exams.filter(
    (e) => e.category === "productExamCategory"
  ) as Exam[];
  const principalExams = exams.filter(
    (e) => e.category === "principalExamCategory"
  ) as Exam[];

  const handleSearch = async () => {
    setLoading(true);

    const selectedKeys = Object.keys(selectedExams);

    const exam_ids = selectedKeys
      .map((key) => {
        const [, code] = key.split(":");
        const examObj = exams.find((e) => e.code === code);
        return examObj ? examObj.id : null;
      })
      .filter((id): id is number => id !== null);

    const payload = { exam_ids };

    try {
      const response = await fetch("http://localhost:8000/api/firms-by-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const handleEmploymentTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEmploymentType(e.target.value);
  };

  const getSelectedExamIds = () => {
    return Object.keys(selectedExams)
      .map((key) => {
        const [, code] = key.split(":");
        const examObj = exams.find((e) => e.code === code);
        return examObj ? examObj.id : null;
      })
      .filter((id): id is number => id !== null);
  };

  return (
    <Container>
      <Sidebar>
        <h2>Manage Domains</h2>

        <Select value={employmentType} onChange={handleEmploymentTypeChange}>
          <option value="employmentState">EMPLOYMENT</option>
          <option value="iaEmploymentState">IA EMPLOYMENT</option>
        </Select>

        {renderCheckboxGroup("State Exams", "stateExamCategory", stateExams)}
        {renderCheckboxGroup(
          "Product Exams",
          "productExamCategory",
          productExams
        )}
        {/*
        {renderCheckboxGroup(
          "Principal Exams",
          "principalExamCategory",
          principalExams
        )}
        */}

        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </Sidebar>

      <MainContent>
        <h2>Preview / Results</h2>
        {loading ? (
          <p>Loading...</p>
        ) : results.length ? (
          results.map((item) => {
            const isExpanded = expandedFirmId === item.firm_id;
            const domains = firmDomains[item.firm_id] || [];
            const isLoadingDomains = domainLoadingIds.includes(item.firm_id);

            return (
              <div key={item.firm_id} style={{ marginBottom: "1rem" }}>
                <div
                  onClick={() => toggleFirmDomains(item.firm_id)}
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#007bff",
                  }}
                >
                  {item.firm_name}
                </div>

                {isExpanded && (
                  <div style={{ paddingLeft: "1rem", marginTop: "0.5rem" }}>
                    {isLoadingDomains ? (
                      <p>Loading domains...</p>
                    ) : domains.length ? (
                      domains.map((d) => {
                        const profiles = profilesByDomain[d.id] || [];

                        return (
                          <div key={d.id} style={{ padding: "0.25rem 0" }}>
                            <div
                              onClick={() =>
                                handleDomainClick(getSelectedExamIds(), [d.id])
                              }
                              style={{ cursor: "pointer", color: "blue" }}
                            >
                              {d.domain}
                            </div>

                            {profiles.length > 0 && (
                              <div
                                style={{
                                  marginLeft: "1rem",
                                  marginTop: "0.25rem",
                                }}
                              >
                                {profiles.map((p) => (
                                  <div key={p.id} style={{ color: "#444" }}>
                                    {p.full_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p>No domains found.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No results. Select filters and hit Search.</p>
        )}
      </MainContent>
    </Container>
  );
};

export default ManageDomains;
