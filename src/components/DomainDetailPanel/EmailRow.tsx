import React from "react";
import styled from "styled-components";
import { statusInfo } from "./index";

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr 3fr;
  border-bottom: 1px solid #eee;
  align-items: center;
  font-size: 12px;
  padding: 0 10px;
`;

const EmailStatus = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  color: #fff;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
`;

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

type EmailGuess = {
  full_name: string;
  email: string;
  status: string | null;
  email_guess_id: number;
};

const EmailRow: React.FC<{ guess: EmailGuess }> = ({ guess }) => {
  const status = guess.status;
  const info = statusInfo[status || ""];

  return (
    <Row key={guess.email_guess_id}>
      <div>{toTitleCase(guess.full_name)}</div>
      <div>{guess.email}</div>
      <EmailStatus bgColor={info?.color || "#fff"}>
        {status ? (
          info?.label || status
        ) : (
          <span style={{ color: "#000" }}>not checked</span>
        )}
      </EmailStatus>
    </Row>
  );
};

export default EmailRow;
