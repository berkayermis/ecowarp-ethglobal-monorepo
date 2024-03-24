from flask import Flask, request, jsonify
import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

app = Flask(__name__)


def preprocess_casts(casts, tfidf_vectorizer):
    df = pd.DataFrame(casts, columns=["content"])
    df["content"] = df["content"].str.lower()
    X_new = tfidf_vectorizer.transform(df["content"])
    return X_new


@app.route("/predict", methods=["POST"])
def predict():
    # Load the trained model and TF-IDF vectorizer
    with open("trained_model.pkl", "rb") as file:
        model = pickle.load(file)

    with open("transformed_data.pkl", "rb") as file:
        data = pickle.load(file)
        tfidf_vectorizer = data["tfidf_vectorizer"]

    # Get new casts from the request
    new_casts = request.json.get("casts", [])

    # Preprocess and predict
    X_new = preprocess_casts(new_casts, tfidf_vectorizer)
    new_predictions = model.predict(X_new)

    # Convert predictions to readable categories
    predicted_categories = [
        data["label_encoder"].inverse_transform([pred])[0] for pred in new_predictions
    ]

    # Calculate category rates
    total_casts = len(predicted_categories)
    category_counts = {
        cat: predicted_categories.count(cat) for cat in predicted_categories
    }
    category_rates = {
        cat: round((count / total_casts) * 100, 2)
        for cat, count in category_counts.items()
    }

    # Return the category rates
    return jsonify({"statusCode": 200, "body": category_rates})


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=80)
