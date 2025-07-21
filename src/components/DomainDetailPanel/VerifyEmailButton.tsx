import React, { useState } from "react";
import axios from "axios";

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
    <button
      onClick={handleVerify}
      disabled={loading}
      style={{
        marginLeft: "0.5rem",
        fontSize: "0.75rem",
        padding: "2px 6px",
        cursor: "pointer",
      }}
    >
      {loading ? "checking..." : status ? status : "check status"}
    </button>
  );
};

export default VerifyEmailButton;
