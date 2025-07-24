import React from "react";
import styled from "styled-components";
import type { ResultItem, FirmWithDomains } from "./types";

// Layout styles
const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
`;

const TableRow = styled.div<{ clickable?: boolean }>`
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0.5rem;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  background-color: ${({ clickable }) =>
    clickable ? "#f9f9f9" : "transparent"};

  &:hover {
    background-color: ${({ clickable }) => (clickable ? "#f1faff" : "inherit")};
  }
`;

const TableHeader = styled(TableRow)`
  font-weight: bold;
  background-color: #f1f1f1;
  cursor: default;
`;

const Cell = styled.div<{ flex?: number; align?: string }>`
  flex: ${({ flex }) => flex || 1};
  text-align: ${({ align }) => align || "left"};
`;

const DomainsWrapper = styled.div`
  padding: 0.5rem 1rem;
  background-color: #f9f9f9;
`;

const DomainName = styled.div<{ selected: boolean }>`
  font-size: 12px;
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  padding: 0.25rem 0;
  background-color: ${({ selected }) => (selected ? "#e6f2ff" : "transparent")};
  border-radius: 4px;
`;

type ResultsPanelProps = {
  results: ResultItem[];
  expandedFirmId: number | null;
  firmDomains: FirmWithDomains;
  domainLoadingIds: number[];
  selectedDomainName: null | string;
  toggleFirmDomains: (firm_id: number) => void;
  handleSelectDomain: (domainName: string, domainId: number) => void;
  getSelectedExamIds: () => void;
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  expandedFirmId,
  firmDomains,
  domainLoadingIds,
  selectedDomainName,
  toggleFirmDomains,
  handleSelectDomain,
}) => {
  const handleOpenDomainProfiles = (domainName: string, domainId: number) => {
    handleSelectDomain(domainName, domainId);
  };

  return (
    <MainContent>
      {results.length === 0 ? (
        <p>No results. Select filters and hit Search.</p>
      ) : (
        <Table>
          <TableHeader>
            <Cell flex={2}>Firm</Cell>
            <Cell flex={1} align="right">
              Profiles
            </Cell>
            <Cell flex={1} align="right">
              Guessed Emails
            </Cell>
            <Cell flex={1} align="right">
              Checked Guesses
            </Cell>
          </TableHeader>

          {results.map((item) => {
            const isExpanded = expandedFirmId === item.firm_id;
            const domains = firmDomains[item.firm_id] || [];
            const isLoadingDomains = domainLoadingIds.includes(item.firm_id);

            return (
              <React.Fragment key={item.firm_id}>
                <TableRow
                  onClick={() => toggleFirmDomains(item.firm_id)}
                  clickable
                >
                  <Cell flex={2}>{item.firm_name}</Cell>
                  <Cell flex={1} align="right">
                    {item.profile_count.toLocaleString()}
                  </Cell>
                  <Cell flex={1} align="right">
                    {item.email_guess_count.toLocaleString()}
                  </Cell>
                  <Cell flex={1} align="right">
                    {item.verified_email_guess_count.toLocaleString()}
                  </Cell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <Cell flex={4}>
                      <DomainsWrapper>
                        {isLoadingDomains ? (
                          "Loading domains..."
                        ) : domains.length ? (
                          domains.map((d) => (
                            <DomainName
                              key={d.id}
                              onClick={() =>
                                handleOpenDomainProfiles(d.domain, d.id)
                              }
                              selected={selectedDomainName === d.domain}
                            >
                              {d.domain}
                            </DomainName>
                          ))
                        ) : (
                          <p>No domains found.</p>
                        )}
                      </DomainsWrapper>
                    </Cell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </Table>
      )}
    </MainContent>
  );
};

export default ResultsPanel;
