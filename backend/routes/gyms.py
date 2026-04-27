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

@gyms_bp.route("/<int:gym_id>/leaderboards", methods=["GET"])
def get_gym_leaderboards(gym_id):
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
                COUNT(DISTINCT DATE(w.completed_at)) AS workout_days
            FROM workouts w
            JOIN users u ON w.user_id = u.user_id
            WHERE w.gym_id = %s AND w.completed_at IS NOT NULL
            GROUP BY u.user_id, u.name
            ORDER BY workout_days DESC
            LIMIT 10
            """,
            (gym_id,)
        )
        most_workouts = cursor.fetchall()
        cursor.execute(
            """
            SELECT
                u.user_id,
                u.name,
                SUM(COALESCE(ws.reps,0) * COALESCE(ws.weight,0)) AS total_weight
            FROM workouts w
            JOIN workout_exercises we ON w.workout_id = we.workout_id
            JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
            JOIN users u ON w.user_id = u.user_id
            WHERE w.gym_id = %s AND w.completed_at IS NOT NULL
            GROUP BY u.user_id, u.name
            ORDER BY total_weight DESC
            LIMIT 10
            """,
            (gym_id,)
        )
        total_weight = cursor.fetchall()
        cursor.execute(
            """
            SELECT user_id, DATE(completed_at) AS workout_date
            FROM workouts
            WHERE gym_id = %s AND completed_at IS NOT NULL
            ORDER BY user_id, workout_date
            """,
            (gym_id,)
        )

        rows = cursor.fetchall()

        from collections import defaultdict
        from datetime import timedelta

        user_dates = defaultdict(list)

        for r in rows:
            user_dates[r["user_id"]].append(r["workout_date"])

        streaks = []

        for user_id, dates in user_dates.items():
            dates = sorted(set(dates))

            longest = 1
            current = 1

            for i in range(1, len(dates)):
                if dates[i] == dates[i-1] + timedelta(days=1):
                    current += 1
                    longest = max(longest, current)
                else:
                    current = 1

            cursor.execute(
                "SELECT name FROM users WHERE user_id = %s",
                (user_id,)
            )
            name = cursor.fetchone()["name"]

            streaks.append({
                "user_id": user_id,
                "name": name,
                "streak": longest
            })

        streaks = sorted(streaks, key=lambda x: x["streak"], reverse=True)[:10]

        cursor.execute(
            """
            SELECT
                e.name,
                u.user_id,
                u.name AS user_name,
                SUM(ws.reps * ws.weight) AS total_weight
            FROM workouts w
            JOIN workout_exercises we ON w.workout_id = we.workout_id
            JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
            JOIN exercises e ON we.exercise_id = e.exercise_id
            JOIN users u ON w.user_id = u.user_id
            WHERE w.gym_id = %s
              AND w.completed_at IS NOT NULL
              AND e.name IN ('Bench Press', 'Squat', 'Deadlift')
            GROUP BY e.name, u.user_id
            ORDER BY total_weight DESC
            """,
            (gym_id,)
        )

        exercise_volume = cursor.fetchall()

        cursor.execute(
            """
            SELECT
                e.name,
                u.user_id,
                u.name AS user_name,
                u.weight AS bodyweight,
                MAX(ws.weight) AS max_lift
            FROM workouts w
            JOIN workout_exercises we ON w.workout_id = we.workout_id
            JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
            JOIN exercises e ON we.exercise_id = e.exercise_id
            JOIN users u ON w.user_id = u.user_id
            WHERE w.gym_id = %s
              AND w.completed_at IS NOT NULL
              AND e.name IN ('Bench Press', 'Squat', 'Deadlift')
            GROUP BY e.name, u.user_id
            """,
            (gym_id,)
        )

        max_lifts_raw = cursor.fetchall()

        def get_weight_class(weight):
            if weight is None:
                return "Unknown"
            if weight <= 100:
                return "<100"
            if weight >= 250:
                return "250+"

            lower = ((int(weight) - 101) // 15) * 15 + 101
            upper = lower + 14
            return f"{lower}-{upper}"
        
        from collections import defaultdict

        max_lifts = defaultdict(lambda: defaultdict(list))

        for row in max_lifts_raw:
            wc = get_weight_class(row["bodyweight"])

            max_lifts[row["name"]][wc].append({
                "user_id": row["user_id"],
                "name": row["user_name"],
                "max_lift": row["max_lift"]
            })

        # sort each class
        for exercise in max_lifts:
            for wc in max_lifts[exercise]:
                max_lifts[exercise][wc] = sorted(
                    max_lifts[exercise][wc],
                    key=lambda x: x["max_lift"],
                    reverse=True
                )[:10]

        return jsonify({
            "gym_leaderboards": {
                "most_workouts": most_workouts,
                "longest_streak": streaks,
                "total_weight": total_weight
            },
            "exercise_leaderboards": {
                "total_volume": exercise_volume,
                "max_lifts": max_lifts
            }
        }), 200
    
    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()