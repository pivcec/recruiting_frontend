// components/ManageDomains/ResultsPanel.tsx
import React from "react";
import styled from "styled-components";

import type { ResultItem, FirmWithDomains } from "./types";

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const FirmHeader = styled.div`
  font-size: 12px;
  cursor: pointer;
  font-weight: bold;
  color: #007bff;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProfileCount = styled.span`
  font-weight: normal;
  color: #666;
  font-size: 11px;
`;

const DomainsWrapper = styled.div`
  padding-left: 5px;
  font-size: 12px;
`;

const DomainName = styled.div<{ selected: boolean }>`
  font-size: 12px;
  cursor: pointer;
  color: blue;
  padding: 0.25rem 0;
  text-decoration: underline;
  background-color: ${({ selected }) => (selected ? "#e6f2ff" : "transparent")};
  border-radius: 4px;
`;

type ResultsPanelProps = {
  results: ResultItem[];
  expandedFirmId: number | null;
  toggleFirmDomains: (firm_id: number) => void;
  firmDomains: FirmWithDomains;
  domainLoadingIds: number[];
  getSelectedExamIds: () => number[];
  handleSelectDomain: (domainName: string, domainId: number) => void;
  selectedDomainName: null | string;
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  expandedFirmId,
  toggleFirmDomains,
  firmDomains,
  domainLoadingIds,
  handleSelectDomain,
  selectedDomainName,
}) => {
  const handleOpenDomainProfiles = (domainName: string, domainId: number) => {
    handleSelectDomain(domainName, domainId);
  };

  return (
    <MainContent>
      {results.length === 0 ? (
        <p>No results. Select filters and hit Search.</p>
      ) : (
        results.map((item) => {
          const isExpanded = expandedFirmId === item.firm_id;
          const domains = firmDomains[item.firm_id] || [];
          const isLoadingDomains = domainLoadingIds.includes(item.firm_id);

          console.log("item", item);

          return (
            <div key={item.firm_id}>
              <FirmHeader onClick={() => toggleFirmDomains(item.firm_id)}>
                <span>
                  {item.firm_name}{" "}
                  <ProfileCount>
                    {`(${item.profile_count.toLocaleString()} profiles, ${item.email_guess_count.toLocaleString()} guessed emails, ${item.verified_email_guess_count.toLocaleString()} checked guesses)`}
                  </ProfileCount>
                </span>
              </FirmHeader>

              {isExpanded && (
                <DomainsWrapper>
                  {isLoadingDomains ? (
                    "Loading domains..."
                  ) : domains.length ? (
                    domains.map((d) => (
                      <div key={d.id}>
                        <DomainName
                          onClick={() =>
                            handleOpenDomainProfiles(d.domain, d.id)
                          }
                          selected={selectedDomainName === d.domain}
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
