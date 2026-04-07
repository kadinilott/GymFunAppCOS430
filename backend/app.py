from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"message": "Gym API running"}

@app.route("/gyms", methods=["GET"])
def get_gyms():
    return jsonify([
        {"id": 1, "name": "Iron Forge Gym", "city": "Boston"},
        {"id": 2, "name": "Peak Performance", "city": "New York"}
    ])

if __name__ == "__main__":
    app.run(debug=True)