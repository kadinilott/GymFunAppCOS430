from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.users import users_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(users_bp, url_prefix="/api/users")

@app.route("/")
def home():
    return {"message": "Gym API running"}

@app.route("/test")
def test():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)