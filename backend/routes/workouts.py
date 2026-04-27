from flask import Blueprint, request, jsonify
import mysql.connector

workouts_bp = Blueprint("workouts", __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="gym_app"
    )

@workouts_bp.route("", methods=["POST"])
def create_workout():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    title = data.get("title", "Custom Workout")
    exercises = data.get("exercises", [])

    if not user_id:
        return jsonify({"message": "user_id is required"}), 400

    if not exercises:
        return jsonify({"message": "Workout must have at least one exercise"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        completed = data.get("completed", False)
        gym_id = data.get("gym_id")

        if completed and gym_id:
            cursor.execute(
                """
                SELECT membership_id
                FROM gym_memberships
                WHERE user_id = %s AND gym_id = %s
                """,
                (user_id, gym_id)
            )

            if not cursor.fetchone():
                return jsonify({
                    "message": "You must be a member of this gym to count this workout toward leaderboards"
                }), 403

        cursor.execute(
            """
            INSERT INTO workouts (user_id, gym_id, title, completed_at)
            VALUES (%s, %s, %s, CASE WHEN %s THEN NOW() ELSE NULL END)
            """,
            (
                user_id,
                gym_id if completed and gym_id else None,
                title,
                completed
            )
        )

        workout_id = cursor.lastrowid
        should_post = data.get("post", False)
        notes = data.get("notes", "")

        for index, exercise in enumerate(exercises):
            sets_list = exercise.get("all_sets", [])

            if not sets_list:
                sets_count = int(exercise.get("sets", 1) or 1)
                sets_list = [
                {
                    "reps": exercise.get("reps"),
                    "weight": exercise.get("weight"),
                    "duration_seconds": exercise.get("duration_seconds"),
                }
                for _ in range(sets_count)
            ]

            cursor.execute(
                """
                INSERT INTO workout_exercises
                    (workout_id, exercise_id, sets, reps, weight, duration_seconds, is_completed, order_index)
                VALUES
                    (%s, %s, %s, %s, %s, %s, FALSE, %s)
                """,
                (
                    workout_id,
                    exercise["exercise_id"],
                    len(sets_list),
                    sets_list[0].get("reps") if sets_list else None,
                    sets_list[0].get("weight") if sets_list else None,
                    sets_list[0].get("duration_seconds") if sets_list else None,
                    index,
                )
            )

            workout_exercise_id = cursor.lastrowid

            for set_index, workout_set in enumerate(sets_list):
                reps = workout_set.get("reps")
                weight = workout_set.get("weight")
                duration_seconds = workout_set.get("duration_seconds")

                cursor.execute(
                    """
                    INSERT INTO workout_sets
                        (workout_exercise_id, set_number, reps, weight, duration_seconds)
                    VALUES
                        (%s, %s, %s, %s, %s)
                    """,
                    (
                        workout_exercise_id,
                        set_index + 1,
                        None if reps == "" else reps,
                        None if weight == "" else weight,
                        duration_seconds,
                    )
                )
        post_id = None

        if should_post:
            cursor.execute(
                """
                INSERT INTO posts (user_id, workout_id, caption)
                VALUES (%s, %s, %s)
                """,
                (user_id, workout_id, notes)
            )
        post_id = cursor.lastrowid

        conn.commit()

        return jsonify({
            "message": "Workout saved successfully",
            "workout_id": workout_id,
            "post_id": post_id
            }), 201

    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@workouts_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_workouts(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                w.workout_id,
                w.title,
                w.created_at,
                w.completed_at,
                COUNT(we.workout_exercise_id) AS exercise_count
            FROM workouts w
            LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
            WHERE w.user_id = %s
            GROUP BY w.workout_id, w.title, w.created_at, w.completed_at
            ORDER BY w.created_at DESC
            """,
            (user_id,)
        )

        workouts = cursor.fetchall()
        return jsonify(workouts), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@workouts_bp.route("/<int:workout_id>", methods=["GET"])
def get_workout_detail(workout_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT workout_id, user_id, title, created_at, completed_at
            FROM workouts
            WHERE workout_id = %s
            """,
            (workout_id,)
        )

        workout = cursor.fetchone()

        if not workout:
            return jsonify({"message": "Workout not found"}), 404

        cursor.execute(
            """
            SELECT
                we.workout_exercise_id,
                we.exercise_id,
                e.name,
                e.muscle_group,
                we.sets,
                we.reps,
                we.weight,
                we.duration_seconds,
                we.is_completed,
                we.order_index
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.exercise_id
            WHERE we.workout_id = %s
            ORDER BY we.order_index
            """,
            (workout_id,)
        )

        exercises = cursor.fetchall()

        for exercise in exercises:
            cursor.execute(
                """
                SELECT
                    workout_set_id,
                    set_number,
                    reps,
                    weight,
                    duration_seconds
                FROM workout_sets
                WHERE workout_exercise_id = %s
                ORDER BY set_number
                """,
                (exercise["workout_exercise_id"],)
            )

            exercise["all_sets"] = cursor.fetchall()

        workout["exercises"] = exercises

        return jsonify(workout), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@workouts_bp.route("/posts", methods=["GET"])
def get_workout_posts():
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                p.post_id,
                p.caption,
                p.created_at AS posted_at,
                u.user_id,
                u.name AS user_name,
                w.workout_id,
                w.title
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            JOIN workouts w ON p.workout_id = w.workout_id
            ORDER BY p.created_at DESC
            """
        )

        posts = cursor.fetchall()

        for post in posts:
            cursor.execute(
                """
                SELECT
                    we.workout_exercise_id,
                    e.name
                FROM workout_exercises we
                JOIN exercises e ON we.exercise_id = e.exercise_id
                WHERE we.workout_id = %s
                ORDER BY we.order_index
                """,
                (post["workout_id"],)
            )

            exercises = cursor.fetchall()
            cursor.execute(
                "SELECT COUNT(*) AS like_count FROM post_likes WHERE post_id=%s",
                (post["post_id"],)
            )
            post["like_count"] = cursor.fetchone()["like_count"]

            cursor.execute(
                """
                SELECT c.comment_id, c.content, c.created_at, u.name
                FROM post_comments c
                JOIN users u ON c.user_id = u.user_id
                WHERE c.post_id = %s
                ORDER BY c.created_at ASC
                """,
                (post["post_id"],)
            )
            post["comments"] = cursor.fetchall()

            for exercise in exercises:
                cursor.execute(
                    """
                    SELECT set_number, reps, weight
                    FROM workout_sets
                    WHERE workout_exercise_id = %s
                    ORDER BY set_number
                    """,
                    (exercise["workout_exercise_id"],)
                )

                exercise["sets"] = cursor.fetchall()

            post["exercises"] = exercises

        return jsonify(posts), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
