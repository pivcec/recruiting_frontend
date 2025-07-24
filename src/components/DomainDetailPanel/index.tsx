import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import EmailRow from "./EmailRow";
import FilterBar from "./FilterBar";
import PaginationControls from "./PaginationControls";
import InfoModal from "./InfoModal";
import CompleteCheckModal from "./CheckAllModal";
import PatternTable from "./PatternTable";

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

export const statusInfo: Record<string, { label: string; color: string }> = {
  total_verified: { label: "Checked Guesses", color: "#ffffff" },
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

interface PatternStat {
  pattern_id: number | "all";
  pattern_name: string;
  total_emails: number;
  total_verified: number;
  ok_count: number;
  email_disabled_count: number;
  dead_server_count: number;
  invalid_mx_count: number;
  disposable_count: number;
  spamtrap_count: number;
  ok_for_all_count: number;
  smtp_protocol_count: number;
  antispam_system_count: number;
  unknown_count: number;
  invalid_syntax_count: number;
}

interface DomainStatsResponse {
  domain_id: number;
  pattern_stats: PatternStat[];
}

interface DomainDetailsPanelProps {
  domainName: string | null;
  domainId: number;
  examIds: number[];
  updateFirmsDomains: () => Promise<void>;
}

const DomainDetailsPanel: React.FC<DomainDetailsPanelProps> = ({
  domainName,
  domainId,
  examIds,
  updateFirmsDomains,
}) => {
  const [stats, setStats] = useState<DomainStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckAllModal, setShowCheckAllModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/domain-email-stats/${domainId}`);
      if (!response.ok) {
        throw new Error(`Error fetching stats: ${response.statusText}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [domainId]);

  return (
    <Wrapper>
      {showCheckAllModal && domainName && (
        <CompleteCheckModal
          domainId={domainId}
          domainName={domainName}
          examIds={examIds}
          isChecking={isChecking}
          onClose={() => setShowCheckAllModal(false)}
          setIsChecking={setIsChecking}
          fetchStats={fetchStats}
          updateFirmsDomains={updateFirmsDomains}
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
            </TitleRow>
          </StickyContainer>

          {stats && <PatternTable stats={stats.pattern_stats} />}
        </>
      )}
    </Wrapper>
  );
};

export default DomainDetailsPanel;
