import React from "react";
import styled from "styled-components";

interface TabsProps {
  patternMap: Record<number, string>;
  onTabChange?: (patternId: number) => void;
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const TabContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  background: none;
  border: none;
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  border-bottom: ${({ active }) => (active ? "2px solid blue" : "none")};
`;

const PatternTabs: React.FC<TabsProps> = ({
  patternMap,
  onTabChange,
  activeTab,
  setActiveTab,
}) => {
  const handleClick = (patternId: number) => {
    setActiveTab(patternId);
    onTabChange?.(patternId);
  };

  return (
    <TabContainer>
      {Object.entries(patternMap).map(([patternId, patternName]) => (
        <TabButton
          key={patternId}
          active={activeTab === Number(patternId)}
          onClick={() => handleClick(Number(patternId))}
        >
          {patternName}
        </TabButton>
      ))}
    </TabContainer>
  );
};

export default PatternTabs;
