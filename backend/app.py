from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.users import users_bp
from routes.exercises import exercises_bp
from routes.gyms import gyms_bp
from routes.workouts import workouts_bp
from routes.posts import posts_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(gyms_bp, url_prefix="/api/gyms")
app.register_blueprint(exercises_bp, url_prefix="/api/exercises")
app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
app.register_blueprint(posts_bp, url_prefix="/api/posts")

@app.route("/")
def home():
    return {"message": "Gym API running"}

@app.route("/test")
def test():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)