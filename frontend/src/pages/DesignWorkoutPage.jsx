import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customCategory, setCustomCategory] = useState("Other");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cameFromCompletedWorkout, setCameFromCompletedWorkout] =
    useState(false);
  const [shouldPostAfterSave, setShouldPostAfterSave] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const draft = sessionStorage.getItem("completedWorkoutDraft");

    if (!draft) return;

    const parsedDraft = JSON.parse(draft);

    setWorkoutName(parsedDraft.title || "");
    setNotes(parsedDraft.notes || "");
    setSelectedExercises(parsedDraft.exercises || []);
    setCameFromCompletedWorkout(true);
    setShouldPostAfterSave(Boolean(parsedDraft.post));

    sessionStorage.removeItem("completedWorkoutDraft");
  }, []);

  const fetchExercises = async () => {
    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/exercises?search=${encodeURIComponent(
          searchTerm,
        )}&user_id=${storedUser.user_id}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load exercises.");
        return;
      }

      setExerciseLibrary(data);
    } catch (err) {
      setError("Could not load exercises.");
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [searchTerm]);

  const filteredExercises = useMemo(() => {
    return exerciseLibrary;
  }, [exerciseLibrary]);

  const addExercise = (exercise) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        local_id: `${exercise.exercise_id}-${Date.now()}`,
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        is_custom: exercise.is_custom,
        sets: [{ reps: "", weight: "", duration_seconds: null }],
        duration_seconds: null,
      },
    ]);
  };

  const removeExercise = (indexToRemove) => {
    setSelectedExercises((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const updateSetValue = (exerciseIndex, setIndex, field, value) => {
    setSelectedExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, i) =>
                i === setIndex ? { ...set, [field]: value } : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const addSetToExercise = (exerciseIndex) => {
    setSelectedExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                { reps: "", weight: "", duration_seconds: null },
              ],
            }
          : exercise,
      ),
    );
  };

  const removeSetFromExercise = (exerciseIndex, setIndex) => {
    setSelectedExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets:
                exercise.sets.length === 1
                  ? exercise.sets
                  : exercise.sets.filter((_, i) => i !== setIndex),
            }
          : exercise,
      ),
    );
  };

  const handleAddCustomExercise = async () => {
    const trimmedName = customExerciseName.trim();

    if (!trimmedName) {
      window.alert("Please enter a name for your custom exercise.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          muscle_group: customCategory,
          user_id: storedUser.user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not create exercise.");
        return;
      }

      const newExercise = {
        local_id: `${data.exercise_id}-${Date.now()}`,
        exercise_id: data.exercise_id,
        name: data.name,
        muscle_group: data.muscle_group,
        is_custom: true,
        sets: [{ reps: "", weight: "", duration_seconds: null }],
        duration_seconds: null,
      };

      setSelectedExercises((prev) => [...prev, newExercise]);
      setCustomExerciseName("");
      setCustomCategory("Other");
      setSearchTerm("");
      fetchExercises();
    } catch (err) {
      setError("Could not create exercise.");
    }
  };

  const handleSaveWorkout = async () => {
    setError("");

    if (!workoutName.trim()) {
      window.alert("Please enter a workout title.");
      return;
    }

    if (selectedExercises.length === 0) {
      window.alert("Please add at least one exercise.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("http://localhost:5000/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: storedUser.user_id,
          title: workoutName.trim(),
          notes,
          completed: cameFromCompletedWorkout,
          post: shouldPostAfterSave,
          exercises: selectedExercises.map((exercise) => ({
            exercise_id: exercise.exercise_id,
            sets: exercise.sets.length,
            reps:
              exercise.sets[0]?.reps === ""
                ? null
                : Number(exercise.sets[0]?.reps),
            weight:
              exercise.sets[0]?.weight === ""
                ? null
                : Number(exercise.sets[0]?.weight),
            all_sets: exercise.sets.map((set) => ({
              reps:
                set.reps === "" || set.reps == null ? null : Number(set.reps),
              weight:
                set.weight === "" || set.weight == null
                  ? null
                  : Number(set.weight),
              duration_seconds:
                set.duration_seconds === "" || set.duration_seconds == null
                  ? null
                  : Number(set.duration_seconds),
            })),
            duration_seconds: exercise.duration_seconds,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not save workout.");
        return;
      }

      if (cameFromCompletedWorkout) {
        window.alert("Completed workout saved.");
      }

      navigate("/my-workouts");
    } catch (err) {
      setError("Could not save workout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="workout-page">
      <div className="workout-shell">
        <div className="workout-header-row">
          <div>
            <h1 className="workout-title">
              {cameFromCompletedWorkout ? "Finish Workout" : "Design Workout"}
            </h1>
            <p className="workout-subtitle">
              {cameFromCompletedWorkout
                ? "Add a title and notes before saving"
                : "Build a reusable workout template"}
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/workout")}
          >
            Back
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="workout-active-layout">
          <div className="workout-main-card">
            <h2>Workout Details</h2>

            <div className="form-block">
              <label>Workout title</label>
              <input
                className="workout-input"
                type="text"
                placeholder="Example: Upper Body Strength"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            <div className="form-block">
              <label>
                {shouldPostAfterSave ? "Post caption / notes" : "Notes"}
              </label>
              <textarea
                className="workout-textarea"
                placeholder="Optional notes, caption, focus, rest times, or goals"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-block">
              <label>Selected exercises</label>

              {selectedExercises.length > 0 ? (
                <div className="selected-exercise-list">
                  {selectedExercises.map((exercise, index) => (
                    <div
                      key={
                        exercise.local_id || `${exercise.exercise_id}-${index}`
                      }
                      className="exercise-library-item"
                    >
                      <div>
                        <strong>{exercise.name}</strong>
                        <p>
                          {exercise.muscle_group}
                          {exercise.is_custom ? " • Custom" : ""}
                        </p>

                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="sets-grid">
                            <span>Set {setIndex + 1}</span>

                            <input
                              type="number"
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) =>
                                updateSetValue(
                                  index,
                                  setIndex,
                                  "reps",
                                  e.target.value,
                                )
                              }
                            />

                            <input
                              type="number"
                              placeholder="Weight"
                              value={set.weight}
                              onChange={(e) =>
                                updateSetValue(
                                  index,
                                  setIndex,
                                  "weight",
                                  e.target.value,
                                )
                              }
                            />

                            <button
                              type="button"
                              className="text-button danger-text"
                              onClick={() =>
                                removeSetFromExercise(index, setIndex)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => addSetToExercise(index)}
                        >
                          Add Set
                        </button>
                      </div>

                      <button
                        className="text-button danger-text"
                        onClick={() => removeExercise(index)}
                      >
                        Remove Exercise
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

            <button
              className="primary-button start-workout-button"
              onClick={handleSaveWorkout}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : cameFromCompletedWorkout
                  ? "Save Completed Workout"
                  : "Save Workout Design"}
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
              <p>Create a custom exercise for this workout.</p>

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

                <button
                  className="primary-button"
                  onClick={handleAddCustomExercise}
                >
                  Add Custom Exercise
                </button>
              </div>
            </div>

            <div className="exercise-library-list">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className="exercise-library-item"
                >
                  <div>
                    <strong>{exercise.name}</strong>
                    <p>
                      {exercise.muscle_group}
                      {exercise.is_custom ? " • Custom" : ""}
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
