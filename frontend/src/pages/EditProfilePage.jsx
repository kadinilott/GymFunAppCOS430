import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EditProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    profile_picture_url: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${parsedUser.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load profile.");
          return;
        }

        setFormData({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "",
          height: data.height || "",
          weight: data.weight || "",
          profile_picture_url: data.profile_picture_url || "",
        });
      } catch (err) {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:5000/api/users/${parsedUser.user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not update profile.");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...parsedUser,
          name: formData.name,
        })
      );

      navigate("/profile");
    } catch (err) {
      setError("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <form onSubmit={handleSave}>
          <div className="profile-top">
            <div className="profile-pic">No Photo</div>

            <div className="profile-info form-fields">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
              />

              <input
                type="text"
                name="gender"
                placeholder="Gender"
                value={formData.gender}
                onChange={handleChange}
              />

              <input
                type="number"
                name="height"
                placeholder="Height"
                value={formData.height}
                onChange={handleChange}
              />

              <input
                type="number"
                name="weight"
                placeholder="Weight"
                value={formData.weight}
                onChange={handleChange}
              />

              <input
                type="text"
                name="profile_picture_url"
                placeholder="Profile picture URL"
                value={formData.profile_picture_url}
                onChange={handleChange}
              />

              {error && <p className="login-error">{error}</p>}
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <button type="button" onClick={() => navigate("/profile")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;