// components/ManageDomains/ExamFilterPanel.tsx
import React from "react";
import styled from "styled-components";
import { exams } from "../../consts.ts";

import type { Exam, SelectedExam, ResultItem } from "./types";

const Sidebar = styled.div`
  padding: 1rem;
  overflow-y: auto;
`;

const GroupWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 0.5rem;
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

type ExamFilterPanelProps = {
  selectedExams: Record<string, SelectedExam>;
  onCheckboxChange: (examCode: string, scope: string) => void;
  employmentType: string;
  onEmploymentTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearch: () => void;
  loading: boolean;
  results: ResultItem[];
};

const renderCheckboxGroup = (
  label: string,
  scope: string,
  examsSubset: Exam[],
  selectedExams: Record<string, SelectedExam>,
  onCheckboxChange: (examCode: string, scope: string) => void
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
              onChange={() => onCheckboxChange(exam.code, scope)}
            />
            {exam.code} — {exam.name}
          </Label>
        </CheckboxWrapper>
      );
    })}
  </GroupWrapper>
);

const ExamFilterPanel: React.FC<ExamFilterPanelProps> = ({
  selectedExams,
  onCheckboxChange,
  employmentType,
  onEmploymentTypeChange,
  onSearch,
  loading,
  results,
}) => {
  const stateExams = exams.filter((e) => e.category === "stateExamCategory");
  const productExams = exams.filter(
    (e) => e.category === "productExamCategory"
  );

  const totalProfiles = results.reduce(
    (acc, item) => acc + item.profile_count,
    0
  );

  return (
    <Sidebar>
      <Select value={employmentType} onChange={onEmploymentTypeChange}>
        <option value="employmentState">EMPLOYMENT</option>
        <option value="iaEmploymentState">IA EMPLOYMENT</option>
      </Select>

      {renderCheckboxGroup(
        "State Exams",
        "stateExamCategory",
        stateExams,
        selectedExams,
        onCheckboxChange
      )}

      {renderCheckboxGroup(
        "Product Exams",
        "productExamCategory",
        productExams,
        selectedExams,
        onCheckboxChange
      )}

      {/* Uncomment if you want principal exams
      {renderCheckboxGroup(
        "Principal Exams",
        "principalExamCategory",
        principalExams,
        selectedExams,
        onCheckboxChange
      )}
      */}

      <Button onClick={onSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>

      {results.length > 0 && (
        <div style={{ marginTop: "30px", fontSize: "11px" }}>
          <div>{`Firms: ${results.length.toLocaleString()}`}</div>
          <div>{`Profiles: ${totalProfiles.toLocaleString()}`}</div>
        </div>
      )}
    </Sidebar>
  );
};

export default ExamFilterPanel;
