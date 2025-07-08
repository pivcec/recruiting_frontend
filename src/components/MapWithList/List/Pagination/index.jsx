import styled from "styled-components";

const PaginationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const PageInfo = styled.span`
  padding: 0 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.25rem 0.75rem;
  background-color: #e5e7eb; /* gray-200 */
  border-radius: 0.375rem;
  cursor: pointer;
  border: none;
  font-size: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #d1d5db; /* gray-300 */
  }
`;

const Pagination = ({ page, totalPages, handleNext, handlePrev }) => {
  return (
    <PaginationWrapper>
      <PageInfo>
        Page {page} of {totalPages}
      </PageInfo>
      <ButtonRow>
        <Button onClick={handlePrev} disabled={page === 1}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={page === totalPages}>
          Next
        </Button>
      </ButtonRow>
    </PaginationWrapper>
  );
};

export default Pagination;
