INSERT INTO users (email, password_hash, name, age, gender, height, weight)
VALUES
('john@example.com', 'password', 'John Doe', 22, 'Male', 72.0, 180.5),
('jane@example.com', 'password', 'Jane Smith', 21, 'Female', 65.0, 135.2),
('mike@example.com', 'password', 'Mike Johnson', 23, 'Male', 70.0, 175.0);


INSERT INTO gyms (name, owner, phone_number, location, description)
VALUES
('Campus Rec Center', 'Chris Bumstead', '207-532-2543', 'University Campus', 'Main student gym'),
('Downtown Fitness', 'Sam Sulek', '207-521-9975', 'City Center', 'Commercial gym with full equipment'),
('Iron Warehouse', 'Arnold', '207-943-6674', 'Industrial District', 'Powerlifting-focused gym');

INSERT INTO exercises (name, muscle_group, created_by_user_id, is_custom)
VALUES
('Bench Press', 'Chest', NULL, FALSE),
('Squat', 'Legs', NULL, FALSE),
('Deadlift', 'Back', NULL, FALSE),
('Pull Up', 'Back', NULL, FALSE),
('Shoulder Press', 'Shoulders', NULL, FALSE);

INSERT INTO exercises (name, muscle_group, created_by_user_id, is_custom)
VALUES
('John Curl Variation', 'Biceps', 1, TRUE);

INSERT INTO gym_memberships (user_id, gym_id, date_joined)
VALUES
(1, 1, '2026-01-10'),
(1, 2, '2026-02-01'),
(2, 1, '2026-01-15'),
(3, 3, '2026-03-01');

INSERT INTO gym_exercises (gym_id, exercise_id, track_max_lift, track_total_volume)
VALUES
-- Campus Rec Center
(1, 1, TRUE, TRUE),   -- Bench Press
(1, 2, TRUE, TRUE),   -- Squat
(1, 4, FALSE, TRUE),  -- Pull Up

-- Downtown Fitness
(2, 1, TRUE, TRUE),
(2, 3, TRUE, TRUE),

-- Iron Warehouse
(3, 2, TRUE, TRUE),
(3, 3, TRUE, TRUE);