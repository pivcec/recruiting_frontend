import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import ProfileTable from "../components/ProfileTable";

// Styled Components
const Container = styled.div`
  max-width: 800px;
  padding: 2rem;
  font-family: sans-serif;
`;

const Heading = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const Message = styled.div`
  font-size: 1rem;
  margin-top: 2rem;
  color: ${({ error }) => (error ? "#d9534f" : "#333")};
`;

const ProfilePage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:8000/api/profiles-by-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: [id] }),
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data.profiles?.[0] || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <Message>Loading profile...</Message>;
  if (error) return <Message error>{error}</Message>;
  if (!profile) return <Message>No profile found.</Message>;

  return (
    <Container>
      <Heading>Profile ID: {id}</Heading>
      <ProfileTable
        data={JSON.parse(profile.data.hits.hits[0]._source.content)}
      />
    </Container>
  );
};

export default ProfilePage;
