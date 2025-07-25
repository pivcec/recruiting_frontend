import React, { useState } from "react";
import styled from "styled-components";
import { statusInfo } from "./index";

const TableWrapper = styled.div`
  overflow-x: hidden;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const Table = styled.div`
  display: table;
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
`;

const TableRow = styled.div`
  display: table-row;
`;

const TableHeaderCell = styled.div`
  display: table-cell;
  font-weight: bold;
  padding: 2px;
  border-bottom: 1px solid #ccc;
  text-align: center;
  vertical-align: middle;
`;

const TableCell = styled.div<{ color?: string }>`
  display: table-cell;
  padding: 8px;
  border-bottom: 1px solid #eee;
  background-color: ${({ color }) => color || "inherit"};
  color: #000000;
  text-align: center;
  vertical-align: middle;
`;

const statusesToShow = [
  "total_verified",
  "ok",
  "email_disabled",
  "dead_server",
  "invalid_mx",
  "disposable",
  "spamtrap",
  "ok_for_all",
  "smtp_protocol",
  "antispam_system",
  "unknown",
  "invalid_syntax",
];

const patterns = [
  "all",
  "first.last",
  "firstlast",
  "f.last",
  "firstl",
  "flast",
  "last.first",
  "lastfirst",
  "lastf",
  "f_last",
  "first_l",
  "first",
  "last",
  "first-middle-last",
  "fml",
  "first-middlelast",
  "first-last",
  "last-first",
  "fmlast",
  "first_last",
];

const InfoWrapper = styled.span`
  position: relative;
  display: inline-block;
  margin-left: 0.25rem;
  vertical-align: middle;
  cursor: default;

  &:hover > span {
    opacity: 1;
    pointer-events: auto;
  }
`;

const Tooltip = styled.span`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #4a5568;
  color: white;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 10;
  user-select: none;
`;

type PatternStats = {
  pattern_name: string;
  pattern_id: string | number;
  [key: string]: any;
};

type Props = {
  stats: {
    domain_id: number;
    email_guess_count: number;
    pattern_stats: PatternStats[];
  };
};

const PatternTable: React.FC<Props> = ({ stats }) => {
  const { pattern_stats } = stats;
  const [showAllRows, setShowAllRows] = useState(false);

  return (
    <TableWrapper>
      <button
        onClick={() => setShowAllRows(!showAllRows)}
        style={{
          marginBottom: "0.5rem",
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: "13px",
        }}
        aria-expanded={showAllRows}
        aria-controls="pattern-table-body"
      >
        {showAllRows ? "Hide Details" : "Show Details"}
      </button>

      <Table>
        <thead>
          <TableRow>
            <TableHeaderCell>Pattern</TableHeaderCell>
            <TableHeaderCell>Guessed Emails</TableHeaderCell>
            {statusesToShow.map((status) => (
              <TableHeaderCell key={status}>
                {statusInfo[status]?.label || status}
              </TableHeaderCell>
            ))}
          </TableRow>
        </thead>

        <tbody id="pattern-table-body">
          {(showAllRows ? patterns : ["all"]).map((patternName) => {
            const patternStat = pattern_stats.find((p) =>
              patternName === "all"
                ? p.pattern_id === "all"
                : p.pattern_name === patternName
            );

            return (
              <TableRow key={patternName}>
                <TableCell>{patternName}</TableCell>

                <TableCell>
                  {typeof patternStat?.total_emails === "number"
                    ? patternStat.total_emails.toLocaleString()
                    : "—"}
                </TableCell>

                {statusesToShow.map((status) => {
                  const field =
                    status === "total_verified" || status === "total_emails"
                      ? status
                      : `${status}_count`;

                  const value = patternStat?.[field];
                  const totalVerified = patternStat?.total_verified ?? 0;
                  const totalEmails = patternStat?.total_emails ?? 0;

                  const color =
                    typeof value === "number" && value > 0
                      ? statusInfo[status]?.color
                      : undefined;

                  const showPercentage =
                    field !== "total_emails" &&
                    typeof value === "number" &&
                    ((field === "total_verified" && totalEmails > 0) ||
                      (field !== "total_verified" && totalVerified > 0));

                  const rawPercentage =
                    showPercentage && field === "total_verified"
                      ? (value / totalEmails) * 100
                      : showPercentage
                      ? (value / totalVerified) * 100
                      : null;

                  const percentage =
                    rawPercentage !== null
                      ? rawPercentage < 0.1 && rawPercentage > 0
                        ? "< 0.1"
                        : rawPercentage.toFixed(1)
                      : null;

                  const tooltipText =
                    field === "total_verified"
                      ? `${percentage}% of guessed emails`
                      : `${percentage}% of checked guesses`;

                  return (
                    <TableCell
                      key={status}
                      color={color}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {typeof value === "number" ? (
                        <InfoWrapper>
                          {value.toLocaleString()}
                          {percentage && <Tooltip>{tooltipText}</Tooltip>}
                        </InfoWrapper>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default PatternTable;
