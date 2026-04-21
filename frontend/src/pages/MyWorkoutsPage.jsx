import { useNavigate } from "react-router-dom";

const designedWorkouts = [
  {
    id: 1,
    name: "Push Day",
    description: "Chest, shoulders, and triceps focus.",
    exerciseCount: 6,
  },
  {
    id: 2,
    name: "Pull Day",
    description: "Back and biceps focus.",
    exerciseCount: 5,
  },
  {
    id: 3,
    name: "Leg Day",
    description: "Heavy lower body training session.",
    exerciseCount: 7,
  },
];

const recentWorkouts = [
  {
    id: 101,
    name: "Upper Body",
    location: "Iron Forge Fitness",
    date: "April 18, 2026",
  },
  {
    id: 102,
    name: "Leg Day",
    location: "Northside Barbell Club",
    date: "April 16, 2026",
  },
  {
    id: 103,
    name: "Back and Core",
    location: "Home Workout",
    date: "April 14, 2026",
  },
];

function MyWorkoutsPage() {
  const navigate = useNavigate();

  return (
    <div className="workout-page">
      <div className="workout-shell">
        <div className="workout-header-row">
          <div>
            <h1 className="workout-title">My Workouts</h1>
            <p className="workout-subtitle">Designed workouts and recent sessions</p>
          </div>
          <button className="secondary-button" onClick={() => navigate("/workout")}>
            Back
          </button>
        </div>

        <div className="workout-main-card workout-section-spacing">
          <h2>Designed Workouts</h2>
          <div className="template-list">
            {designedWorkouts.map((workout) => (
              <div key={workout.id} className="template-card static-card">
                <strong>{workout.name}</strong>
                <span>{workout.description}</span>
                <p>{workout.exerciseCount} exercises</p>
              </div>
            ))}
          </div>
        </div>

        <div className="workout-main-card workout-section-spacing">
          <h2>Recent Workout History</h2>
          <div className="selected-exercise-list">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="exercise-library-item">
                <div>
                  <strong>{workout.name}</strong>
                  <p>{workout.location}</p>
                </div>
                <span className="history-date">{workout.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyWorkoutsPage;
