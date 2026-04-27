import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function GymDetailPage() {
  const { gymId } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/gyms/${gymId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load gym.");
          return;
        }

        setGym(data);
      } catch (err) {
        setError("Could not load gym.");
      }
    };

    fetchGym();
  }, [gymId]);

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="login-error">{error}</p>
          <button onClick={() => navigate("/gym")}>Back to Gyms</button>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Loading gym...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button onClick={() => navigate("/gym")}>Back to Gyms</button>

        <h1>{gym.name}</h1>

        <p><strong>Owner:</strong> {gym.owner || "Not listed"}</p>
        <p><strong>Phone:</strong> {gym.phone_number || "Not listed"}</p>
        <p><strong>Location:</strong> {gym.location || "Not listed"}</p>

        <p>{gym.description || "No description added"}</p>

        <p><strong>Total members:</strong> {gym.total_members}</p>
      
        <div className="profile-section">
          <h2>Gym Leaderboard</h2>
          <p>Coming later</p>
        </div>

        <div className="profile-section">
          <h2>Machine / Exercise Leaderboard</h2>
          <p>Coming later</p>
        </div>

        <div className="profile-section">
          <h2>Start Session</h2>
          <button onClick={() => navigate("/workout")}>Start Workout</button>
        </div>
      </div>
    </div>
  );
}

export default GymDetailPage;