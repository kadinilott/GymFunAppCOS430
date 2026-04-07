import { useEffect, useState } from "react";
import "./styles.css";

function App() {
  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/gyms")
      .then((res) => res.json())
      .then((data) => setGyms(data));
  }, []);

  return (
    <div className="container">
      <h1>Gym App</h1>
      <h2>Available Gyms</h2>

      {gyms.map((gym) => (
        <div key={gym.id} className="card">
          <h3>{gym.name}</h3>
          <p>{gym.city}</p>
        </div>
      ))}
    </div>
  );
}

export default App;