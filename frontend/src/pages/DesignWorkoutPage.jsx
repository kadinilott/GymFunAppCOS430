import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const exerciseLibrary = [
  { id: 1, name: "Bench Press", category: "Chest", isCustom: false },
  { id: 2, name: "Incline Dumbbell Press", category: "Chest", isCustom: false },
  { id: 3, name: "Cable Fly", category: "Chest", isCustom: false },
  { id: 4, name: "Shoulder Press", category: "Shoulders", isCustom: false },
  { id: 5, name: "Lateral Raise", category: "Shoulders", isCustom: false },
  { id: 6, name: "Tricep Pushdown", category: "Arms", isCustom: false },
  { id: 7, name: "Barbell Curl", category: "Arms", isCustom: false },
  { id: 8, name: "Back Squat", category: "Legs", isCustom: false },
  { id: 9, name: "Romanian Deadlift", category: "Legs", isCustom: false },
  { id: 10, name: "Leg Press", category: "Legs", isCustom: false },
  { id: 11, name: "Lat Pulldown", category: "Back", isCustom: false },
  { id: 12, name: "Barbell Row", category: "Back", isCustom: false },
  { id: 13, name: "Deadlift", category: "Back", isCustom: false },
  { id: 14, name: "Plank", category: "Core", isCustom: false },
];

const categoryOptions = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
  "Other",
];

function DesignWorkoutPage() {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customCategory, setCustomCategory] = useState("Other");

  const allExercises = useMemo(() => {
    return [...exerciseLibrary, ...customExercises];
  }, [customExercises]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allExercises, searchTerm]);

  const addExercise = (exercise) => {
    if (selectedExercises.some((item) => item.id === exercise.id)) return;
    setSelectedExercises((prev) => [...prev, exercise]);
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
  };

  const handleAddCustomExercise = () => {
    const trimmedName = customExerciseName.trim();

    if (!trimmedName) {
      window.alert("Please enter a name for your custom exercise.");
      return;
    }

    const alreadyExists = allExercises.some(
      (exercise) => exercise.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      window.alert("That exercise already exists in your library.");
      return;
    }

    const newExercise = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      category: customCategory,
      isCustom: true,
    };

    setCustomExercises((prev) => [newExercise, ...prev]);
    setSelectedExercises((prev) => [...prev, newExercise]);
    setCustomExerciseName("");
    setCustomCategory("Other");
    setSearchTerm("");
  };

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) {
      window.alert("Please enter a workout name.");
      return;
    }

    window.alert("Workout design saved. You can connect this to your database later.");
    navigate("/workout");
  };

  return (
    <div className="workout-page">
      <div className="workout-shell">
        <div className="workout-header-row">
          <div>
            <h1 className="workout-title">Design Workout</h1>
            <p className="workout-subtitle">Build a reusable workout template</p>
          </div>
          <button className="secondary-button" onClick={() => navigate("/workout")}>
            Back
          </button>
        </div>

        <div className="workout-active-layout">
          <div className="workout-main-card">
            <h2>Workout Details</h2>
            <div className="form-block">
              <label>Workout name</label>
              <input
                className="workout-input"
                type="text"
                placeholder="Example: Upper Body Strength"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            <div className="form-block">
              <label>Notes</label>
              <textarea
                className="workout-textarea"
                placeholder="Optional notes, focus, rest times, or goals"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-block">
              <label>Selected exercises</label>
              {selectedExercises.length > 0 ? (
                <div className="selected-exercise-list">
                  {selectedExercises.map((exercise) => (
                    <div key={exercise.id} className="exercise-library-item">
                      <div>
                        <strong>{exercise.name}</strong>
                        <p>
                          {exercise.category}
                          {exercise.isCustom ? " • Custom" : ""}
                        </p>
                      </div>
                      <button
                        className="text-button danger-text"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <p>No exercises added to this workout yet.</p>
                </div>
              )}
            </div>

            <button className="primary-button start-workout-button" onClick={handleSaveWorkout}>
              Save Workout Design
            </button>
          </div>

          <div className="workout-side-card">
            <h2>Exercise Library</h2>
            <input
              className="workout-input"
              type="text"
              placeholder="Search exercises"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="custom-exercise-card">
              <h3>Add Your Own Exercise</h3>
              <p>Create a custom exercise for this workout design.</p>

              <div className="custom-exercise-form">
                <input
                  className="workout-input"
                  type="text"
                  placeholder="Exercise name"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                />

                <select
                  className="workout-input"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <button className="primary-button" onClick={handleAddCustomExercise}>
                  Add Custom Exercise
                </button>
              </div>
            </div>

            <div className="exercise-library-list">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="exercise-library-item">
                  <div>
                    <strong>{exercise.name}</strong>
                    <p>
                      {exercise.category}
                      {exercise.isCustom ? " • Custom" : ""}
                    </p>
                  </div>
                  <button
                    className="primary-button small-button"
                    onClick={() => addExercise(exercise)}
                  >
                    Add
                  </button>
                </div>
              ))}

              {filteredExercises.length === 0 && (
                <div className="empty-state-card">
                  <p>No exercises match your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignWorkoutPage;
