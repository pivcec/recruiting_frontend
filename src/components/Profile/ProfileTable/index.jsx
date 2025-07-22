import React from "react";
import styled from "styled-components";

// Styled components for tables and other elements
const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db; /* gray-300 */
`;

const Thead = styled.thead`
  background-color: #f3f4f6; /* gray-100 */
`;

const Th = styled.th`
  border: 1px solid #d1d5db; /* gray-300 */
  padding: 0.25rem 0.5rem;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  border: 1px solid #d1d5db; /* gray-300 */
  padding: 0.25rem 0.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
`;

const List = styled.ul`
  list-style-type: disc;
  padding-left: 1.25rem; /* list-inside */
  margin: 0;
`;

const ListItem = styled.li`
  margin-left: 0.25rem;
`;

const Emphasis = styled.em`
  font-style: italic;
  color: #6b7280; /* gray-500 */
`;

const FontSemiboldTd = styled(Td)`
  font-weight: 600;
`;

const SpaceY = styled.div`
  > * + * {
    margin-top: 1.5rem;
  }
`;

// Recursive rendering function
const renderValue = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return <Emphasis>None</Emphasis>;

    if (typeof value[0] === "object" && value[0] !== null) {
      // Array of objects → sub-table
      const allKeys = Array.from(
        new Set(value.flatMap((item) => Object.keys(item || {})))
      );

      return (
        <Table>
          <Thead>
            <tr>
              {allKeys.map((key) => (
                <Th key={key}>{key}</Th>
              ))}
            </tr>
          </Thead>
          <tbody>
            {value.map((item, idx) => (
              <tr key={idx}>
                {allKeys.map((key) => (
                  <Td key={key}>{renderValue(item?.[key])}</Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      );
    } else {
      // Array of primitives
      return (
        <List>
          {value.map((v, idx) => (
            <ListItem key={idx}>{v}</ListItem>
          ))}
        </List>
      );
    }
  } else if (typeof value === "object" && value !== null) {
    // Nested object → recursive table
    return (
      <Table>
        <tbody>
          {Object.entries(value).map(([key, val]) => (
            <tr key={key}>
              <FontSemiboldTd>{key}</FontSemiboldTd>
              <Td>{renderValue(val)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  } else {
    return value || <Emphasis>N/A</Emphasis>;
  }
};

const ProfileTable = ({ data }) => {
  if (!data || typeof data !== "object") {
    return <div>No valid data to display.</div>;
  }

  return (
    <SpaceY>
      {Object.entries(data).map(([sectionKey, sectionValue]) => (
        <Section key={sectionKey}>
          <SectionTitle>{sectionKey.replace(/([A-Z])/g, " $1")}</SectionTitle>
          <div>{renderValue(sectionValue)}</div>
        </Section>
      ))}
    </SpaceY>
  );
};

export default ProfileTable;
