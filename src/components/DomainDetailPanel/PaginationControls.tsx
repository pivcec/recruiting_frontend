import React from "react";
import styled from "styled-components";

const Pagination = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const PaginationLabel = styled.div`
  font-size: 13px;
`;

type Props = {
  offset: number;
  limit: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
};

const PaginationControls: React.FC<Props> = ({
  offset,
  limit,
  totalCount,
  onPrev,
  onNext,
}) => (
  <Pagination>
    <Button onClick={onPrev} disabled={offset === 0}>
      Previous
    </Button>
    <PaginationLabel>
      Showing {offset + 1} - {Math.min(offset + limit, totalCount)} of{" "}
      {totalCount}
    </PaginationLabel>
    <Button onClick={onNext} disabled={offset + limit >= totalCount}>
      Next
    </Button>
  </Pagination>
);

export default PaginationControls;
