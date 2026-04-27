from flask import Blueprint, request, jsonify
import mysql.connector

gyms_bp = Blueprint("gyms", __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="gym_app"
    )


@gyms_bp.route("", methods=["GET"])
def search_gyms():
    search = request.args.get("search", "")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT gym_id, name, location, description
            FROM gyms
            WHERE name LIKE %s
            ORDER BY name
            """,
            (f"%{search}%",)
        )

        return jsonify(cursor.fetchall()), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@gyms_bp.route("/memberships/<int:user_id>", methods=["GET"])
def get_user_gyms(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                g.gym_id,
                g.name,
                g.location,
                gm.date_joined,
                gm.last_visited_at,
                COUNT(gm2.user_id) AS total_members
            FROM gym_memberships gm
            JOIN gyms g ON gm.gym_id = g.gym_id
            LEFT JOIN gym_memberships gm2 ON g.gym_id = gm2.gym_id
            WHERE gm.user_id = %s
            GROUP BY g.gym_id, g.name, g.location, gm.date_joined, gm.last_visited_at
            ORDER BY g.name
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


@gyms_bp.route("/join", methods=["POST"])
def join_gym():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    gym_id = data.get("gym_id")

    if not user_id or not gym_id:
        return jsonify({"message": "user_id and gym_id are required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            INSERT INTO gym_memberships (user_id, gym_id, date_joined)
            VALUES (%s, %s, CURDATE())
            """,
            (user_id, gym_id)
        )

        conn.commit()
        return jsonify({"message": "Gym joined successfully"}), 201

    except mysql.connector.IntegrityError:
        return jsonify({"message": "You are already a member of this gym"}), 409

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@gyms_bp.route("/membership", methods=["DELETE"])
def end_membership():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    gym_id = data.get("gym_id")

    if not user_id or not gym_id:
        return jsonify({"message": "user_id and gym_id are required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            DELETE FROM gym_memberships
            WHERE user_id = %s AND gym_id = %s
            """,
            (user_id, gym_id)
        )

        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Membership not found"}), 404

        return jsonify({"message": "Membership ended successfully"}), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@gyms_bp.route("/<int:gym_id>", methods=["GET"])
def get_gym_detail(gym_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                g.gym_id,
                g.name,
                g.location,
                g.description,
                g.owner,
                g.phone_number,
                COUNT(gm.user_id) AS total_members
            FROM gyms g
            LEFT JOIN gym_memberships gm ON g.gym_id = gm.gym_id
            WHERE g.gym_id = %s
            GROUP BY
                g.gym_id,
                g.name,
                g.location,
                g.description,
                g.owner,
                g.phone_number
            """,
            (gym_id,)
        )

        gym = cursor.fetchone()

        if not gym:
            return jsonify({"message": "Gym not found"}), 404

        return jsonify(gym), 200

    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()