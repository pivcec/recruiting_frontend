import React from "react";
import styled from "styled-components";
import { patternMap, statusInfo } from "./index";

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr 3fr;
  border-bottom: 1px solid #eee;
  align-items: center;
  font-size: 12px;
  padding: 0 10px;
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  font-weight: bold;
  padding-bottom: 10px;
`;

const Select = styled.select`
  padding: 4px 6px;
  font-size: 11px;
  max-width: 140px;
`;

const CellLabel = styled.div`
  margin-bottom: 25px;
`;

type Props = {
  selectedPattern: number | "all";
  setSelectedPattern: (value: number | "all") => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
};

const FilterBar: React.FC<Props> = ({
  selectedPattern,
  setSelectedPattern,
  selectedStatus,
  setSelectedStatus,
}) => (
  <HeaderRow>
    <CellLabel>Full Name</CellLabel>
    <div>
      <label style={{ display: "block" }}>Pattern</label>
      <Select
        value={selectedPattern}
        onChange={(e) =>
          setSelectedPattern(
            e.target.value === "all" ? "all" : parseInt(e.target.value)
          )
        }
      >
        <option value="all">All</option>
        {Object.entries(patternMap).map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
    </div>
    <div>
      <label style={{ display: "block" }}>Status</label>
      <Select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="all">All</option>
        {Object.entries(statusInfo).map(([key, { label }]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  </HeaderRow>
);

export default FilterBar;
