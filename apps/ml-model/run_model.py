import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd


# Function to preprocess new casts similar to how the training data was processed
def preprocess_casts(casts, tfidf_vectorizer):
    # Assuming 'casts' is a list of strings (the new casts)
    # Convert the list of casts into a pandas DataFrame
    df = pd.DataFrame(casts, columns=["content"])

    # Lowercase the content (assuming this was done in your original preprocessing)
    df["content"] = df["content"].str.lower()

    # Transform the content using the loaded TF-IDF vectorizer
    X_new = tfidf_vectorizer.transform(df["content"])

    return X_new


# Load the trained model and the TF-IDF vectorizer
with open("model/trained_model.pkl", "rb") as file:
    model = pickle.load(file)

with open("data/transformed_data.pkl", "rb") as file:
    data = pickle.load(file)
    tfidf_vectorizer = data["tfidf_vectorizer"]  # Assuming this is how you stored it

# List of new casts to classify
new_casts = [
    "The year is 2024, I’m on book 3",
    "Your NFT mints” sounds like something I already own vs recommended mints – which is what these actually are, I guess? Maybe “NFT mints for you” or something along these lines would be a better title.",
    "If you don’t know what Blobs is – today is the day.",
    "Ready for takeoff",
]

# Preprocess the new casts
X_new = preprocess_casts(new_casts, tfidf_vectorizer)

# Make predictions
new_predictions = model.predict(X_new)

# Convert numerical predictions back to category names
predicted_categories = [
    data["label_encoder"].inverse_transform([pred])[0] for pred in new_predictions
]

prediction_counts = {}
for cast, category in zip(new_casts, predicted_categories):
    if category in prediction_counts:
        prediction_counts[category].append(cast)
    else:
        prediction_counts[category] = [cast]

# Sort categories from most encountered to least
sorted_categories = sorted(
    prediction_counts.items(), key=lambda item: len(item[1]), reverse=True
)

# Print sorted results
for category, casts in sorted_categories:
    print(f"Category: {category} (Total: {len(casts)})")
    for cast in casts:
        print(f"- Cast: {cast}")
    print("\n")
