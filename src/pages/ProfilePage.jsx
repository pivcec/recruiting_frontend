import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileTable from "../components/ProfileTable";

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

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div>
      <h2>Profile ID: {id}</h2>
      {/* Render profile info here, e.g.: */}
      <ProfileTable
        data={JSON.parse(profile.data.hits.hits[0]._source.content)}
      />
    </div>
  );
};

export default ProfilePage;
