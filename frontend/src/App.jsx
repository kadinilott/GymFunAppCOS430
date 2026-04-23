import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import FriendsPage from "./pages/FriendsPage";
import GymPage from "./pages/GymPage";
import WorkoutPage from "./pages/WorkoutPage";
import DesignWorkoutPage from "./pages/DesignWorkoutPage";
import MyWorkoutsPage from "./pages/MyWorkoutsPage";
import AITrainerPage from "./pages/AITrainerPage";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" replace />;
}

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
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfilePage profile={profile} setProfile={setProfile} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gym"
        element={
          <ProtectedRoute>
            <GymPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <WorkoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/design-workout"
        element={
          <ProtectedRoute>
            <DesignWorkoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-workouts"
        element={
          <ProtectedRoute>
            <MyWorkoutsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <AITrainerPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;