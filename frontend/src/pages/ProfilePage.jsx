import { useNavigate } from "react-router-dom";

function ProfilePage({ profile }) {
  const navigate = useNavigate();

  const followersCount = 0;
  const followingCount = 0;
  const gymMemberships = [];

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-pic">
            {profile?.profilePicture ? "IMG" : "No Photo"}
          </div>

          <div className="profile-info">
            <h1>{profile?.name || "No name added"}</h1>
            <p>Age: {profile?.age || "Not added"}</p>
            <p>Gender: {profile?.gender || "Not added"}</p>
            <p>Height: {profile?.height || "Not added"}</p>
            <p>Weight: {profile?.weight || "Not added"}</p>
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