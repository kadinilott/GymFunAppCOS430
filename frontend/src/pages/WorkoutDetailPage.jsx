import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/workouts/${workoutId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load workout.");
          return;
        }

        setWorkout(data);
      } catch (err) {
        setError("Could not load workout.");
      }
    };

    fetchWorkout();
  }, [workoutId]);

  if (error) {
    return (
      <div className="workout-page">
        <div className="workout-shell">
          <p className="login-error">{error}</p>
          <button
            className="secondary-button"
            onClick={() => navigate("/my-workouts")}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="workout-page">
        <div className="workout-shell">
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-page">
      <div className="workout-shell">
        <div className="workout-header-row">
          <div>
            <h1 className="workout-title">{workout.title}</h1>
            <p className="workout-subtitle">
              {workout.completed_at
                ? `Completed ${new Date(workout.completed_at).toLocaleString()}`
                : "Workout design"}
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/my-workouts")}
          >
            Back
          </button>
        </div>

        <div className="workout-main-card">
          <h2>Exercises</h2>

          {workout.exercises.length === 0 ? (
            <p>No exercises found.</p>
          ) : (
            workout.exercises.map((exercise) => (
              <div
                key={exercise.workout_exercise_id}
                className="active-exercise-card"
              >
                <h3>{exercise.name}</h3>
                <p>{exercise.muscle_group}</p>

                {exercise.all_sets && exercise.all_sets.length > 0 ? (
                  <>
                    <div className="sets-grid sets-grid-header">
                      <span>Set</span>
                      <span>Reps</span>
                      <span>Weight</span>
                      <span>Duration</span>
                    </div>

                    {exercise.all_sets.map((set) => (
                      <div key={set.workout_set_id} className="sets-grid">
                        <span>{set.set_number}</span>
                        <span>{set.reps || "-"}</span>
                        <span>{set.weight || "-"}</span>
                        <span>{set.duration_seconds || "-"}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>
                    {exercise.sets} sets · {exercise.reps ?? "-"} reps ·{" "}
                    {exercise.weight ?? "-"} weight
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetailPage;
