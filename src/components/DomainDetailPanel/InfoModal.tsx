import React, { useEffect, useState } from "react";
import { statusInfo, patternMap } from "./index";
import Tabs from "./Tabs";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  font-size: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 16px;
  position: absolute;
  top: 12px;
  right: 16px;
  cursor: pointer;
`;

const ColoredStat = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
  color: white;
  font-weight: bold;
`;

const statusKeys = [
  "ok",
  "email_disabled",
  "dead_server",
  "invalid_mx",
  "disposable",
  "spamtrap",
  "ok_for_all",
  "smtp_protocol",
  "antispam_system",
  "unknown",
  "invalid_syntax",
];

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

interface InfoModalProps {
  onClose: () => void;
  domainId: number;
  domainName: string;
}

const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString();
};

const InfoModal: React.FC<InfoModalProps> = ({
  onClose,
  domainId,
  domainName,
}) => {
  const [stats, setStats] = useState<DomainStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

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

    fetchStats();
  }, [domainId]);

  const patternStats = stats?.pattern_stats[activeTab];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        {loading && !patternStats && <div>Loading...</div>}
        {!loading && patternStats && (
          <>
            <Tabs
              patternMap={patternMap}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <h3>{`${formatNumberWithCommas(
              patternStats.total_verified
            )} checked out of ${formatNumberWithCommas(
              patternStats.total_emails
            )} total guesses for ${domainName}`}</h3>

            <div>
              {statusKeys.map((key) => {
                const countKey = `${key}_count`;
                const count = patternStats[countKey];
                const info = statusInfo[key];
                if (!info) return null;

                return (
                  <ColoredStat key={key} bgColor={info.color}>
                    {`${info.label}: ${formatNumberWithCommas(count)}`}
                  </ColoredStat>
                );
              })}
            </div>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default InfoModal;
