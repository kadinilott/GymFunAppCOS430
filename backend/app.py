from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"message": "Gym API running"}

@app.route("/test")
def test():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)