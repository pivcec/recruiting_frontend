// components/DomainProfiles.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const Wrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const Th = styled.th`
  border: 1px solid #ccc;
  padding: 8px;
  background-color: #f9f9f9;
  text-align: left;
`;

const Td = styled.td<{ isBorderless?: boolean }>`
  border: ${(props) => (props.isBorderless ? "none" : "1px solid #eee")};
  padding: 8px;
`;

const patternMap: Record<number, string> = {
  1: "first.last",
  2: "firstlast",
  3: "f.last",
  4: "firstl",
  5: "flast",
  6: "last.first",
  7: "lastfirst",
  8: "lastf",
  9: "f_last",
  10: "first_l",
  11: "first",
  12: "last",
  13: "first-middle-last",
  14: "fml",
  15: "first-middlelast",
  16: "first-last",
  17: "last-first",
  18: "fmlast",
};

type EmailGuess = {
  email: string;
  pattern_id: number;
  is_verified: boolean;
};

type Profile = {
  id: number;
  full_name: string;
  email_guesses: EmailGuess[];
};

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const DomainProfiles: React.FC = () => {
  const { domainId, examIds } = useParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!domainId || !examIds) return;

    const domain_ids = [parseInt(domainId)];
    const exam_ids = examIds.split("-").map((id) => parseInt(id));

    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await axios.post("/api/profiles-by-exams-domains", {
          domain_ids,
          exam_ids,
        });
        setProfiles(response.data.results || []);
      } catch (err) {
        setError("Failed to load profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [domainId, examIds]);

  if (loading) return <Wrapper>Loading...</Wrapper>;
  if (error) return <Wrapper>{error}</Wrapper>;

  return (
    <Wrapper>
      <Title>Profiles for Domain {domainId}</Title>
      {profiles.length === 0 ? (
        <p>No profiles found.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Full Name</Th>
              <Th>Email</Th>
              <Th>Pattern</Th>
              <Th>Verified</Th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              if (!p.email_guesses || p.email_guesses.length === 0) {
                return (
                  <tr key={p.id}>
                    <Td>{toTitleCase(p.full_name)}</Td>
                    <Td colSpan={3} style={{ fontStyle: "italic" }}>
                      No email guesses
                    </Td>
                  </tr>
                );
              }

              return p.email_guesses.map((eg, index) => (
                <tr key={`${p.id}-${index}`}>
                  {index === 0 ? (
                    <Td rowSpan={p.email_guesses.length}>
                      {toTitleCase(p.full_name)}
                    </Td>
                  ) : null}
                  <Td>{eg.email}</Td>
                  <Td>{patternMap[eg.pattern_id]}</Td>
                  <Td>{eg.is_verified ? "Yes" : "No"}</Td>
                </tr>
              ));
            })}
          </tbody>
        </Table>
      )}
    </Wrapper>
  );
};

export default DomainProfiles;
