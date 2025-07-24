import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import EmailRow from "./EmailRow";
import FilterBar from "./FilterBar";
import PaginationControls from "./PaginationControls";
import InfoModal from "./InfoModal";
import CompleteCheckModal from "./CheckAllModal";

const Wrapper = styled.div``;

const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  border-bottom: 2px solid #ccc;
`;

const StickyBottomNav = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 100;
  border-top: 2px solid #ccc;
  padding: 10px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0 10px;
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

export const patternMap: Record<number, string> = {
  0: "all",
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

type EmailGuess = {
  profile_id: number;
  full_name: string;
  email_guess_id: number;
  email: string;
  pattern_id: number;
  status: string | null;
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
  const [emailGuesses, setEmailGuesses] = useState<EmailGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckAllModal, setShowCheckAllModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [limit] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const fetchEmailGuesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/profiles-by-exams-domains", {
        domain_ids: [domainId],
        exam_ids: examIds,
        limit,
        offset,
        pattern_id: selectedPattern === "all" ? null : selectedPattern,
        status: selectedStatus === "all" ? null : selectedStatus,
      });
      setEmailGuesses(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setError("");
    } catch {
      setError("Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, [domainId, examIds, limit, offset, selectedPattern, selectedStatus]);

  useEffect(() => {
    if (domainId) {
      fetchEmailGuesses();
    }
  }, [fetchEmailGuesses, domainId]);

  const handlePrev = () => setOffset((prev) => Math.max(0, prev - limit));
  const handleNext = () => setOffset((prev) => prev + limit);

  return (
    <Wrapper>
      {showInfoModal && (
        <InfoModal
          onClose={() => setShowInfoModal(false)}
          domainId={domainId}
          domainName={domainName}
        />
      )}
      {showCheckAllModal && domainName && (
        <CompleteCheckModal
          domainId={domainId}
          domainName={domainName}
          examIds={examIds}
          selectedPattern={selectedPattern}
          isChecking={isChecking}
          patternMap={patternMap}
          onClose={() => setShowCheckAllModal(false)}
          setIsChecking={setIsChecking}
          setOffset={setOffset}
          fetchEmailGuesses={fetchEmailGuesses}
        />
      )}

      {loading && <div>loading</div>}
      {error && <div>error</div>}
      {!loading && !error && (
        <>
          <StickyContainer>
            <CheckAllRow>
              <PrimaryButton
                onClick={() => setShowCheckAllModal(true)}
                disabled={showCheckAllModal || loading}
              >
                {showCheckAllModal
                  ? "showCheckAllModal..."
                  : "Check Email Guesses"}
              </PrimaryButton>
            </CheckAllRow>

            <TitleRow>
              <Title>{`Guessed Emails @ ${domainName}`}</Title>
              <InfoIcon
                onClick={() => setShowInfoModal(true)}
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 9.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z" />
              </InfoIcon>
            </TitleRow>

            <FilterBar
              selectedPattern={selectedPattern}
              setSelectedPattern={setSelectedPattern}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </StickyContainer>

          {emailGuesses.length === 0 ? (
            <div style={{ padding: "10px" }}>No profiles found.</div>
          ) : (
            emailGuesses.map((eg) => (
              <EmailRow key={eg.email_guess_id} guess={eg} />
            ))
          )}

          <StickyBottomNav>
            <PaginationControls
              offset={offset}
              limit={limit}
              totalCount={totalCount}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </StickyBottomNav>
        </>
      )}
    </Wrapper>
  );
};

export default DomainProfiles;
