// components/ManageDomains/styles.ts
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;
`;

export const Sidebar = styled.div`
  width: 300px;
  padding: 1rem;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  background-color: #f9f9f9;
`;

export const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

export const CheckboxWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

export const GroupWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
`;

export const Select = styled.select`
  width: 100%;
  margin-bottom: 1rem;
`;

export const Button = styled.button`
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
