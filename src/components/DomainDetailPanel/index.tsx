// components/DomainProfiles.tsx
import React, { useEffect, useState } from "react";
import VerifyEmailButton from "./VerifyEmailButton";
import GenerateGuessesButton from "./GenerateGuesses";
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
  19: "first_last",
};

type EmailGuess = {
  id: number;
  email: string;
  pattern_id: number;
  status: string | null;
};

type Profile = {
  id: number;
  full_name: string;
  email_guesses: EmailGuess[];
};

const statusInfo: Record<string, { label: string; color: string }> = {
  ok: { label: "Valid and Deliverable", color: "#28a745" },
  email_disabled: { label: "Email Disabled / Non-Existent", color: "#dc3545" },
  dead_server: { label: "Dead Server / No MX Record", color: "#dc3545" },
  invalid_mx: { label: "Invalid MX Configuration", color: "#dc3545" },
  disposable: { label: "Disposable Email", color: "#ffc107" },
  spamtrap: { label: "Spamtrap (Spam Decoy)", color: "#fd7e14" },
  ok_for_all: { label: "Accept-All Domain", color: "#17a2b8" },
  smtp_protocol: { label: "SMTP Protocol Terminated", color: "#6c757d" },
  antispam_system: { label: "Blocked by Anti-Spam System", color: "#6c757d" },
};

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface DomainProfilesProps {
  domainId: number;
  examIds: number[];
}

const DomainProfiles: React.FC<DomainProfilesProps> = ({
  domainId,
  examIds,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstPatternId = Number(Object.keys(patternMap)[0]);
  const [selectedPattern, setSelectedPattern] =
    useState<number>(firstPatternId);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await axios.post("/api/profiles-by-exams-domains", {
          domain_ids: [domainId],
          exam_ids: examIds,
        });
        setProfiles(response.data.results || []);
      } catch (err) {
        setError("Failed to load profiles.");
      } finally {
        setLoading(false);
      }
    };

    if (domainId && examIds.length) {
      fetchProfiles();
    }
  }, [domainId, examIds]);

  const handleVerified = (
    profileId: number,
    emailGuessId: number,
    status: string
  ) => {
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              email_guesses: profile.email_guesses.map((eg) =>
                eg.id === emailGuessId ? { ...eg, status } : eg
              ),
            }
          : profile
      )
    );
  };

  if (loading) return <Wrapper>Loading...</Wrapper>;
  if (error) return <Wrapper>{error}</Wrapper>;

  return (
    <Wrapper>
      <Title>Guessed Emails Per Domain</Title>

      <label style={{ marginBottom: "1rem", display: "inline-block" }}>
        Filter by pattern:{" "}
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(parseInt(e.target.value))}
        >
          {Object.entries(patternMap).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {profiles.length === 0 ? (
        <p>No profiles found.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Full Name</Th>
              <Th>Email</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const filtered = (p.email_guesses || []).filter(
                (eg) => eg.pattern_id === selectedPattern
              );

              if (filtered.length === 0) {
                return (
                  <tr key={p.id}>
                    <Td>{toTitleCase(p.full_name)}</Td>
                    <Td colSpan={2}>
                      <GenerateGuessesButton
                        profileId={p.id}
                        onComplete={() => window.location.reload()}
                      />
                    </Td>
                  </tr>
                );
              }

              return filtered.map((eg, index) => (
                <tr key={`${p.id}-${index}`}>
                  {index === 0 && (
                    <Td rowSpan={filtered.length}>
                      {toTitleCase(p.full_name)}
                    </Td>
                  )}
                  <Td>{eg.email}</Td>
                  <Td
                    style={{
                      backgroundColor: statusInfo[eg.status || ""]?.color,
                      color: "#fff",
                    }}
                  >
                    {eg.status ? (
                      statusInfo[eg.status]?.label || eg.status
                    ) : (
                      <VerifyEmailButton
                        emailGuessId={eg.id}
                        email={eg.email}
                        onVerified={(res) =>
                          handleVerified(p.id, res.email_guess_id, res.status)
                        }
                      />
                    )}
                  </Td>
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
