from flask import Blueprint, jsonify
from flask import Blueprint, jsonify, request
import mysql.connector

users_bp = Blueprint("users", __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="gym_app"
    )

@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                user_id,
                email,
                name,
                age,
                gender,
                height,
                weight,
                profile_picture_url
            FROM users
            WHERE user_id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify(user), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

@users_bp.route("/<int:user_id>", methods=["PUT"])
def update_user_profile(user_id):
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    age = data.get("age")
    gender = data.get("gender", "").strip()
    height = data.get("height")
    weight = data.get("weight")
    profile_picture_url = data.get("profile_picture_url", "").strip()

    if not name:
        return jsonify({"message": "Name is required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            UPDATE users
            SET
                name = %s,
                age = %s,
                gender = %s,
                height = %s,
                weight = %s,
                profile_picture_url = %s
            WHERE user_id = %s
            """,
            (
                name,
                age if age != "" else None,
                gender if gender != "" else None,
                height if height != "" else None,
                weight if weight != "" else None,
                profile_picture_url if profile_picture_url != "" else None,
                user_id,
            )
        )

        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "User not found"}), 404

        return jsonify({"message": "Profile updated successfully"}), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

@users_bp.route("/<int:user_id>/social-counts", methods=["GET"])
def get_social_counts(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT COUNT(*) AS following_count FROM follows WHERE follower_user_id = %s",
            (user_id,)
        )
        following = cursor.fetchone()["following_count"]

        cursor.execute(
            "SELECT COUNT(*) AS followers_count FROM follows WHERE followed_user_id = %s",
            (user_id,)
        )
        followers = cursor.fetchone()["followers_count"]

        return jsonify({
            "following_count": following,
            "followers_count": followers
        }), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@users_bp.route("/<int:user_id>/following", methods=["GET"])
def get_following(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                u.user_id,
                u.name,
                u.email,
                u.profile_picture_url
            FROM follows f
            JOIN users u ON f.followed_user_id = u.user_id
            WHERE f.follower_user_id = %s
            ORDER BY u.name
            """,
            (user_id,)
        )

        return jsonify(cursor.fetchall()), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@users_bp.route("/<int:user_id>/followers", methods=["GET"])
def get_followers(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                u.user_id,
                u.name,
                u.email,
                u.profile_picture_url
            FROM follows f
            JOIN users u ON f.follower_user_id = u.user_id
            WHERE f.followed_user_id = %s
            ORDER BY u.name
            """,
            (user_id,)
        )

        return jsonify(cursor.fetchall()), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()