import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EditProfilePage({ profile, setProfile }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(formData);
    navigate("/profile");
  };

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
                type="text"
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
                type="text"
                name="height"
                placeholder="Height"
                value={formData.height}
                onChange={handleChange}
              />

              <input
                type="text"
                name="weight"
                placeholder="Weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit">Save Profile</button>
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