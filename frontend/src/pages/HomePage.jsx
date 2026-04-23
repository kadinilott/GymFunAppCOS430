import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="home-page">
      <h1 className="home-title">GymFun</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="home-grid">
        <div className="home-card" onClick={() => navigate("/profile")}>
          Profile
        </div>

        <div className="home-card" onClick={() => navigate("/friends")}>
          Friends
        </div>

        <div className="home-card" onClick={() => navigate("/gym")}>
          Gym
        </div>

        <div className="home-card" onClick={() => navigate("/workout")}>
          Workout
        </div>

        <div className="home-card full" onClick={() => navigate("/ai")}>
          AI Trainer
        </div>
      </div>
    </div>
  );
}

export default HomePage;