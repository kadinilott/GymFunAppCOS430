import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GymPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [myGyms, setMyGyms] = useState([]);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const fetchMyGyms = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/gyms/memberships/${storedUser.user_id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load gyms.");
        return;
      }

      setMyGyms(data);
    } catch (err) {
      setError("Could not load gyms.");
    }
  };

  const searchGyms = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/gyms?search=${encodeURIComponent(search)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not search gyms.");
        return;
      }

      setSearchResults(data);
    } catch (err) {
      setError("Could not search gyms.");
    }
  };

  const joinGym = async (gymId) => {
    try {
      const response = await fetch("http://localhost:5000/api/gyms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: storedUser.user_id,
          gym_id: gymId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not join gym.");
        return;
      }

      setError("");
      fetchMyGyms();
    } catch (err) {
      setError("Could not join gym.");
    }
  };

  useEffect(() => {
    if (!storedUser) {
      navigate("/");
      return;
    }

    fetchMyGyms();
  }, []);

  useEffect(() => {
    searchGyms();
  }, [search]);

  const endMembership = async (gymId) => {
  try {
    const response = await fetch("http://localhost:5000/api/gyms/membership", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: storedUser.user_id,
        gym_id: gymId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Could not end membership.");
      return;
    }

    setError("");
    fetchMyGyms();
  } catch (err) {
    setError("Could not end membership.");
  }
};
  return (

    
    <div className="profile-page">
      <div className="profile-card">
        <button
            className="secondary-button"
            onClick={() => navigate("/home")}
          >
            Back
      </button>
        <h1>Gym Page</h1>

        {error && <p className="login-error">{error}</p>}

        <div className="profile-section">
          <h2>Search Gyms</h2>

          <input
            className="gym-search-input"
            type="text"
            placeholder="Search gyms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="gym-results">
            {searchResults.map((gym) => (
              <div key={gym.gym_id} className="gym-membership">
                <div>
                  <strong>{gym.name}</strong>
                  <p>{gym.location || "No location added"}</p>
                </div>

                <div>
                  <button onClick={() => navigate(`/gym/${gym.gym_id}`)}>
                    View Gym
                  </button>

                  <button onClick={() => joinGym(gym.gym_id)}>
                    Add Gym
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2>My Gyms</h2>

          {myGyms.length === 0 ? (
            <p>You are not a member of any gyms yet.</p>
          ) : (
            myGyms.map((gym) => (
              <div key={gym.gym_id} className="gym-membership">
                <div>
                  <strong>{gym.name}</strong>
                  <p>Last visited: {gym.last_visited_at || "Never"}</p>
                  <p>Total members: {gym.total_members}</p>
                </div>

                <button onClick={() => navigate(`/gym/${gym.gym_id}`)}>
                  View Gym
                </button>

                <button onClick={() => endMembership(gym.gym_id)}>
                  End Membership
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GymPage;