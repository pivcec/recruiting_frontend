import React from "react";
import styled from "styled-components";
import { statusInfo } from "./index";

const TableWrapper = styled.div`
  overflow-x: auto;
  padding: 1rem;
`;

const Table = styled.div`
  display: table;
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const TableRow = styled.div`
  display: table-row;
`;

const TableHeaderCell = styled.div`
  display: table-cell;
  font-weight: bold;
  padding: 8px;
  border-bottom: 1px solid #ccc;
  text-align: left;
`;

const TableCell = styled.div<{ color?: string }>`
  display: table-cell;
  padding: 8px;
  border-bottom: 1px solid #eee;
  background-color: ${({ color }) => color || "inherit"};
  color: #000000;
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

type Props = {
  stats: {
    pattern_name: string;
    pattern_id: string | number;
    [key: string]: any;
  }[];
};

const PatternTable: React.FC<Props> = ({ stats }) => {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <TableRow>
            <TableHeaderCell>Pattern</TableHeaderCell>
            {statusesToShow.map((status) => (
              <TableHeaderCell key={status}>
                {statusInfo[status]?.label || status}
              </TableHeaderCell>
            ))}
          </TableRow>
        </thead>

        <tbody>
          {patterns.map((patternName) => {
            const patternStat = stats.find((p) =>
              patternName === "all"
                ? p.pattern_id === "all"
                : p.pattern_name === patternName
            );

            return (
              <TableRow key={patternName}>
                <TableCell>{patternName}</TableCell>
                {statusesToShow.map((status) => {
                  const field =
                    status === "total_verified" || status === "total_emails"
                      ? status
                      : `${status}_count`;

                  const value = patternStat?.[field];
                  const totalVerified = patternStat?.total_verified ?? 0;

                  const color =
                    typeof value === "number" && value > 0
                      ? statusInfo[status]?.color
                      : undefined;

                  // Calculate percentage only for *_count values (i.e., not total_verified or total_emails)
                  const showPercentage =
                    field !== "total_verified" &&
                    field !== "total_emails" &&
                    typeof value === "number" &&
                    totalVerified > 0;

                  const percentage = showPercentage
                    ? ((value / totalVerified) * 100).toFixed(1)
                    : null;

                  return (
                    <TableCell key={status} color={color}>
                      {typeof value === "number"
                        ? `${value.toLocaleString()}${
                            percentage ? ` (${percentage}%)` : ""
                          }`
                        : "—"}
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
