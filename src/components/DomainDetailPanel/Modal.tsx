import React, { useEffect, useState } from "react";
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

interface InfoModalProps {
  onClose: () => void;
  domainId: number;
}

interface EmailStats {
  domain_id: number;
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

const InfoModal: React.FC<InfoModalProps> = ({ onClose, domainId }) => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h3>Verified Email Stats</h3>

        {loading && <p>Loading stats...</p>}

        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {stats && (
          <>
            <ul>
              <li>{`Total Verified: ${stats?.total_verified}`}</li>
              <li>{`OK: ${stats?.ok_count}`}</li>
              <li>{`Email Disabled: ${stats?.email_disabled_count}`}</li>
              <li>{`Dead Server: ${stats.dead_server_count}`}</li>
              <li>{`Invalid MX: ${stats.invalid_mx_count}`}</li>
              <li>{`Disposable: ${stats.disposable_count}`}</li>
              <li>{`Spamtrap: ${stats.spamtrap_count}`}</li>
              <li>{`Ok for All: ${stats.ok_for_all_count}`}</li>
              <li>{`Protocol: ${stats.smtp_protocol_count}`}</li>
              <li>{`Antispam System: ${stats.antispam_system_count}`}</li>
              <li>{`Unknown: ${stats.unknown_count}`}</li>
              <li>{`Invalid Syntax: ${stats.invalid_syntax_count}`}</li>
            </ul>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default InfoModal;
