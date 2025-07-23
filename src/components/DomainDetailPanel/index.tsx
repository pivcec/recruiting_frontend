import React, { useEffect, useState, useCallback, useRef } from "react";
import VerifyEmailButton from "./VerifyEmailButton";
import styled from "styled-components";
import axios from "axios";
import Modal from "./Modal";

const Wrapper = styled.div``;

const Pagination = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const PaginationLabel = styled.div`
  font-size: 13px;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr 3fr;
  border-bottom: 1px solid #eee;
  align-items: center;
  font-size: 12px;
  padding: 0 10px;
`;

const HeaderRow = styled(Row)`
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  font-weight: bold;
  padding: 0 10px 10px 10px;
`;

const Select = styled.select`
  padding: 4px 6px;
  font-size: 11px;
  max-width: 140px;
`;

const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  border-bottom: 2px solid #ccc;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: bold;
  padding-top: 10px;
  margin-bottom: 0.5rem;
`;

const CheckAllRow = styled.div`
  padding-top: 10px;
  text-align: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0 10px;
`;

export const PrimaryButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CellLabel = styled.div`
  margin-bottom: 25px;
`;

const EmailStatus = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  color: #fff;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
`;

const StickyBottomNav = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 100;
  border-top: 2px solid #ccc;
  padding: 10px;
`;

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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

const InfoIcon = styled.svg`
  width: 16px;
  height: 16px;
  margin-left: 8px;
  cursor: pointer;
  fill: #007bff;

  &:hover {
    fill: #0056b3;
  }
`;

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

export const statusInfo: Record<string, { label: string; color: string }> = {
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

interface DomainProfilesProps {
  domainName: string | null;
  domainId: number;
  examIds: number[];
}

const DomainProfiles: React.FC<DomainProfilesProps> = ({
  domainName,
  domainId,
  examIds,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [limit] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/profiles-by-exams-domains", {
        domain_ids: [domainId],
        exam_ids: examIds,
        limit,
        offset,
        pattern_id: selectedPattern,
        status: selectedStatus === "all" ? null : selectedStatus,
      });
      setProfiles(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setError("");
    } catch {
      setError("Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, [domainId, examIds, limit, offset, selectedPattern, selectedStatus]);

  const pollBatchStatus = useCallback(
    (batchToPoll: string) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const { data } = await axios.get(
            `/api/verify-email-batch-status/${batchToPoll}`
          );

          if (data.status === "completed" || data.status === "finished") {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            setVerifying(false);
            setOffset(0);
            fetchProfiles();
          }
        } catch (err) {
          console.error("Failed to poll batch status", err);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setVerifying(false);
        }
      }, 3000);
    },
    [fetchProfiles]
  );

  const handleCheckAll = async () => {
    try {
      setVerifying(true);
      const response = await axios.post("/api/verify-email-batch", {
        domain_id: domainId,
        exam_ids: examIds,
        pattern_id: selectedPattern,
      });

      const returnedBatchId = response.data.batch_id;
      if (!returnedBatchId) throw new Error("No batch_id returned");

      pollBatchStatus(returnedBatchId);
    } catch (err) {
      console.error("Batch verification failed", err);
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (domainId) {
      fetchProfiles();
    }
  }, [fetchProfiles, domainId]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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

  const handlePrev = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handleNext = () => {
    setOffset((prev) => prev + limit);
  };

  if (loading) return <Wrapper>Loading...</Wrapper>;
  if (error) return <Wrapper>{error}</Wrapper>;

  return (
    <Wrapper>
      {showInfoModal && (
        <Modal onClose={() => setShowInfoModal(false)} domainId={domainId} />
      )}

      <StickyContainer>
        <CheckAllRow>
          <PrimaryButton
            onClick={handleCheckAll}
            disabled={verifying || loading}
          >
            {verifying ? "Verifying..." : "Check 1000"}
          </PrimaryButton>
        </CheckAllRow>
        <TitleRow>
          <Title>{`Guessed Emails @ ${domainName}`}</Title>
          <InfoIcon onClick={() => setShowInfoModal(true)} viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 9.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z" />
          </InfoIcon>
        </TitleRow>

        <HeaderRow>
          <CellLabel>Full Name</CellLabel>
          <div>
            <label style={{ display: "block" }}>Pattern</label>
            <Select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(parseInt(e.target.value))}
            >
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
      </StickyContainer>

      {profiles.length === 0 ? (
        <Row>
          <div>No profiles found.</div>
        </Row>
      ) : (
        profiles.map((p) =>
          p.email_guesses.map((eg, index) => (
            <Row key={`${p.id}-${eg.id}`}>
              {index === 0 ? <div>{toTitleCase(p.full_name)}</div> : <div />}
              <div>{eg.email}</div>
              <EmailStatus
                bgColor={statusInfo[eg.status || ""]?.color || "#fff"}
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
              </EmailStatus>
            </Row>
          ))
        )
      )}

      <StickyBottomNav>
        <Pagination>
          <Button onClick={handlePrev} disabled={offset === 0}>
            Previous
          </Button>
          <PaginationLabel>
            Showing {offset + 1} - {Math.min(offset + limit, totalCount)} of{" "}
            {totalCount}
          </PaginationLabel>
          <Button onClick={handleNext} disabled={offset + limit >= totalCount}>
            Next
          </Button>
        </Pagination>
      </StickyBottomNav>
    </Wrapper>
  );
};

export default DomainProfiles;
