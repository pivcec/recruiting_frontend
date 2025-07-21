// components/GenerateGuessesButton.tsx
import React, { useState } from "react";
import axios from "axios";

type Props = {
  profileId: number;
  onComplete: () => void;
};

const GenerateGuessesButton: React.FC<Props> = ({ profileId, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/generate-email-guesses", {
        profile_id: profileId,
      });
      onComplete(); // Trigger parent update
    } catch (err) {
      setError("Failed to generate guesses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Generating..." : "Generate Email Guesses"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </>
  );
};

export default GenerateGuessesButton;
