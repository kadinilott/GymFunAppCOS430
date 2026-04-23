-- Gym App database schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS gym_app;
USE gym_app;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NULL,
    gender VARCHAR(30) NULL,
    height DECIMAL(5,2) NULL,
    weight DECIMAL(5,2) NULL,
    profile_picture_url VARCHAR(500) NULL
);

CREATE TABLE gyms (
    gym_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    owner VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    location VARCHAR(255) NULL,
    description TEXT NULL
);

CREATE TABLE exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    created_by_user_id INT NULL,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_exercises_created_by_user
        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE workouts (
    workout_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    CONSTRAINT fk_workouts_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workout_id INT NOT NULL,
    caption TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_posts_workout
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
        ON DELETE CASCADE
);

CREATE TABLE gym_memberships (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    gym_id INT NOT NULL,
    date_joined DATE NOT NULL,
    CONSTRAINT fk_gym_memberships_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_gym_memberships_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(gym_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_gym_memberships_user_gym UNIQUE (user_id, gym_id)
);

CREATE TABLE workout_exercises (
    workout_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT NOT NULL,
    reps INT NULL,
    weight DECIMAL(6,2) NULL,
    duration_seconds INT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL,
    CONSTRAINT fk_workout_exercises_workout
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_exercises_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
        ON DELETE CASCADE
);

CREATE TABLE gym_exercises (
    gym_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    exercise_id INT NOT NULL,
    track_max_lift BOOLEAN NOT NULL DEFAULT FALSE,
    track_total_volume BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_gym_exercises_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(gym_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_gym_exercises_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_gym_exercises_gym_exercise UNIQUE (gym_id, exercise_id)
);

CREATE TABLE post_likes (
    post_like_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_likes_post
        FOREIGN KEY (post_id) REFERENCES posts(post_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_post_likes_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_post_likes_post_user UNIQUE (post_id, user_id)
);

CREATE TABLE post_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(post_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_post_comments_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    follower_user_id INT NOT NULL,
    followed_user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_follows_follower
        FOREIGN KEY (follower_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_follows_followed
        FOREIGN KEY (followed_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_follows_pair UNIQUE (follower_user_id, followed_user_id),
    CONSTRAINT chk_follows_not_self CHECK (follower_user_id <> followed_user_id)
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_workout_id ON posts(workout_id);
CREATE INDEX idx_exercises_created_by_user_id ON exercises(created_by_user_id);
CREATE INDEX idx_gym_memberships_gym_id ON gym_memberships(gym_id);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX idx_gym_exercises_exercise_id ON gym_exercises(exercise_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX idx_follows_followed_user_id ON follows(followed_user_id);
