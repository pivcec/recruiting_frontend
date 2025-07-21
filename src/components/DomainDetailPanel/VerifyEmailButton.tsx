import React, { useState } from "react";
import axios from "axios";

import { PrimaryButton } from "./index";

const VerifyEmailButton = ({ emailGuessId, email, onVerified }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/verify-email", {
        email_guess_id: emailGuessId,
        email: email,
      });

      const result = response.data;
      setStatus(result.status || "done");

      // Notify parent component
      if (onVerified) {
        onVerified(result); // { email_guess_id, email, status }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryButton onClick={handleVerify} disabled={loading}>
      {loading ? "checking..." : status ? status : "check status"}
    </PrimaryButton>
  );
};

export default VerifyEmailButton;
