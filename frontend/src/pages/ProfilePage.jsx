import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const followersCount = 0;
  const followingCount = 0;
  const gymMemberships = [];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/users/${parsedUser.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load profile.");
          return;
        }

        setUserProfile(data);
      } catch (err) {
        console.error(err);
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <button
            className="secondary-button"
            onClick={() => navigate("/home")}
          >
            Back
      </button>
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-pic">
            {userProfile?.profile_picture_url ? "IMG" : "No Photo"}
          </div>

          <div className="profile-info">
            <h1>{userProfile?.name || "No name added"}</h1>
            <p>Age: {userProfile?.age ?? "Not added"}</p>
            <p>Gender: {userProfile?.gender || "Not added"}</p>
            <p>Height: {userProfile?.height ?? "Not added"}</p>
            <p>Weight: {userProfile?.weight ?? "Not added"}</p>
            <p>Email: {userProfile?.email || "Not added"}</p>
          </div>
        </div>

        <div className="profile-section">
          <h2>Social</h2>
          <div className="social-stats">
            <button className="social-box" onClick={() => navigate("/followers")}>
              <span className="social-count">{followersCount}</span>
              <span>Followers</span>
            </button>

            <button className="social-box" onClick={() => navigate("/following")}>
              <span className="social-count">{followingCount}</span>
              <span>Following</span>
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h2>Gym Memberships</h2>
          {gymMemberships.length > 0 ? (
            gymMemberships.map((gym) => (
              <div key={gym.id} className="gym-membership">
                <span>{gym.gymName}</span>
                <span>{gym.dateJoined}</span>
              </div>
            ))
          ) : (
            <button className="join-gym-button" onClick={() => navigate("/gym")}>
              Join a Gym
            </button>
          )}
        </div>

        <div className="profile-actions">
          <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
          <button>Privacy Settings</button>
          <button>App Settings</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;