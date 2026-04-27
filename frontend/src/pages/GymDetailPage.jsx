import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function GymDetailPage() {
  const { gymId } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [error, setError] = useState("");
  const [leaderboards, setLeaderboards] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState("");

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

    const fetchLeaderboards = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/gyms/${gymId}/leaderboards`,
        );

        const data = await response.json();

        if (!response.ok) {
          setLeaderboardError(data.message || "Could not load leaderboards.");
          return;
        }

        setLeaderboards(data);
      } catch (err) {
        setLeaderboardError("Could not load leaderboards.");
      }
    };

    fetchLeaderboards();
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

        <p>
          <strong>Owner:</strong> {gym.owner || "Not listed"}
        </p>
        <p>
          <strong>Phone:</strong> {gym.phone_number || "Not listed"}
        </p>
        <p>
          <strong>Location:</strong> {gym.location || "Not listed"}
        </p>

        <p>{gym.description || "No description added"}</p>

        <p>
          <strong>Total members:</strong> {gym.total_members}
        </p>

        <div className="profile-section">
          <h2>Gym Leaderboards</h2>

          {leaderboardError && (
            <p className="login-error">{leaderboardError}</p>
          )}

          {!leaderboards ? (
            <p>Loading leaderboards...</p>
          ) : (
            <>
              <h3>Most Workouts Completed</h3>
              {leaderboards.gym_leaderboards.most_workouts.length === 0 ? (
                <p>No workouts logged at this gym yet.</p>
              ) : (
                leaderboards.gym_leaderboards.most_workouts.map(
                  (row, index) => (
                    <p key={row.user_id}>
                      #{index + 1} {row.name} — {row.workout_days} days
                    </p>
                  ),
                )
              )}

              <h3>Longest Day Streak</h3>
              {leaderboards.gym_leaderboards.longest_streak.length === 0 ? (
                <p>No streaks yet.</p>
              ) : (
                leaderboards.gym_leaderboards.longest_streak.map(
                  (row, index) => (
                    <p key={row.user_id}>
                      #{index + 1} {row.name} — {row.streak} days
                    </p>
                  ),
                )
              )}

              <h3>Total Weight Lifted</h3>
              {leaderboards.gym_leaderboards.total_weight.length === 0 ? (
                <p>No lifting volume yet.</p>
              ) : (
                leaderboards.gym_leaderboards.total_weight.map((row, index) => (
                  <p key={row.user_id}>
                    #{index + 1} {row.name} —{" "}
                    {Number(row.total_weight || 0).toLocaleString()} lbs
                  </p>
                ))
              )}
            </>
          )}
        </div>

        <div className="profile-section">
          <h2>Machine / Exercise Leaderboards</h2>

          {!leaderboards ? (
            <p>Loading exercise leaderboards...</p>
          ) : (
            <>
              <h3>Total Weight by Lift</h3>

              {leaderboards.exercise_leaderboards.total_volume.length === 0 ? (
                <p>No Bench Press, Squat, or Deadlift volume yet.</p>
              ) : (
                leaderboards.exercise_leaderboards.total_volume.map(
                  (row, index) => (
                    <p key={`${row.name}-${row.user_id}`}>
                      #{index + 1} {row.name}: {row.user_name} —{" "}
                      {Number(row.total_weight || 0).toLocaleString()} lbs
                    </p>
                  ),
                )
              )}

              <h3>Max Lifts by Weight Class</h3>

              {Object.entries(leaderboards.exercise_leaderboards.max_lifts).map(
                ([exerciseName, weightClasses]) => (
                  <div key={exerciseName}>
                    <h4>{exerciseName}</h4>

                    {Object.entries(weightClasses).map(
                      ([weightClass, rows]) => (
                        <div key={`${exerciseName}-${weightClass}`}>
                          <strong>{weightClass} lbs</strong>

                          {rows.map((row, index) => (
                            <p
                              key={`${exerciseName}-${weightClass}-${row.user_id}`}
                            >
                              #{index + 1} {row.name} — {row.max_lift} lbs
                            </p>
                          ))}
                        </div>
                      ),
                    )}
                  </div>
                ),
              )}
            </>
          )}
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
