import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const userGyms = [
  { id: 1, name: "Iron Forge Fitness", lastVisited: "Yesterday" },
  { id: 2, name: "Northside Barbell Club", lastVisited: "3 days ago" },
];

const savedWorkouts = [
  {
    id: 1,
    name: "Push Day",
    focus: "Chest, shoulders, triceps",
    exercises: ["Bench Press", "Incline Dumbbell Press", "Tricep Pushdown"],
  },
  {
    id: 2,
    name: "Leg Day",
    focus: "Quads, glutes, hamstrings",
    exercises: ["Back Squat", "Leg Press", "Romanian Deadlift"],
  },
  {
    id: 3,
    name: "Pull Day",
    focus: "Back and biceps",
    exercises: ["Deadlift", "Lat Pulldown", "Barbell Row"],
  },
];

const exerciseLibrary = [
  { id: 1, name: "Bench Press", category: "Chest" },
  { id: 2, name: "Incline Dumbbell Press", category: "Chest" },
  { id: 3, name: "Cable Fly", category: "Chest" },
  { id: 4, name: "Shoulder Press", category: "Shoulders" },
  { id: 5, name: "Lateral Raise", category: "Shoulders" },
  { id: 6, name: "Tricep Pushdown", category: "Arms" },
  { id: 7, name: "Barbell Curl", category: "Arms" },
  { id: 8, name: "Hammer Curl", category: "Arms" },
  { id: 9, name: "Back Squat", category: "Legs" },
  { id: 10, name: "Romanian Deadlift", category: "Legs" },
  { id: 11, name: "Leg Press", category: "Legs" },
  { id: 12, name: "Walking Lunges", category: "Legs" },
  { id: 13, name: "Lat Pulldown", category: "Back" },
  { id: 14, name: "Barbell Row", category: "Back" },
  { id: 15, name: "Seated Cable Row", category: "Back" },
  { id: 16, name: "Deadlift", category: "Back" },
  { id: 17, name: "Plank", category: "Core" },
  { id: 18, name: "Hanging Leg Raise", category: "Core" },
];

function WorkoutPage() {
  const navigate = useNavigate();

  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [isAtGym, setIsAtGym] = useState("");
  const [selectedGymId, setSelectedGymId] = useState("");
  const [startMode, setStartMode] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeWorkout, setActiveWorkout] = useState({
    name: "Today's Workout",
    gymId: "",
    gymName: "",
    source: "scratch",
    exercises: [],
  });

  const categories = [
    "All",
    ...new Set(exerciseLibrary.map((exercise) => exercise.category)),
  ];

  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || exercise.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const addExerciseToWorkout = (exercise) => {
    const newExercise = {
      id: `${exercise.id}-${Date.now()}`,
      name: exercise.name,
      category: exercise.category,
      sets: [
        { reps: "", weight: "" },
        { reps: "", weight: "" },
        { reps: "", weight: "" },
      ],
    };

    setActiveWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  const removeExerciseFromWorkout = (exerciseId) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  };

  const addSet = (exerciseId) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: [...exercise.sets, { reps: "", weight: "" }],
            }
          : exercise
      ),
    }));
  };

  const removeSet = (exerciseId, setIndex) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        if (exercise.sets.length === 1) {
          return {
            ...exercise,
            sets: [{ reps: "", weight: "" }],
          };
        }

        return {
          ...exercise,
          sets: exercise.sets.filter((_, index) => index !== setIndex),
        };
      }),
    }));
  };

  const updateSetValue = (exerciseId, setIndex, field, value) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, index) =>
            index === setIndex ? { ...set, [field]: value } : set
          ),
        };
      }),
    }));
  };

  const handleStartWorkout = () => {
    if (!isAtGym) {
      window.alert("Please choose whether you are working out at a gym.");
      return;
    }

    if (isAtGym === "yes" && !selectedGymId) {
      window.alert("Please select which gym you are training at.");
      return;
    }

    if (!startMode) {
      window.alert("Please choose a designed workout or start from scratch.");
      return;
    }

    let nextWorkout = {
      name: "Today's Workout",
      gymId: selectedGymId,
      gymName:
        isAtGym === "yes"
          ? userGyms.find((gym) => String(gym.id) === selectedGymId)?.name || ""
          : "Not at a gym",
      source: startMode,
      exercises: [],
    };

    if (startMode === "template") {
      const selectedTemplate = savedWorkouts.find(
        (workout) => String(workout.id) === selectedTemplateId
      );

      if (!selectedTemplate) {
        window.alert("Please select one of your designed workouts.");
        return;
      }

      nextWorkout = {
        ...nextWorkout,
        name: selectedTemplate.name,
        exercises: selectedTemplate.exercises.map((exerciseName, index) => ({
          id: `${index}-${exerciseName}-${Date.now()}`,
          name: exerciseName,
          category:
            exerciseLibrary.find((exercise) => exercise.name === exerciseName)
              ?.category || "Other",
          sets: [
            { reps: "", weight: "" },
            { reps: "", weight: "" },
            { reps: "", weight: "" },
          ],
        })),
      };
    }

    setActiveWorkout(nextWorkout);
    setWorkoutStarted(true);
  };

  const resetWorkoutFlow = () => {
    setWorkoutStarted(false);
    setIsAtGym("");
    setSelectedGymId("");
    setStartMode("");
    setSelectedTemplateId("");
    setSearchTerm("");
    setSelectedCategory("All");
    setActiveWorkout({
      name: "Today's Workout",
      gymId: "",
      gymName: "",
      source: "scratch",
      exercises: [],
    });
  };

  const handleCompleteWorkout = (post) => {
    if (post) {
      window.alert("Workout completed and posted to feed.");
    } else {
      window.alert("Workout completed.");
    }

    resetWorkoutFlow();
  };

  const handleDiscardWorkout = () => {
    const shouldDiscard = window.confirm(
      "Discard this workout? Any exercises and set data entered so far will be removed."
    );

    if (!shouldDiscard) return;

    window.alert("Workout discarded.");
    resetWorkoutFlow();
  };

  if (workoutStarted) {
    return (
      <div className="workout-page">
        <div className="workout-shell">
          <div className="workout-header-row">
            <div>
              <h1 className="workout-title">{activeWorkout.name}</h1>
              <p className="workout-subtitle">
                {activeWorkout.gymName || "No location selected"}
              </p>
            </div>
            <button className="secondary-button" onClick={() => navigate("/home")}>
              Home
            </button>
          </div>

          <div className="workout-active-layout">
            <div className="workout-main-card">
              <h2>Current Workout</h2>
              {activeWorkout.exercises.length > 0 ? (
                activeWorkout.exercises.map((exercise) => (
                  <div key={exercise.id} className="active-exercise-card">
                    <div className="active-exercise-top">
                      <div>
                        <h3>{exercise.name}</h3>
                        <p>{exercise.category}</p>
                      </div>
                      <button
                        className="text-button danger-text"
                        onClick={() => removeExerciseFromWorkout(exercise.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="sets-grid sets-grid-header">
                      <span>Set</span>
                      <span>Reps</span>
                      <span>Weight</span>
                      <span>Action</span>
                    </div>

                    {exercise.sets.map((set, index) => (
                      <div key={`${exercise.id}-${index}`} className="sets-grid">
                        <span>{index + 1}</span>
                        <input
                          type="text"
                          placeholder="10"
                          value={set.reps}
                          onChange={(e) =>
                            updateSetValue(
                              exercise.id,
                              index,
                              "reps",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="135"
                          value={set.weight}
                          onChange={(e) =>
                            updateSetValue(
                              exercise.id,
                              index,
                              "weight",
                              e.target.value
                            )
                          }
                        />
                        <button
                          className="text-button danger-text remove-set-button"
                          onClick={() => removeSet(exercise.id, index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      className="secondary-button"
                      onClick={() => addSet(exercise.id)}
                    >
                      Add Set
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state-card">
                  <p>No exercises added yet. Use the library to build your workout.</p>
                </div>
              )}
            </div>

            <div className="workout-side-card">
              <h2>Add Exercises</h2>
              <input
                className="workout-input"
                type="text"
                placeholder="Search exercises"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="filter-pills">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`pill-button ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="exercise-library-list">
                {filteredExercises.map((exercise) => (
                  <div key={exercise.id} className="exercise-library-item">
                    <div>
                      <strong>{exercise.name}</strong>
                      <p>{exercise.category}</p>
                    </div>
                    <button
                      className="primary-button small-button"
                      onClick={() => addExerciseToWorkout(exercise)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="complete-workout-bar">
          <div className="complete-workout-actions">
            <button
              className="secondary-button complete-workout-button discard-workout-button"
              onClick={handleDiscardWorkout}
            >
              Discard Workout
            </button>

            <button
              className="primary-button complete-workout-button"
              onClick={() => handleCompleteWorkout(false)}
            >
              Complete Workout
            </button>

            <button
              className="primary-button complete-workout-button post-workout-button"
              onClick={() => handleCompleteWorkout(true)}
            >
              Complete & Post
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-page">
      <div className="workout-shell">
        <div className="workout-header-row">
          <div>
            <h1 className="workout-title">Workout</h1>
            <p className="workout-subtitle">Start, view, or design your workouts</p>
          </div>
          <button className="secondary-button" onClick={() => navigate("/home")}>
            Back
          </button>
        </div>

        <div className="workout-top-actions">
          <button className="workout-action-card" onClick={() => window.scrollTo({ top: 280, behavior: "smooth" })}>
            <h2>Start a Workout</h2>
            <p>Choose your gym, load a designed workout, or build from scratch.</p>
          </button>

          <button className="workout-action-card" onClick={() => navigate("/my-workouts")}>
            <h2>View My Workouts</h2>
            <p>See your designed workouts and recent examples.</p>
          </button>

          <button className="workout-action-card" onClick={() => navigate("/design-workout")}>
            <h2>Design a Workout</h2>
            <p>Create and save a workout template for later.</p>
          </button>
        </div>

        <div className="workout-main-card">
          <h2>Start a Workout</h2>

          <div className="form-block">
            <label>Are you working out at a gym?</label>
            <div className="option-row">
              <button
                className={`option-button ${isAtGym === "yes" ? "selected" : ""}`}
                onClick={() => setIsAtGym("yes")}
              >
                Yes
              </button>
              <button
                className={`option-button ${isAtGym === "no" ? "selected" : ""}`}
                onClick={() => setIsAtGym("no")}
              >
                No
              </button>
            </div>
          </div>

          {isAtGym === "yes" && (
            <div className="form-block">
              <label>Select one of your gyms</label>
              <div className="gym-select-list">
                {userGyms.map((gym) => (
                  <button
                    key={gym.id}
                    className={`gym-select-card ${
                      selectedGymId === String(gym.id) ? "selected" : ""
                    }`}
                    onClick={() => setSelectedGymId(String(gym.id))}
                  >
                    <strong>{gym.name}</strong>
                    <span>Last visited: {gym.lastVisited}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-block">
            <label>How do you want to begin?</label>
            <div className="option-column">
              <button
                className={`start-mode-card ${startMode === "template" ? "selected" : ""}`}
                onClick={() => setStartMode("template")}
              >
                <strong>Use a designed workout</strong>
                <span>Start from one of your saved workout templates.</span>
              </button>

              <button
                className={`start-mode-card ${startMode === "scratch" ? "selected" : ""}`}
                onClick={() => setStartMode("scratch")}
              >
                <strong>Start from scratch</strong>
                <span>Add exercises as you go during the workout.</span>
              </button>
            </div>
          </div>

          {startMode === "template" && (
            <div className="form-block">
              <label>Select a designed workout</label>
              <div className="template-list">
                {savedWorkouts.map((workout) => (
                  <button
                    key={workout.id}
                    className={`template-card ${
                      selectedTemplateId === String(workout.id) ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTemplateId(String(workout.id))}
                  >
                    <strong>{workout.name}</strong>
                    <span>{workout.focus}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="primary-button start-workout-button" onClick={handleStartWorkout}>
            Begin Workout
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutPage;
