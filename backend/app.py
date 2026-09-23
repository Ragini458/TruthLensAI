from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import os


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)
CORS(app)


# ==========================================
# MODEL PATHS
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml_model",
    "fake_news_model.pkl"
)

VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "ml_model",
    "tfidf_vectorizer.pkl"
)


# ==========================================
# LOAD MODEL
# ==========================================

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


print("================================")
print("TRUTHLENS AI API")
print("================================")
print("Model loaded successfully!")
print("")


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "project": "TruthLens AI",
        "message": "Fake News Detection API is running!",
        "status": "success"
    })


# ==========================================
# PREDICTION ROUTE
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No JSON data received"
        }), 400

    text = data.get("text", "").strip()

    if not text:
        return jsonify({
            "error": "Please provide article text"
        }), 400

    # Convert text into TF-IDF features
    text_vector = vectorizer.transform([text])

    # Prediction
    prediction = model.predict(text_vector)[0]

    # Probability
    probabilities = model.predict_proba(text_vector)[0]

    confidence = float(max(probabilities) * 100)

    # Label mapping
    if prediction == 0:
        result = "FAKE"
    else:
        result = "CREDIBLE"

    return jsonify({
        "result": result,
        "label": int(prediction),
        "confidence": round(confidence, 2)
    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )