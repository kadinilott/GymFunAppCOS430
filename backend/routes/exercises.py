from flask import Blueprint, request, jsonify
import mysql.connector

exercises_bp = Blueprint("exercises", __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="gym_app"
    )

@exercises_bp.route("", methods=["GET"])
def get_exercises():
    search = request.args.get("search", "")
    user_id = request.args.get("user_id")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT exercise_id, name, muscle_group, is_custom, created_by_user_id
            FROM exercises
            WHERE name LIKE %s
              AND (is_custom = FALSE OR created_by_user_id = %s)
            ORDER BY name
            """,
            (f"%{search}%", user_id)
        )

        return jsonify(cursor.fetchall()), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@exercises_bp.route("", methods=["POST"])
def create_exercise():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    muscle_group = data.get("muscle_group", "").strip()
    user_id = data.get("user_id")

    if not name or not muscle_group or not user_id:
        return jsonify({"message": "name, muscle_group, and user_id are required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            INSERT INTO exercises (name, muscle_group, created_by_user_id, is_custom)
            VALUES (%s, %s, %s, TRUE)
            """,
            (name, muscle_group, user_id)
        )

        conn.commit()

        return jsonify({
            "exercise_id": cursor.lastrowid,
            "name": name,
            "muscle_group": muscle_group,
            "is_custom": True,
            "created_by_user_id": user_id
        }), 201

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()