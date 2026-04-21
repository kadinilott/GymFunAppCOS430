import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import FriendsPage from "./pages/FriendsPage";
import GymPage from "./pages/GymPage";
import WorkoutPage from "./pages/WorkoutPage";
import DesignWorkoutPage from "./pages/DesignWorkoutPage";
import MyWorkoutsPage from "./pages/MyWorkoutsPage";
import AITrainerPage from "./pages/AITrainerPage";

function App() {
  const [profile, setProfile] = useState({
    profilePicture: "",
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
  });

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage profile={profile} />} />
      <Route path="/profile/:id" element={<ProfilePage profile={profile} />} />
      <Route
        path="/edit-profile"
        element={
          <EditProfilePage profile={profile} setProfile={setProfile} />
        }
      />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/gym" element={<GymPage />} />
      <Route path="/workout" element={<WorkoutPage />} />
      <Route path="/design-workout" element={<DesignWorkoutPage />} />
      <Route path="/my-workouts" element={<MyWorkoutsPage />} />
      <Route path="/ai" element={<AITrainerPage />} />
    </Routes>
  );
}

export default App;
