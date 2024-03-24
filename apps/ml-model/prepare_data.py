import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import pickle

# Load the dataset
df = pd.read_csv("data/casts.csv")

# Basic cleaning and preprocessing
# Remove rows with missing values
df.dropna(subset=["category", "content"], inplace=True)

# Text preprocessing
# Lowercase the content
df["content"] = df["content"].str.lower()

# Feature Extraction
# Using TF-IDF to convert text content to numerical format
tfidf_vectorizer = TfidfVectorizer(
    stop_words="english", max_features=1000
)  # Consider the top 1000 words only
X = tfidf_vectorizer.fit_transform(df["content"])

# Label Encoding for the category
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["category"])

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Save the transformed data and label encoders for later use
transformed_data = {
    "X_train": X_train,
    "X_test": X_test,
    "y_train": y_train,
    "y_test": y_test,
    "tfidf_vectorizer": tfidf_vectorizer,
    "label_encoder": label_encoder,
}

# Save the necessary objects for later use in model training and predictions
with open("data/transformed_data.pkl", "wb") as file:
    pickle.dump(transformed_data, file)
