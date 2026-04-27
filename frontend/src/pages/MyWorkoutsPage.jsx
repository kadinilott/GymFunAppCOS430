import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyWorkoutsPage() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);

    const fetchWorkouts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/workouts/user/${user.user_id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load workouts.");
          return;
        }

        setWorkouts(data);
      } catch (err) {
        setError("Could not load workouts.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [navigate]);

  const completedWorkouts = workouts.filter((w) => w.completed_at);
  const workoutTemplates = workouts.filter((w) => !w.completed_at);
  return (
    <div className="workout-page">
      <div className="workout-shell">
        <div className="workout-header-row">
          <div>
            <h1 className="workout-title">My Workouts</h1>
            <p className="workout-subtitle">
              Designed workouts and recent sessions
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/workout")}
          >
            Back
          </button>
        </div>

        <div className="workout-main-card workout-section-spacing">
          <h2>Completed Workouts</h2>

          {loading && <p>Loading workouts...</p>}
          {error && <p className="login-error">{error}</p>}

          {!loading && completedWorkouts.length === 0 && (
            <div className="empty-state-card">
              <p>No completed workouts yet.</p>
            </div>
          )}

          <div className="template-list">
            {completedWorkouts.map((workout) => (
              <div
                key={workout.workout_id}
                className="template-card static-card"
                onClick={() => navigate(`/workouts/${workout.workout_id}`)}
                style={{ cursor: "pointer" }}
              >
                <strong>{workout.title}</strong>
                <p>{workout.exercise_count} exercises</p>
                <p>
                  Completed: {new Date(workout.completed_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px" }}>Workout Templates</h2>

          {!loading && workoutTemplates.length === 0 && (
            <div className="empty-state-card">
              <p>No workout templates saved yet.</p>
              <button
                className="primary-button"
                onClick={() => navigate("/design-workout")}
              >
                Design a Workout
              </button>
            </div>
          )}

          <div className="template-list">
            {workoutTemplates.map((workout) => (
              <div
                key={workout.workout_id}
                className="template-card static-card"
                onClick={() => navigate(`/workouts/${workout.workout_id}`)}
                style={{ cursor: "pointer" }}
              >
                <strong>{workout.title}</strong>
                <p>{workout.exercise_count} exercises</p>
                <p>
                  Created: {new Date(workout.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyWorkoutsPage;
