import React, { useState, useCallback, useRef, useEffect } from "react";
import { PrimaryButton } from "./index";
import axios from "axios";
import styled from "styled-components";
import { statusInfo } from "./index";

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
  max-width: 600px;
  width: 100%;
  font-size: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
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

const PatternSection = styled.div`
  margin-bottom: 20px;
`;

const PatternHeader = styled.h4`
  margin-bottom: 10px;
  text-transform: uppercase;
  font-size: 15px;
`;

const ColoredStat = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
  color: white;
  font-weight: bold;
`;

const CenteredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const Select = styled.select`
  margin-left: 0.5rem;
  margin-right: 0.5rem;
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

interface CheckAllModalProps {
  domainId: number;
  domainName: string;
  examIds: number[];
  selectedPattern: number | "all";
  isChecking: boolean;
  patternMap: Record<number, string>;
  onClose: () => void;
  setIsChecking: React.Dispatch<React.SetStateAction<boolean>>;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  fetchEmailGuesses: () => void;
}

const CheckAllModal: React.FC<CheckAllModalProps> = ({
  domainId,
  domainName,
  examIds,
  selectedPattern,
  isChecking,
  patternMap,
  onClose,
  setIsChecking,
  setOffset,
  fetchEmailGuesses,
}) => {
  const [completeCheckData, setCompleteCheckData] = useState<any>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const [patternToCheck, setPatternToCheck] = useState<number | "all">(
    selectedPattern
  );

  const pollBatchStatus = useCallback(
    (batchToPoll: string) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const { data } = await axios.get(
            `/api/verify-email-batch-status/${batchToPoll}`
          );

          if (data.status === "completed" || data.status === "finished") {
            clearInterval(pollingIntervalRef.current!);
            setOffset(0);
            fetchEmailGuesses();
            setCompleteCheckData(data.counts_by_pattern);
            setIsChecking(false);
          }
        } catch (err) {
          console.error("Failed to poll batch status", err);
          clearInterval(pollingIntervalRef.current!);
          setIsChecking(false);
        }
      }, 3000);
    },
    [fetchEmailGuesses, setIsChecking, setOffset]
  );

  const handleCheckAll = async () => {
    try {
      setIsChecking(true);
      const response = await axios.post("/api/verify-email-batch", {
        domain_id: domainId,
        exam_ids: examIds,
        pattern_id: patternToCheck === "all" ? null : patternToCheck,
      });

      const returnedBatchId = response.data.batch_id;
      if (!returnedBatchId) throw new Error("No batch_id returned");

      pollBatchStatus(returnedBatchId);
    } catch (err) {
      console.error("Batch verification failed", err);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleOverlayClick = () => {
    if (!isChecking) onClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {!isChecking && (
          <CloseButton onClick={handleOverlayClick} aria-label="Close modal">
            ×
          </CloseButton>
        )}

        {!completeCheckData && (
          <CenteredWrapper>
            <p>
              Check 1000 email guesses for <strong>{domainName}</strong> with
              pattern
              <Select
                value={patternToCheck}
                onChange={(e) =>
                  setPatternToCheck(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
              >
                <option value="all">All</option>
                {Object.entries(patternMap).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </Select>
            </p>

            <PrimaryButton onClick={handleCheckAll} disabled={isChecking}>
              {isChecking ? "Checking..." : "Check Now!"}
            </PrimaryButton>
          </CenteredWrapper>
        )}

        {Object.entries(completeCheckData || {}).map(
          ([pattern, stats]: any) => {
            const total = (Object.values(stats) as number[]).reduce(
              (sum, val) => sum + val,
              0
            );
            if (total === 0) return null;

            return (
              <PatternSection key={pattern}>
                <PatternHeader>{pattern}</PatternHeader>
                {statusKeys.map((status) => {
                  const count = stats[status];
                  if (!count) return null;
                  const info = statusInfo[status] || {
                    color: "#888",
                    label: status,
                  };
                  return (
                    <ColoredStat key={status} bgColor={info.color}>
                      {info.label}: {count}
                    </ColoredStat>
                  );
                })}
              </PatternSection>
            );
          }
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default CheckAllModal;
