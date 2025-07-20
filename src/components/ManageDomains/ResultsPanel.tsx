// components/ManageDomains/ResultsPanel.tsx
import React from "react";
import styled from "styled-components";

import type { ResultItem, FirmWithDomains, ProfilesByDomain } from "./types";

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const FirmHeader = styled.div`
  cursor: pointer;
  font-weight: bold;
  color: #007bff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const ProfileCount = styled.span`
  font-weight: normal;
  color: #666;
  font-size: 0.85em;
`;

const DomainsWrapper = styled.div`
  padding-left: 1rem;
  margin-top: 0.5rem;
`;

const DomainName = styled.div`
  cursor: pointer;
  color: blue;
  padding: 0.25rem 0;
  text-decoration: underline;
`;

const patternMap: Record<number, string> = {
  1: "first.last",
  2: "firstlast",
  3: "f.last",
  4: "firstl",
  5: "flast",
  6: "last.first",
  7: "lastfirst",
  8: "lastf",
  9: "f_last",
  10: "first_l",
  11: "first",
  12: "last",
  13: "first-middle-last",
  14: "fml",
  15: "first-middlelast",
  16: "first-last",
  17: "last-first",
  18: "fmlast",
};

type ResultsPanelProps = {
  results: ResultItem[];
  expandedFirmId: number | null;
  toggleFirmDomains: (firm_id: number) => void;
  firmDomains: FirmWithDomains;
  domainLoadingIds: number[];
  profilesByDomain: ProfilesByDomain;
  getSelectedExamIds: () => number[];
  expandedDomainId: number | null;
};

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  expandedFirmId,
  toggleFirmDomains,
  firmDomains,
  domainLoadingIds,
  profilesByDomain,
  getSelectedExamIds,
}) => {
  const totalProfiles = results.reduce(
    (acc, item) => acc + item.profile_count,
    0
  );

  const handleOpenDomainProfiles = (domainId: number) => {
    const examIds = getSelectedExamIds();
    if (!examIds.length) return;

    const examPath = examIds.join("-");
    const url = `/domain/${domainId}/exams/${examPath}/profiles`;
    window.open(url, "_blank");
  };

  return (
    <MainContent>
      <h2>{`${results.length} firms with ${totalProfiles} profiles`}</h2>
      {results.length === 0 ? (
        <p>No results. Select filters and hit Search.</p>
      ) : (
        results.map((item) => {
          const isExpanded = expandedFirmId === item.firm_id;
          const domains = firmDomains[item.firm_id] || [];
          const isLoadingDomains = domainLoadingIds.includes(item.firm_id);

          return (
            <div key={item.firm_id} style={{ marginBottom: "1rem" }}>
              <FirmHeader onClick={() => toggleFirmDomains(item.firm_id)}>
                <span>
                  {item.firm_name}{" "}
                  <ProfileCount>
                    ({item.profile_count.toLocaleString()} profiles)
                  </ProfileCount>
                </span>
              </FirmHeader>

              {isExpanded && (
                <DomainsWrapper>
                  {isLoadingDomains ? (
                    <p>Loading domains...</p>
                  ) : domains.length ? (
                    domains.map((d) => (
                      <div key={d.id}>
                        <DomainName
                          onClick={() => handleOpenDomainProfiles(d.id)}
                        >
                          {d.domain}
                        </DomainName>
                      </div>
                    ))
                  ) : (
                    <p>No domains found.</p>
                  )}
                </DomainsWrapper>
              )}
            </div>
          );
        })
      )}
    </MainContent>
  );
};

export default ResultsPanel;
