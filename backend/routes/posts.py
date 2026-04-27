from flask import Blueprint, request, jsonify
import mysql.connector

posts_bp = Blueprint("posts", __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="gym_app"
    )

@posts_bp.route("<int:post_id>/like", methods=["POST"])
def toggle_like(post_id):
    data = request.get_json()
    user_id = data.get("user_id")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM post_likes WHERE post_id=%s AND user_id=%s",
        (post_id, user_id)
    )
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            "DELETE FROM post_likes WHERE post_id=%s AND user_id=%s",
            (post_id, user_id)
        )
        liked = False
    else:
        cursor.execute(
            "INSERT INTO post_likes (post_id, user_id) VALUES (%s, %s)",
            (post_id, user_id)
        )
        liked = True

    conn.commit()

    cursor.execute(
        "SELECT COUNT(*) AS like_count FROM post_likes WHERE post_id=%s",
        (post_id,)
    )
    like_count = cursor.fetchone()["like_count"]

    return jsonify({"liked": liked, "like_count": like_count}), 200

@posts_bp.route("<int:post_id>/comment", methods=["POST"])
def add_comment(post_id):
    data = request.get_json()
    user_id = data.get("user_id")
    content = data.get("content")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        INSERT INTO post_comments (post_id, user_id, content)
        VALUES (%s, %s, %s)
        """,
        (post_id, user_id, content)
    )

    conn.commit()

    return jsonify({"message": "Comment added"}), 201

@posts_bp.route("", methods=["GET"])
def get_posts():
    user_id = request.args.get("user_id")

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
                u.profile_picture_url,
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
                SELECT COUNT(*) AS like_count
                FROM post_likes
                WHERE post_id = %s
                """,
                (post["post_id"],)
            )
            post["like_count"] = cursor.fetchone()["like_count"]

            post["liked_by_me"] = False

            if user_id:
                cursor.execute(
                    """
                    SELECT post_like_id
                    FROM post_likes
                    WHERE post_id = %s AND user_id = %s
                    """,
                    (post["post_id"], user_id)
                )
                post["liked_by_me"] = cursor.fetchone() is not None

            cursor.execute(
                """
                SELECT
                    c.comment_id,
                    c.content,
                    c.created_at,
                    u.name
                FROM post_comments c
                JOIN users u ON c.user_id = u.user_id
                WHERE c.post_id = %s
                ORDER BY c.created_at ASC
                """,
                (post["post_id"],)
            )
            post["comments"] = cursor.fetchall()

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